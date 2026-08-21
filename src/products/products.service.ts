import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type ProductSearchAnalysis = {
  keywords: string[];
  categoryHints: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc';
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async list(
    search?: string,
    page = 1,
    limit = 20,
    categoryId?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  ) {
    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.listPrice = {};
      if (minPrice !== undefined && !Number.isNaN(minPrice)) {
        where.listPrice.gte = minPrice;
      }
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
        where.listPrice.lte = maxPrice;
      }
    }

    const safeSortFields = new Set([
      'sku',
      'name',
      'listPrice',
      'costPrice',
      'taxRate',
      'createdAt',
      'updatedAt',
    ]);
    const normalizedSortBy = safeSortFields.has(sortBy) ? sortBy : 'createdAt';
    const normalizedSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const total = await this.prisma.product.count({
      where: Object.keys(where).length ? where : undefined,
    });
    const data = await this.prisma.product.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { [normalizedSortBy]: normalizedSortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      sortBy: normalizedSortBy,
      sortOrder: normalizedSortOrder,
      categoryId,
      minPrice,
      maxPrice,
    };
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async semanticSearch(query: string, page = 1, limit = 10) {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return this.list(undefined, page, limit);
    }

    const analysis = await this.analyzeProductQuery(normalizedQuery);
    const where = this.buildSemanticProductWhere(normalizedQuery, analysis);
    const orderBy = this.getSemanticOrderBy(analysis);

    const total = await this.prisma.product.count({ where });
    const data = await this.prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      query: normalizedQuery,
      analysis,
    };
  }

  private async analyzeProductQuery(query: string): Promise<ProductSearchAnalysis> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      return this.analyzeProductQueryLocally(query);
    }

    try {
      const model = this.config.get<string>('OPENAI_QUERY_MODEL') ?? 'gpt-5';
      const configuredTimeout = Number(this.config.get<string>('OPENAI_TIMEOUT_MS') ?? 8000);
      const timeoutMs = Number.isFinite(configuredTimeout)
        ? Math.min(Math.max(configuredTimeout, 1000), 15000)
        : 8000;
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model,
          store: false,
          max_output_tokens: 300,
          instructions:
            'Bạn phân tích câu mô tả tìm sản phẩm của khách hàng Việt Nam. Chỉ trả JSON theo schema. Từ khóa nên ngắn, sát sản phẩm, bỏ từ xã giao.',
          input: query,
          text: {
            format: {
              type: 'json_schema',
              name: 'product_search_analysis',
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  keywords: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  categoryHints: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  minPrice: { type: ['number', 'null'] },
                  maxPrice: { type: ['number', 'null'] },
                  sortBy: {
                    type: 'string',
                    enum: ['relevance', 'price_asc', 'price_desc'],
                  },
                },
                required: ['keywords', 'categoryHints', 'minPrice', 'maxPrice', 'sortBy'],
              },
            },
          },
        }),
      });

      if (!response.ok) {
        return this.analyzeProductQueryLocally(query);
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const parsed = this.parseOpenAiJsonOutput(payload);
      return this.normalizeAnalysis(parsed, query);
    } catch {
      return this.analyzeProductQueryLocally(query);
    }
  }

  private parseOpenAiJsonOutput(payload: Record<string, unknown>) {
    const outputText = payload.output_text;
    if (typeof outputText === 'string') {
      return JSON.parse(outputText) as Partial<ProductSearchAnalysis>;
    }

    const output = Array.isArray(payload.output) ? payload.output : [];
    const text = output
      .flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const content = (item as { content?: unknown }).content;
        return Array.isArray(content) ? content : [];
      })
      .map((content) => {
        if (!content || typeof content !== 'object') return '';
        const value = content as { text?: unknown };
        return typeof value.text === 'string' ? value.text : '';
      })
      .join('');

    return JSON.parse(text || '{}') as Partial<ProductSearchAnalysis>;
  }

  private analyzeProductQueryLocally(query: string): ProductSearchAnalysis {
    const normalized = this.normalizeSearchText(query);
    const tokens = normalized
      .split(/[^a-z0-9]+/g)
      .filter((token) => token.length > 1 && !this.productSearchStopWords.has(token));
    const pricePreference = this.extractPricePreference(normalized);
    const categoryHints = ['laptop', 'ban phim', 'tai nghe', 'man hinh', 'giay', 'may in', 'qua']
      .filter((hint) => normalized.includes(hint));

    return {
      keywords: [...new Set(tokens)].slice(0, 8),
      categoryHints,
      ...pricePreference,
      sortBy: normalized.includes('re') || normalized.includes('gia re') ? 'price_asc' : 'relevance',
    };
  }

  private normalizeAnalysis(
    analysis: Partial<ProductSearchAnalysis>,
    originalQuery: string,
  ): ProductSearchAnalysis {
    const fallback = this.analyzeProductQueryLocally(originalQuery);
    const keywords = Array.isArray(analysis.keywords)
      ? analysis.keywords.filter((item): item is string => typeof item === 'string')
      : fallback.keywords;
    const categoryHints = Array.isArray(analysis.categoryHints)
      ? analysis.categoryHints.filter((item): item is string => typeof item === 'string')
      : fallback.categoryHints;

    return {
      keywords: [...new Set([...keywords, ...fallback.keywords])].slice(0, 10),
      categoryHints: [...new Set([...categoryHints, ...fallback.categoryHints])].slice(0, 6),
      minPrice:
        typeof analysis.minPrice === 'number' && !Number.isNaN(analysis.minPrice)
          ? analysis.minPrice
          : fallback.minPrice,
      maxPrice:
        typeof analysis.maxPrice === 'number' && !Number.isNaN(analysis.maxPrice)
          ? analysis.maxPrice
          : fallback.maxPrice,
      sortBy:
        analysis.sortBy === 'price_asc' || analysis.sortBy === 'price_desc'
          ? analysis.sortBy
          : fallback.sortBy,
    };
  }

  private buildSemanticProductWhere(
    query: string,
    analysis: ProductSearchAnalysis,
  ): Prisma.ProductWhereInput {
    const terms = [...new Set([query, ...analysis.keywords, ...analysis.categoryHints])]
      .map((term) => term.trim())
      .filter(Boolean);
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (terms.length > 0) {
      where.OR = terms.flatMap((term) => [
        { sku: { contains: term, mode: 'insensitive' as const } },
        { name: { contains: term, mode: 'insensitive' as const } },
        { category: { is: { name: { contains: term, mode: 'insensitive' as const } } } },
      ]);
    }

    if (analysis.minPrice !== undefined || analysis.maxPrice !== undefined) {
      where.listPrice = {};
      if (analysis.minPrice !== undefined) {
        where.listPrice.gte = analysis.minPrice;
      }
      if (analysis.maxPrice !== undefined) {
        where.listPrice.lte = analysis.maxPrice;
      }
    }

    return where;
  }

  private getSemanticOrderBy(analysis: ProductSearchAnalysis): Prisma.ProductOrderByWithRelationInput {
    if (analysis.sortBy === 'price_asc') return { listPrice: 'asc' };
    if (analysis.sortBy === 'price_desc') return { listPrice: 'desc' };
    return { updatedAt: 'desc' };
  }

  private normalizeSearchText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase();
  }

  private parsePriceValue(value: string, unit?: string) {
    const numericValue = Number(value.replace(',', '.'));
    if (Number.isNaN(numericValue)) return null;

    const normalizedUnit = this.normalizeSearchText(unit ?? '');
    if (['trieu', 'tr', 'm'].includes(normalizedUnit)) return numericValue * 1000000;
    if (['k', 'nghin', 'ngan'].includes(normalizedUnit)) return numericValue * 1000;
    if (numericValue < 1000) return numericValue * 1000000;
    return numericValue;
  }

  private extractPricePreference(normalizedQuery: string) {
    const matches = [
      ...normalizedQuery.matchAll(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|k|nghin|ngan)?/g),
    ];
    const values = matches
      .map((match) => this.parsePriceValue(match[1], match[2]))
      .filter((value): value is number => value !== null);

    if (values.length === 0) return {};

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const wantsMax = /\b(duoi|toi da|khong qua|nho hon|re|gia re)\b/.test(normalizedQuery);
    const wantsMin = /\b(tren|tu|lon hon|cao cap|premium)\b/.test(normalizedQuery);

    if (values.length >= 2) return { minPrice: minValue, maxPrice: maxValue };
    if (wantsMax) return { maxPrice: values[0] };
    if (wantsMin) return { minPrice: values[0] };
    return { maxPrice: values[0] };
  }

  private readonly productSearchStopWords = new Set([
    'anh',
    'ban',
    'can',
    'cho',
    'co',
    'cua',
    'de',
    'do',
    'em',
    'gi',
    'hang',
    'khach',
    'la',
    'loai',
    'minh',
    'mon',
    'mot',
    'mua',
    'nao',
    'san',
    'pham',
    'tim',
    'toi',
    'tu',
    'van',
    'voi',
  ]);

  async get(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.get(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
