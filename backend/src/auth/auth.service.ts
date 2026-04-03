import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.pengguna.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email atau username sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(data.kataSandi, 10);

    const user = await this.prisma.pengguna.create({
      data: {
        nama: data.nama,
        username: data.username,
        email: data.email,
        kataSandi: hashedPassword,
      },
    });

    return {
      message: 'Register berhasil',
      user,
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.pengguna.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(
      data.kataSandi,
      user.kataSandi,
    );

    if (!isMatch) {
      throw new BadRequestException('Password salah');
    }

    return {
      message: 'Login berhasil',
      user,
    };
  }

  // ambil data pengguna
  async getProfile(userId: string) {
  const user = await this.prisma.pengguna.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestException('User tidak ditemukan');
  }

  return user;
}
}