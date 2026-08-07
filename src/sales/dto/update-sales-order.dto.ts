import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesOrderDto, CreateSalesOrderItemDto } from './create-sales-order.dto';

export class UpdateSalesOrderDto extends PartialType(CreateSalesOrderDto) {
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items?: CreateSalesOrderItemDto[];
}
