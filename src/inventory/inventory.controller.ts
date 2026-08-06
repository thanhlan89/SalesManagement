import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('warehouses')
  listWarehouses() {
    return this.inventoryService.listWarehouses();
  }

  @Post('warehouses')
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.inventoryService.createWarehouse(dto);
  }

  @Get('warehouses/:id')
  getWarehouse(@Param('id') id: string) {
    return this.inventoryService.getWarehouse(id);
  }

  @Patch('warehouses/:id')
  updateWarehouse(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.inventoryService.updateWarehouse(id, dto);
  }

  @Delete('warehouses/:id')
  removeWarehouse(@Param('id') id: string) {
    return this.inventoryService.removeWarehouse(id);
  }

  @Get('inventory-balances')
  listBalances(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.listBalances(productId, warehouseId);
  }

  @Get('inventory-balances/:id')
  getBalance(@Param('id') id: string) {
    return this.inventoryService.getBalance(id);
  }

  @Get('inventory-movements')
  listMovements(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.listMovements(productId, warehouseId);
  }

  @Get('inventory-movements/:id')
  getMovement(@Param('id') id: string) {
    return this.inventoryService.getMovement(id);
  }

  @Post('inventory-movements')
  createMovement(@Body() dto: CreateInventoryMovementDto) {
    return this.inventoryService.createMovement(dto);
  }
}
