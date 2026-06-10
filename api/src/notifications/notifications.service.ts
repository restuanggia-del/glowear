import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { judul: string; pesan: string; tipe?: string; orderId?: string }) {
    return this.prisma.notifikasi.create({
      data: {
        judul: data.judul,
        pesan: data.pesan,
        tipe: data.tipe || 'ORDER',
        orderId: data.orderId,
      },
    });
  }

  async findAllUnread() {
    return this.prisma.notifikasi.findMany({
      where: { dibaca: false },
      orderBy: { waktuDibuat: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.notifikasi.findMany({
      orderBy: { waktuDibuat: 'desc' },
      take: 50, // Limit to 50 notifications for performance
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notifikasi.update({
      where: { id },
      data: { dibaca: true },
    });
  }

  async markAllAsRead() {
    return this.prisma.notifikasi.updateMany({
      where: { dibaca: false },
      data: { dibaca: true },
    });
  }
}
