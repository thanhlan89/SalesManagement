import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

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
