import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, InvoiceStatus } from '@prisma/client';
import { BillingService } from './billing.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // DELIVERIES
  @Get('deliveries')
  listDeliveries(@Query('salesOrderId') salesOrderId?: string) {
    return this.billingService.listDeliveries(salesOrderId);
  }

  @Get('deliveries/:id')
  getDeliveryById(@Param('id') id: string) {
    return this.billingService.getDeliveryById(id);
  }

  // INVOICES
  @Get('invoices')
  listInvoices(@Query('status') status?: string) {
    return this.billingService.listInvoices(status);
  }

  @Get('invoices/:id')
  getInvoiceById(@Param('id') id: string) {
    return this.billingService.getInvoiceById(id);
  }

  @Post('invoices/from-sales-order/:salesOrderId')
  @Roles(UserRole.accountant, UserRole.manager)
  createInvoiceFromSalesOrder(
    @Param('salesOrderId') salesOrderId: string,
    @Body('dueDate') dueDate: string,
  ) {
    return this.billingService.createInvoiceFromSalesOrder(
      salesOrderId,
      new Date(dueDate),
    );
  }

  @Put('invoices/:id/status')
  @Roles(UserRole.accountant, UserRole.manager)
  updateInvoiceStatus(
    @Param('id') id: string,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.billingService.updateInvoiceStatus(id, status);
  }

  @Post('invoices/check-overdue')
  @Roles(UserRole.accountant, UserRole.manager)
  checkOverdueInvoices() {
    return this.billingService.checkOverdueInvoices();
  }

  // PAYMENTS
  @Get('payments')
  listPayments(@Query('invoiceId') invoiceId?: string) {
    return this.billingService.listPayments(invoiceId);
  }

  @Get('payments/:id')
  getPaymentById(@Param('id') id: string) {
    return this.billingService.getPaymentById(id);
  }

  @Post('payments')
  @Roles(UserRole.accountant, UserRole.manager)
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.billingService.createPayment(dto);
  }

  @Put('payments/:id/confirm')
  @Roles(UserRole.accountant, UserRole.manager)
  confirmPayment(@Param('id') id: string) {
    return this.billingService.confirmPayment(id);
  }

  @Post('payments/:id/refund')
  @Roles(UserRole.accountant, UserRole.manager)
  refundPayment(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.billingService.refundPayment(id, reason);
  }
}
