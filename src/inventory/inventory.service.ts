import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listWarehouses() {
    const data = await this.prisma.warehouse.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  createWarehouse(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data: dto });
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

  async updateWarehouse(id: string, dto: UpdateWarehouseDto) {
    await this.getWarehouse(id);
    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async removeWarehouse(id: string) {
    await this.getWarehouse(id);
    return this.prisma.warehouse.delete({ where: { id } });
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

  async createMovement(dto: CreateInventoryMovementDto) {
    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({ data: dto });

      const balance = await tx.inventoryBalance.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
        create: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          quantityOnHand: dto.type === 'stock_in' ? dto.quantity : 0,
          quantityReserved: 0,
          quantityAvailable: dto.type === 'stock_in' ? dto.quantity : 0,
        },
        update: {
          quantityOnHand: {
            increment:
              dto.type === 'stock_in' || dto.type === 'transfer'
                ? dto.quantity
                : -dto.quantity,
          },
          quantityAvailable: {
            increment:
              dto.type === 'stock_in' || dto.type === 'transfer'
                ? dto.quantity
                : -dto.quantity,
          },
        },
      });

      if (balance.quantityOnHand < 0 || balance.quantityAvailable < 0) {
        throw new Error('Inventory balance cannot be negative');
      }

      return movement;
    });
  }
}
