import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    // Menggunakan prisma.pengguna sesuai dengan nama model di schema
    const users = await this.prisma.pengguna.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        waktuDibuat: true, // Karena di schema Anda ada waktuDibuat, kita bisa menampilkannya
      },
      orderBy: {
        waktuDibuat: 'desc', // Urutkan dari pengguna terbaru
      },
    });
    return users;
  }

  async updateRole(id: string, newRole: Role) {
    const user = await this.prisma.pengguna.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    return this.prisma.pengguna.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, nama: true, email: true, role: true }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
