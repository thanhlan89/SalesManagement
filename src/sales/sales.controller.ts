import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestUser } from '../common/types/request-user.type';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { SalesService } from './sales.service';

@UseGuards(JwtAuthGuard)
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
}
