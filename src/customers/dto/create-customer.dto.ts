import { CustomerType } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(CustomerType)
  type: CustomerType;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  paymentTermDays?: number;
}
