import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(search?: string, page = 1, limit = 20) {
    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const total = await this.prisma.customer.count({ where });
    const data = await this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async get(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { contacts: true, addresses: true },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.get(id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
