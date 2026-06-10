import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // tambah user / registrasi
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
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    };
  }

  // login session — sekarang return JWT token
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

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      nama: user.nama,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      message: 'Login berhasil',
      access_token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
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

  //update data user
  async updateProfile(userId: string, data: UpdateUserDto) {
    return this.prisma.pengguna.update({
      where: { id: userId },
      data,
    });
  }

  // --- FORGOT PASSWORD LOGIC ---

  async requestResetPassword(email: string) {
    const user = await this.prisma.pengguna.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email tidak terdaftar');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15); // Expire in 15 mins

    await this.prisma.pengguna.update({
      where: { email },
      data: {
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: expiry,
      },
    });

    // SIMULASI: Log ke console (karena tidak ada SMTP)
    console.log(`[FORGOT PASSWORD] OTP untuk ${email}: ${otp}`);

    return {
      message: 'Kode OTP telah dikirim ke email Anda (Simulasi)',
      // Untuk kemudahan testing, kembalikan OTP jika di env development
      otp: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyResetOtp(email: string, otp: string) {
    const user = await this.prisma.pengguna.findUnique({
      where: { email },
    });

    if (!user || user.resetPasswordOtp !== otp) {
      throw new BadRequestException('Kode OTP salah');
    }

    if (new Date() > (user.resetPasswordOtpExpiry || new Date())) {
      throw new BadRequestException('Kode OTP telah kadaluarsa');
    }

    return { message: 'OTP valid' };
  }

  async resetPassword(email: string, otp: string, kataSandiBaru: string) {
    const user = await this.prisma.pengguna.findUnique({
      where: { email },
    });

    if (!user || user.resetPasswordOtp !== otp) {
      throw new BadRequestException('Gagal mereset password: OTP tidak valid');
    }

    const hashedPassword = await bcrypt.hash(kataSandiBaru, 10);

    await this.prisma.pengguna.update({
      where: { email },
      data: {
        kataSandi: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordOtpExpiry: null,
      },
    });

    return { message: 'Password berhasil diperbarui' };
  }

  // helper
  async validateUser(userId: string) {
    const user = await this.prisma.pengguna.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Unauthorized');
    }

    return user;
  }
}