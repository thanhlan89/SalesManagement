import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateQuoteDto, CreateQuoteItemDto } from './dto/create-quote.dto';
import { CreateSalesOrderDto, CreateSalesOrderItemDto } from './dto/create-sales-order.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  listQuotes() {
    return this.prisma.quote.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuote(createdById: string, dto: CreateQuoteDto) {
    const totals = this.calculateTotals(dto.items);
    return this.prisma.quote.create({
      data: {
        code: `QT-${Date.now()}`,
        customerId: dto.customerId,
        opportunityId: dto.opportunityId,
        createdById,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        note: dto.note,
        ...totals,
        items: {
          create: dto.items.map((item) => ({
            ...item,
            taxAmount: 0,
            lineTotal: this.calculateLineTotal(item),
          })),
        },
      },
      include: { items: true },
    });
  }

  async getQuote(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    return quote;
  }

  listSalesOrders() {
    return this.prisma.salesOrder.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSalesOrder(createdById: string, dto: CreateSalesOrderDto) {
    const totals = this.calculateTotals(dto.items);
    return this.prisma.salesOrder.create({
      data: {
        code: `SO-${Date.now()}`,
        customerId: dto.customerId,
        quoteId: dto.quoteId,
        createdById,
        billingAddressId: dto.billingAddressId,
        shippingAddressId: dto.shippingAddressId,
        expectedDeliveryDate: dto.expectedDeliveryDate
          ? new Date(dto.expectedDeliveryDate)
          : undefined,
        note: dto.note,
        ...totals,
        items: {
          create: dto.items.map((item) => ({
            ...item,
            taxAmount: 0,
            lineTotal: this.calculateLineTotal(item),
          })),
        },
      },
      include: { items: true },
    });
  }

  async getSalesOrder(id: string) {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true, deliveries: true, invoice: true },
    });
    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }
    return salesOrder;
  }

  private calculateTotals(items: Array<CreateQuoteItemDto | CreateSalesOrderItemDto>) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const discountAmount = items.reduce(
      (sum, item) => sum + (item.discountAmount ?? 0),
      0,
    );
    const taxAmount = 0;
    const totalAmount = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, totalAmount };
  }

  private calculateLineTotal(item: CreateQuoteItemDto | CreateSalesOrderItemDto) {
    return item.quantity * item.unitPrice - (item.discountAmount ?? 0);
  }
}
