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

const catalog: CatalogItem[] = [
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
