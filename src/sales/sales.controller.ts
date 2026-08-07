import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RequestUser } from '../common/types/request-user.type';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesService } from './sales.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('quotes')
  listQuotes() {
    return this.salesService.listQuotes();
  }

  @Post('quotes')
  createQuote(@CurrentUser() user: RequestUser, @Body() dto: CreateQuoteDto) {
    return this.salesService.createQuote(user.id, dto);
  }

  @Get('quotes/:id')
  getQuote(@Param('id') id: string) {
    return this.salesService.getQuote(id);
  }

  @Patch('quotes/:id')
  updateQuote(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.salesService.updateQuote(id, dto);
  }

  @Delete('quotes/:id')
  removeQuote(@Param('id') id: string) {
    return this.salesService.removeQuote(id);
  }

  @Get('sales-orders')
  listSalesOrders() {
    return this.salesService.listSalesOrders();
  }

  @Post('sales-orders')
  createSalesOrder(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateSalesOrderDto,
  ) {
    return this.salesService.createSalesOrder(user.id, dto);
  }

  @Get('sales-orders/:id')
  getSalesOrder(@Param('id') id: string) {
    return this.salesService.getSalesOrder(id);
  }

  @Patch('sales-orders/:id')
  updateSalesOrder(@Param('id') id: string, @Body() dto: UpdateSalesOrderDto) {
    return this.salesService.updateSalesOrder(id, dto);
  }

  @Delete('sales-orders/:id')
  removeSalesOrder(@Param('id') id: string) {
    return this.salesService.removeSalesOrder(id);
  }
}
