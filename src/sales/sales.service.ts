import { Injectable, NotFoundException } from '@nestjs/common';
import { QuoteItem, SalesOrderItem } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateQuoteDto, CreateQuoteItemDto } from './dto/create-quote.dto';
import { CreateSalesOrderDto, CreateSalesOrderItemDto } from './dto/create-sales-order.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

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

  async updateQuote(id: string, dto: UpdateQuoteDto) {
    const quote = await this.getQuote(id);
    return this.prisma.quote.update({
      where: { id },
      data: {
        customerId: dto.customerId ?? quote.customerId,
        opportunityId: dto.opportunityId ?? quote.opportunityId,
        status: dto.status ?? quote.status,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : quote.validUntil,
        note: dto.note ?? quote.note,
        ...this.calculateTotals(dto.items ?? quote.items),
        items: dto.items
          ? {
              deleteMany: {},
              create: dto.items.map((item) => ({
                ...item,
                taxAmount: 0,
                lineTotal: this.calculateLineTotal(item),
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  async removeQuote(id: string) {
    await this.getQuote(id);
    return this.prisma.quote.delete({ where: { id } });
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

  async updateSalesOrder(id: string, dto: UpdateSalesOrderDto) {
    const salesOrder = await this.getSalesOrder(id);
    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        customerId: dto.customerId ?? salesOrder.customerId,
        quoteId: dto.quoteId ?? salesOrder.quoteId,
        billingAddressId:
          dto.billingAddressId ?? salesOrder.billingAddressId,
        shippingAddressId:
          dto.shippingAddressId ?? salesOrder.shippingAddressId,
        expectedDeliveryDate: dto.expectedDeliveryDate
          ? new Date(dto.expectedDeliveryDate)
          : salesOrder.expectedDeliveryDate,
        note: dto.note ?? salesOrder.note,
        ...this.calculateTotals(dto.items ?? salesOrder.items),
        items: dto.items
          ? {
              deleteMany: {},
              create: dto.items.map((item) => ({
                ...item,
                taxAmount: 0,
                lineTotal: this.calculateLineTotal(item),
              })),
            }
          : undefined,
      },
      include: { items: true, deliveries: true, invoice: true },
    });
  }

  async removeSalesOrder(id: string) {
    await this.getSalesOrder(id);
    return this.prisma.salesOrder.delete({ where: { id } });
  }

  private calculateTotals(
    items: Array<
      | CreateQuoteItemDto
      | CreateSalesOrderItemDto
      | QuoteItem
      | SalesOrderItem
    >,
  ) {
    const subtotal = items.reduce((sum, item) => {
      return (
        sum + item.quantity * this.toNumber(item.unitPrice)
      );
    }, 0);
    const discountAmount = items.reduce((sum, item) => {
      return sum + this.toNumber(item.discountAmount);
    }, 0);
    const taxAmount = 0;
    const totalAmount = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, totalAmount };
  }

  private calculateLineTotal(
    item: CreateQuoteItemDto | CreateSalesOrderItemDto | QuoteItem | SalesOrderItem,
  ) {
    return (
      item.quantity * this.toNumber(item.unitPrice) -
      this.toNumber(item.discountAmount)
    );
  }

  private toNumber(value: number | { toNumber(): number } | null | undefined) {
    if (value === null || value === undefined) {
      return 0;
    }
    return typeof value === 'number' ? value : value.toNumber();
  }
}
