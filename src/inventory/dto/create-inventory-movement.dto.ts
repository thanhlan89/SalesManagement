import { InventoryMovementType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateInventoryMovementDto {
  @IsString()
  warehouseId: string;

  @IsString()
  productId: string;

  @IsEnum(InventoryMovementType)
  type: InventoryMovementType;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}
