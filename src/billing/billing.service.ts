import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, PaymentStatus, SalesOrderStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  // DELIVERIES
  async listDeliveries(salesOrderId?: string) {
    const data = await this.prisma.delivery.findMany({
      where: salesOrderId ? { salesOrderId } : undefined,
      include: {
        salesOrder: {
          select: {
            code: true,
            customer: { select: { name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data, total: data.length };
  }

  async getDeliveryById(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        salesOrder: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery #${deliveryId} not found`);
    }

    return delivery;
  }

  // INVOICES
  async listInvoices(status?: string) {
    const data = await this.prisma.invoice.findMany({
      where: status ? { status: status as InvoiceStatus } : undefined,
      include: {
        salesOrder: {
          select: {
            code: true,
            customer: { select: { name: true, code: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data, total: data.length };
  }

  async getInvoiceById(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        salesOrder: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice #${invoiceId} not found`);
    }

    return this.enrichInvoiceData(invoice);
  }

  async createInvoiceFromSalesOrder(salesOrderId: string, dueDate: Date) {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { items: { include: { product: true } } },
    });

    if (!salesOrder) {
      throw new NotFoundException(`Sales Order #${salesOrderId} not found`);
    }

    if (salesOrder.status !== SalesOrderStatus.confirmed) {
      throw new BadRequestException('Sales Order must be confirmed before creating invoice');
    }

    // Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { salesOrderId },
    });

    if (existingInvoice) {
      throw new BadRequestException(`Invoice already exists for Sales Order #${salesOrderId}`);
    }

    // Calculate totals from sales order items
    let subtotal = 0;
    let taxAmount = 0;

    salesOrder.items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice.toNumber();
      subtotal += itemSubtotal;
      taxAmount += itemSubtotal * (item.product.taxRate.toNumber() / 100);
    });

    const totalAmount = subtotal + taxAmount;

    return this.prisma.invoice.create({
      data: {
        code: `INV-${Date.now()}`,
        salesOrderId,
        status: InvoiceStatus.draft,
        issuedDate: new Date(),
        dueDate,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
      },
      include: {
        salesOrder: true,
        payments: true,
      },
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice #${invoiceId} not found`);
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
      include: { salesOrder: true, payments: true },
    });
  }

  async checkOverdueInvoices() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        dueDate: { lt: today },
        status: {
          in: [InvoiceStatus.issued, InvoiceStatus.partially_paid],
        },
      },
      include: {
        salesOrder: { select: { customer: { select: { name: true } } } },
        payments: true,
      },
    });

    // Update status to overdue
    for (const invoice of overdueInvoices) {
      if (invoice.status !== InvoiceStatus.overdue) {
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.overdue },
        });
      }
    }

    return overdueInvoices;
  }

  // PAYMENTS
  async listPayments(invoiceId?: string) {
    const data = await this.prisma.payment.findMany({
      where: invoiceId ? { invoiceId } : undefined,
      include: {
        invoice: {
          select: {
            code: true,
            totalAmount: true,
            salesOrder: { select: { customer: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data, total: data.length };
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            salesOrder: { select: { customer: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment #${paymentId} not found`);
    }

    return payment;
  }

  async createPayment(dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice #${dto.invoiceId} not found`);
    }

    // Calculate total paid so far
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + p.amount.toNumber(),
      0,
    );

    // Validate payment amount
    const remainingAmount = invoice.totalAmount.toNumber() - totalPaid;
    if (dto.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount exceeds remaining invoice balance: ${remainingAmount}`,
      );
    }

    const newPaidAmount = totalPaid + dto.amount;

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        code: `PM-${Date.now()}`,
        invoiceId: dto.invoiceId,
        method: dto.method,
        amount: dto.amount.toString(),
        paidDate: new Date(dto.paidDate),
        transactionRef: dto.transactionRef,
        status: PaymentStatus.pending,
      },
    });

    // Update invoice paid amount and status
    let newStatus = invoice.status;
    if (newPaidAmount >= invoice.totalAmount.toNumber()) {
      newStatus = InvoiceStatus.paid;
    } else if (newPaidAmount > 0) {
      newStatus = InvoiceStatus.partially_paid;
    }

    await this.prisma.invoice.update({
      where: { id: dto.invoiceId },
      data: {
        paidAmount: newPaidAmount.toString(),
        status: newStatus,
      },
    });

    return this.getPaymentById(payment.id);
  }

  async confirmPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment #${paymentId} not found`);
    }

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.confirmed },
      include: { invoice: true },
    });
  }

  async refundPayment(paymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment #${paymentId} not found`);
    }

    if (payment.status === PaymentStatus.refunded) {
      throw new BadRequestException('Payment already refunded');
    }

    // Update payment status
    const refundedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.refunded,
        note: reason || null,
      },
    });

    // Recalculate invoice paid amount
    const remainingPayments = await this.prisma.payment.findMany({
      where: {
        invoiceId: payment.invoiceId,
        status: { not: PaymentStatus.refunded },
      },
    });

    const totalPaid = remainingPayments.reduce(
      (sum, p) => sum + p.amount.toNumber(),
      0,
    );

    // Update invoice status
    let newStatus: InvoiceStatus = InvoiceStatus.issued;
    if (totalPaid === payment.invoice.totalAmount.toNumber()) {
      newStatus = InvoiceStatus.paid;
    } else if (totalPaid > 0) {
      newStatus = InvoiceStatus.partially_paid;
    }

    await this.prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        paidAmount: totalPaid.toString(),
        status: newStatus,
      },
    });

    return refundedPayment;
  }

  // HELPER METHODS
  private enrichInvoiceData(invoice: any) {
    const remainingAmount = invoice.totalAmount.toNumber() - invoice.paidAmount.toNumber();
    const isPaid = invoice.paidAmount.toNumber() === invoice.totalAmount.toNumber();

    return {
      ...invoice,
      remainingAmount,
      isPaid,
      paymentCount: invoice.payments.length,
    };
  }
}
