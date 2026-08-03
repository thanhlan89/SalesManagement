import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.admin)
  list(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe('1'), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe('20'), ParseIntPipe) limit = 20,
  ) {
    return this.usersService.list(search, page, limit);
  }

  @Post()
  @Roles(UserRole.admin)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.get(user.id);
  }

  @Get(':id')
  @Roles(UserRole.admin)
  get(@Param('id') id: string) {
    return this.usersService.get(id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
