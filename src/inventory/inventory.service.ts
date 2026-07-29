import { Injectable } from '@nestjs/common';
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

  async listMovements(productId?: string) {
    const data = await this.prisma.inventoryMovement.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  createMovement(dto: CreateInventoryMovementDto) {
    return this.prisma.inventoryMovement.create({ data: dto });
  }
}
