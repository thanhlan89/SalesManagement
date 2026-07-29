import { Injectable } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async listDeliveries(salesOrderId?: string) {
    const data = await this.prisma.delivery.findMany({
      where: salesOrderId ? { salesOrderId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  async listInvoices(status?: string) {
    const data = await this.prisma.invoice.findMany({
      where: status ? { status: status as InvoiceStatus } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  async listPayments(invoiceId?: string) {
    const data = await this.prisma.payment.findMany({
      where: invoiceId ? { invoiceId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  createPayment(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        code: `PM-${Date.now()}`,
        invoiceId: dto.invoiceId,
        method: dto.method,
        amount: dto.amount,
        paidDate: new Date(dto.paidDate),
        transactionRef: dto.transactionRef,
      },
    });
  }
}
