import { PaymentMethod } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  invoiceId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  paidDate: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}
