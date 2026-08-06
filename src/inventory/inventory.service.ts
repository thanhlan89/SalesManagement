import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listWarehouses() {
    const data = await this.prisma.warehouse.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  async getWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { inventoryBalances: true, inventoryMovements: true },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async listBalances(productId?: string, warehouseId?: string) {
    const where: Record<string, any> = {};
    if (productId) {
      where.productId = productId;
    }
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const data = await this.prisma.inventoryBalance.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { updatedAt: 'desc' },
      include: { warehouse: true, product: true },
    });
    return { data };
  }

  async getBalance(id: string) {
    const balance = await this.prisma.inventoryBalance.findUnique({
      where: { id },
      include: { warehouse: true, product: true },
    });
    if (!balance) {
      throw new NotFoundException('Inventory balance not found');
    }
    return balance;
  }

  async listMovements(productId?: string, warehouseId?: string) {
    const where: Record<string, any> = {};
    if (productId) {
      where.productId = productId;
    }
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const data = await this.prisma.inventoryMovement.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: 'desc' },
      include: { warehouse: true, product: true },
    });
    return { data };
  }

  async getMovement(id: string) {
    const movement = await this.prisma.inventoryMovement.findUnique({
      where: { id },
      include: { warehouse: true, product: true },
    });
    if (!movement) {
      throw new NotFoundException('Inventory movement not found');
    }
    return movement;
  }

  createMovement(dto: CreateInventoryMovementDto) {
    return this.prisma.inventoryMovement.create({ data: dto });
  }
}
