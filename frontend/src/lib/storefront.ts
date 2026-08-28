export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  badge: string;
  description: string;
};

export type CatalogSearchResult = CatalogItem & {
  matchScore: number;
  matchReasons: string[];
};

export type CartLine = {
  itemId: string;
  quantity: number;
};

export type CustomerOrder = {
  id: string;
  email: string;
  placedAt: string;
  status: 'processing' | 'shipping' | 'completed';
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discountAmount: number;
  voucherCode?: string | null;
  total: number;
};

const ORDERS_KEY = 'sales_management_customer_orders';
const REVIEWS_KEY = 'sales_management_product_reviews';
const VOUCHERS_KEY = 'sales_management_vouchers';

const featuredCatalog: CatalogItem[] = [
  {
    id: 'p-1',
    name: 'Laptop Slim Pro 14',
    category: 'Thiết bị văn phòng',
    price: 18990000,
    rating: 4.9,
    stock: 18,
    badge: 'Bán chạy',
    description: 'Máy mỏng nhẹ, phù hợp cho công việc văn phòng và di chuyển.',
  },
  {
    id: 'p-2',
    name: 'Bàn phím cơ Silent',
    category: 'Phụ kiện',
    price: 1390000,
    rating: 4.8,
    stock: 42,
    badge: 'Giảm giá',
    description: 'Phím êm, layout gọn, phù hợp làm việc lâu dài.',
  },
  {
    id: 'p-3',
    name: 'Tai nghe ANC Work',
    category: 'Phụ kiện',
    price: 2590000,
    rating: 4.7,
    stock: 26,
    badge: 'Mới',
    description: 'Chống ồn chủ động, pin dài, có micro họp trực tuyến.',
  },
  {
    id: 'p-4',
    name: 'Ghế công thái học Air',
    category: 'Nội thất',
    price: 5690000,
    rating: 5.0,
    stock: 10,
    badge: 'Premium',
    description: 'Tựa lưng thoáng, đệm ngồi êm và hỗ trợ cột sống tốt.',
  },
  {
    id: 'p-5',
    name: 'Màn hình 27" QHD',
    category: 'Thiết bị văn phòng',
    price: 6990000,
    rating: 4.8,
    stock: 15,
    badge: 'Hot',
    description: 'Độ phân giải cao, màu sắc rõ, hợp cho làm việc đa nhiệm.',
  },
  {
    id: 'p-6',
    name: 'Bộ quà tặng khách hàng',
    category: 'Quà tặng',
    price: 790000,
    rating: 4.6,
    stock: 64,
    badge: 'Phổ biến',
    description: 'Set quà nhỏ gọn để tri ân hoặc tiếp cận khách hàng mới.',
  },
];

const generatedProductTemplates = [
  {
    category: 'Thiết bị văn phòng',
    names: ['Laptop', 'Màn hình', 'Webcam', 'Máy in', 'Máy chiếu'],
    features: 'phù hợp làm việc văn phòng, học tập và làm việc đa nhiệm',
  },
  {
    category: 'Phụ kiện',
    names: ['Tai nghe', 'Bàn phím cơ', 'Chuột không dây', 'Micro USB', 'Hub USB-C'],
    features: 'thiết kế gọn nhẹ, kết nối ổn định, phù hợp làm việc lâu dài',
  },
  {
    category: 'Nội thất',
    names: ['Ghế công thái học', 'Bàn nâng hạ', 'Đèn bàn', 'Kệ màn hình', 'Tựa chân'],
    features: 'tăng sự thoải mái, hỗ trợ tư thế và không gian làm việc tại nhà',
  },
  {
    category: 'Quà tặng',
    names: ['Bộ quà tặng', 'Sổ tay', 'Bình giữ nhiệt', 'Túi vải', 'Bút ký'],
    features: 'nhỏ gọn, lịch sự, phù hợp tri ân khách hàng và sự kiện doanh nghiệp',
  },
];

const generatedProductQualifiers = [
  'Work',
  'Pro',
  'Silent',
  'Air',
  'Flex',
  'Essential',
  'Premium',
  'Compact',
  'Connect',
  'Plus',
];

function createGeneratedCatalog(): CatalogItem[] {
  return Array.from({ length: 994 }, (_, index) => {
    const template = generatedProductTemplates[index % generatedProductTemplates.length];
    const name = template.names[index % template.names.length];
    const qualifier = generatedProductQualifiers[index % generatedProductQualifiers.length];
    const sequence = index + 7;

    return {
      id: `p-${sequence}`,
      name: `${name} ${qualifier} ${sequence}`,
      category: template.category,
      price: 450000 + ((index * 137000) % 18500000),
      rating: Number((4 + ((index % 10) / 10)).toFixed(1)),
      stock: (index * 17) % 81,
      badge: index % 7 === 0 ? 'Bán chạy' : index % 5 === 0 ? 'Mới' : 'Có sẵn',
      description: `${template.features}; mã sản phẩm mẫu ${sequence}.`,
    };
  });
}

const catalog: CatalogItem[] = [...featuredCatalog, ...createGeneratedCatalog()];

export type Voucher = {
  code: string;
  title: string;
  description: string;
  kind: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt: string;
};

const defaultVouchers: Voucher[] = [
  {
    code: 'WELCOME10',
    title: 'Giảm cho khách mới',
    description: 'Giảm 10% cho đơn hàng đầu tiên.',
    kind: 'percent',
    value: 10,
    minOrder: 500000,
    active: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    code: 'SHIP50',
    title: 'Ưu đãi phí ship',
    description: 'Giảm 50.000đ cho đơn từ 1.000.000đ.',
    kind: 'fixed',
    value: 50000,
    minOrder: 1000000,
    active: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    code: 'VIP15',
    title: 'Ưu đãi VIP',
    description: 'Giảm 15% cho khách VIP.',
    kind: 'percent',
    value: 15,
    minOrder: 2000000,
    active: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
];

function safeParseOrders(raw: string | null): CustomerOrder[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as CustomerOrder[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function getOrders() {
  return safeParseOrders(localStorage.getItem(ORDERS_KEY));
}

function safeParseVouchers(raw: string | null): Voucher[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Voucher[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function seedVouchers() {
  const current = safeParseVouchers(localStorage.getItem(VOUCHERS_KEY));
  if (current.length === 0) {
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(defaultVouchers));
    return defaultVouchers;
  }

  const merged = [...current];
  for (const voucher of defaultVouchers) {
    const exists = merged.some((item) => item.code.toLowerCase() === voucher.code.toLowerCase());
    if (!exists) merged.push(voucher);
  }

  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(merged));
  return merged;
}

export function getCatalog() {
  return catalog;
}

const stopWords = new Set([
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

const productIntentGroups = [
  {
    label: 'làm việc văn phòng',
    triggers: ['van phong', 'lam viec', 'cong viec', 'office', 'di chuyen'],
    keywords: ['van phong', 'lam viec', 'cong viec', 'di chuyen', 'da nhiem'],
  },
  {
    label: 'phụ kiện',
    triggers: ['phu kien', 'ban phim', 'tai nghe', 'phim', 'headphone'],
    keywords: ['phu kien', 'ban phim', 'tai nghe', 'phim', 'micro', 'chong on'],
  },
  {
    label: 'thoải mái lâu dài',
    triggers: ['em', 'thoai mai', 'cong thai hoc', 'ngoi lau', 'cot song'],
    keywords: ['em', 'thoang', 'cong thai hoc', 'cot song', 'ngoi'],
  },
  {
    label: 'quà tặng khách hàng',
    triggers: ['qua', 'tang', 'tri an', 'khach hang', 'set'],
    keywords: ['qua tang', 'tri an', 'khach hang', 'set qua'],
  },
  {
    label: 'họp trực tuyến',
    triggers: ['hop', 'online', 'truc tuyen', 'micro', 'chong on'],
    keywords: ['hop truc tuyen', 'micro', 'chong on', 'pin dai'],
  },
  {
    label: 'màn hình hiển thị',
    triggers: ['man hinh', 'hien thi', 'qhd', 'mau sac', 'da nhiem'],
    keywords: ['man hinh', 'qhd', 'mau sac', 'da nhiem', 'do phan giai'],
  },
];

const semanticSearchAliases = [
  { aliases: ['ngoi lau', 'dau lung', 'moi lung', 'ngoi thoai mai'], terms: ['cong thai hoc', 'cot song', 'ngoi', 'em'] },
  { aliases: ['nghe goi', 'nghe nhac', 'am thanh', 'hop truc tuyen'], terms: ['tai nghe', 'chong on', 'micro', 'pin dai'] },
  { aliases: ['im lang', 'yen tinh', 'khong on'], terms: ['chong on', 'silent'] },
  { aliases: ['lam viec nhieu cua so', 'da nhiem', 'nhieu ung dung'], terms: ['man hinh', 'qhd', 'da nhiem'] },
  { aliases: ['qua tang', 'tri an', 'tang khach', 'qua doanh nghiep'], terms: ['qua tang', 'set qua', 'khach hang'] },
  { aliases: ['mang di', 'nhe', 'di lai'], terms: ['mong nhe', 'di chuyen'] },
];

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function extractSearchTokens(value: string) {
  return normalizeSearchText(value)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function expandSemanticSearchTerms(normalizedMessage: string) {
  return semanticSearchAliases
    .filter((group) => group.aliases.some((alias) => normalizedMessage.includes(alias)))
    .flatMap((group) => group.terms.map(normalizeSearchText));
}

function parsePriceValue(value: string, unit?: string) {
  const numericValue = Number(value.replace(',', '.'));
  if (Number.isNaN(numericValue)) return null;

  const normalizedUnit = normalizeSearchText(unit ?? '');
  if (['trieu', 'tr', 'm'].includes(normalizedUnit)) return numericValue * 1000000;
  if (['k', 'nghin', 'ngan'].includes(normalizedUnit)) return numericValue * 1000;
  if (numericValue < 1000) return numericValue * 1000000;
  return numericValue;
}

function extractPricePreference(message: string) {
  const normalized = normalizeSearchText(message);
  const matches = [...normalized.matchAll(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|k|nghin|ngan)?/g)];
  const values = matches
    .map((match) => parsePriceValue(match[1], match[2]))
    .filter((value): value is number => value !== null);

  if (values.length === 0) return null;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const wantsMax = /\b(duoi|toi da|khong qua|nho hon|re|gia re)\b/.test(normalized);
  const wantsMin = /\b(tren|tu|lon hon|cao cap|premium)\b/.test(normalized);
  const wantsAround = /\b(tam|khoang|quanh|gan)\b/.test(normalized);

  if (values.length >= 2) {
    return { minPrice: minValue, maxPrice: maxValue };
  }

  if (wantsMax) return { maxPrice: values[0] };
  if (wantsMin) return { minPrice: values[0] };
  if (wantsAround) {
    return {
      minPrice: Math.max(0, values[0] * 0.8),
      maxPrice: values[0] * 1.2,
    };
  }

  return { maxPrice: values[0] };
}

export function searchCatalogByDescription(message: string, limit = 4): CatalogSearchResult[] {
  const normalizedMessage = normalizeSearchText(message);
  const tokens = [...new Set([...extractSearchTokens(message), ...expandSemanticSearchTerms(normalizedMessage)])];
  const pricePreference = extractPricePreference(message);

  if (!normalizedMessage.trim()) return [];

  return catalog
    .map((item) => {
      const reviewComments = getProductReviews(item.id)
        .map((review) => review.comment)
        .join(' ');
      const searchableText = normalizeSearchText(
        [item.name, item.category, item.description, item.badge, reviewComments].join(' '),
      );
      const normalizedName = normalizeSearchText(item.name);
      const normalizedCategory = normalizeSearchText(item.category);
      const normalizedBadge = normalizeSearchText(item.badge);
      let matchScore = 0;
      const reasons = new Set<string>();

      if (normalizedMessage.includes(normalizedName)) {
        matchScore += 10;
        reasons.add('đúng tên sản phẩm');
      }

      for (const token of tokens) {
        if (normalizedName.includes(token)) {
          matchScore += 4;
          reasons.add('trùng tên sản phẩm');
        } else if (normalizedCategory.includes(token)) {
          matchScore += 3;
          reasons.add('đúng danh mục');
        } else if (normalizedBadge.includes(token)) {
          matchScore += 2;
          reasons.add('đúng nhãn sản phẩm');
        } else if (searchableText.includes(token)) {
          if (normalizeSearchText(reviewComments).includes(token)) {
            matchScore += 3;
            reasons.add('phù hợp đánh giá khách hàng');
          } else {
            matchScore += 1.5;
            reasons.add('mô tả có đặc điểm này');
          }
        }
      }

      for (const group of productIntentGroups) {
        const hasTrigger = group.triggers.some((trigger) => normalizedMessage.includes(trigger));
        const hasProductKeyword = group.keywords.some((keyword) => searchableText.includes(keyword));

        if (hasTrigger && hasProductKeyword) {
          matchScore += 5;
          reasons.add(group.label);
        }
      }

      if (pricePreference?.minPrice !== undefined || pricePreference?.maxPrice !== undefined) {
        const isAboveMin =
          pricePreference.minPrice === undefined || item.price >= pricePreference.minPrice;
        const isBelowMax =
          pricePreference.maxPrice === undefined || item.price <= pricePreference.maxPrice;

        if (isAboveMin && isBelowMax) {
          matchScore += 4;
          reasons.add('phù hợp ngân sách');
        } else {
          matchScore -= 6;
        }
      }

      if (item.stock > 0) {
        matchScore += 0.5;
        reasons.add('còn hàng');
      }

      return {
        ...item,
        matchScore,
        matchReasons: [...reasons].slice(0, 3),
      };
    })
    .filter((item) => item.matchScore > 1)
    .sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating)
    .slice(0, limit);
}

export function getVouchers() {
  return seedVouchers().filter((voucher) => voucher.active);
}

export function getVoucherByCode(code: string) {
  const normalized = code.trim().toLowerCase();
  return getVouchers().find((voucher) => voucher.code.toLowerCase() === normalized) ?? null;
}

export function calculateVoucherDiscount(subtotal: number, voucher: Voucher | null) {
  if (!voucher || subtotal < voucher.minOrder) return 0;

  const discount =
    voucher.kind === 'percent' ? subtotal * (voucher.value / 100) : voucher.value;

  return Math.max(0, Math.min(discount, subtotal));
}

export function getAllOrders() {
  return getOrders().sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function getCatalogItem(id: string) {
  return catalog.find((item) => item.id === id) ?? null;
}

export function getCustomerOrders(email: string) {
  return getOrders()
    .filter((order) => order.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function placeOrder(
  email: string,
  lines: CartLine[],
  voucher?: Voucher | null,
) {
  const normalizedLines = lines
    .map((line) => {
      const item = getCatalogItem(line.itemId);
      if (!item || line.quantity <= 0) return null;

      return {
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: line.quantity,
      };
    })
    .filter(Boolean) as Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;

  if (normalizedLines.length === 0) return null;

  const subtotal = normalizedLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const discountAmount = calculateVoucherDiscount(subtotal, voucher ?? null);
  const total = subtotal - discountAmount;
  const order: CustomerOrder = {
    id: `ORD-${Date.now()}`,
    email,
    placedAt: new Date().toISOString(),
    status: 'processing',
    items: normalizedLines,
    subtotal,
    discountAmount,
    voucherCode: voucher?.code ?? null,
    total,
  };

  const nextOrders = [...getOrders(), order];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));
  return order;
}

export function updateOrderStatus(orderId: string, status: CustomerOrder['status']) {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index < 0) return null;

  orders[index] = {
    ...orders[index],
    status,
  };

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return orders[index];
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export type ProductReview = {
  id: string;
  productId: string;
  email: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function safeParseReviews(raw: string | null): ProductReview[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProductReview[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function getReviews() {
  return safeParseReviews(localStorage.getItem(REVIEWS_KEY));
}

export function getProductReviews(productId: string) {
  return getReviews()
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMyReviews(email: string) {
  return getReviews()
    .filter((review) => review.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function submitReview(input: {
  productId: string;
  email: string;
  name: string;
  rating: number;
  comment: string;
}) {
  if (!input.productId || !input.email || !input.name || input.rating < 1 || input.rating > 5) {
    return null;
  }

  const review: ProductReview = {
    id: `REV-${Date.now()}`,
    productId: input.productId,
    email: input.email,
    name: input.name,
    rating: input.rating,
    comment: input.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  const nextReviews = [...getReviews(), review];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(nextReviews));
  return review;
}

export function getProductReviewSummary(productId: string) {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) {
    return { count: 0, average: 0 };
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    count: reviews.length,
    average: Number((total / reviews.length).toFixed(1)),
  };
}
