import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  listPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;
}
