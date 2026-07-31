import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BillingService } from './billing.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('deliveries')
  listDeliveries(@Query('salesOrderId') salesOrderId?: string) {
    return this.billingService.listDeliveries(salesOrderId);
  }

  @Get('invoices')
  listInvoices(@Query('status') status?: string) {
    return this.billingService.listInvoices(status);
  }

  @Get('payments')
  listPayments(@Query('invoiceId') invoiceId?: string) {
    return this.billingService.listPayments(invoiceId);
  }

  @Post('payments')
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.billingService.createPayment(dto);
  }
}
