import { IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuoteDto, CreateQuoteItemDto } from './create-quote.dto';
import { QuoteStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items?: CreateQuoteItemDto[];
}
