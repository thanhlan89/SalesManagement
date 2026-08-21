import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const minPriceNumber = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNumber = maxPrice ? parseFloat(maxPrice) : undefined;

    return this.productsService.list(
      search,
      Number.isNaN(pageNumber) ? 1 : Math.max(pageNumber, 1),
      Number.isNaN(limitNumber) ? 20 : Math.max(limitNumber, 1),
      categoryId,
      minPriceNumber,
      maxPriceNumber,
      sortBy,
      sortOrder,
    );
  }

  @Get('semantic-search')
  semanticSearch(
    @Query('query') query = '',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return this.productsService.semanticSearch(
      query,
      Number.isNaN(pageNumber) ? 1 : Math.max(pageNumber, 1),
      Number.isNaN(limitNumber) ? 10 : Math.min(Math.max(limitNumber, 1), 50),
    );
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.productsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
