import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('warehouses')
  listWarehouses() {
    return this.inventoryService.listWarehouses();
  }

  @Get('inventory-movements')
  listMovements(@Query('productId') productId?: string) {
    return this.inventoryService.listMovements(productId);
  }

  @Post('inventory-movements')
  createMovement(@Body() dto: CreateInventoryMovementDto) {
    return this.inventoryService.createMovement(dto);
  }
}
