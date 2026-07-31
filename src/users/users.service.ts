import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  toPublicUser(user: User) {
    const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, ...publicUser } = user;
    return publicUser;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdWithRefreshHash(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async setRefreshTokenHash(id: string, refreshToken: string | null) {
    const refreshTokenHash = refreshToken
      ? await bcrypt.hash(refreshToken, 12)
      : null;

    await this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  async list() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: users.map((user) => this.toPublicUser(user)) };
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        phone: dto.phone,
      },
    });
    return this.toPublicUser(user);
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.get(id);

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        phone: dto.phone,
      },
    });
    return this.toPublicUser(user);
  }
}
