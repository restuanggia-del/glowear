import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Map and create - username auto-generated from email if not provided
    const data = {
      ...createUserDto,
      username: createUserDto.username || createUserDto.email.split('@')[0],
    };
    return this.prisma.pengguna.create({
      data,
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        noTelp: true,
        alamat: true,
        waktuDibuat: true,
      },
    });
  }

  async findAll() {
    const users = await this.prisma.pengguna.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        noTelp: true,
        alamat: true,
        waktuDibuat: true,
      },
      orderBy: {
        waktuDibuat: 'desc',
      },
    });
    // Map noTelp to noTelepon for frontend compatibility
    return users.map(user => ({
      ...user,
      noTelepon: user.noTelp,
    }));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.pengguna.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.pengguna.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    // Map frontend fields
    const data: any = { ...updateUserDto };
    if (data.kataSandi) {
      data.kataSandi = data.kataSandi; // Plain text for now; add bcrypt later if needed
    }
    // noTelepon -> noTelp already handled by DTO PartialType

    return this.prisma.pengguna.update({
      where: { id },
      data,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        noTelp: true,
        alamat: true,
      },
    });
  }

  async updateRole(id: string, newRole: Role) {
    const user = await this.prisma.pengguna.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    return this.prisma.pengguna.update({
      where: { id },
      data: { role: newRole },
    });
  }

  async remove(id: string): Promise<User> {
    const user = await this.prisma.pengguna.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return this.prisma.pengguna.delete({
      where: { id },
    });
  }
}
