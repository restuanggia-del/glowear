import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(orderId: string, userId: string, rating: number, komentar: string, foto?: string) {
    // Pastikan order ada
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Buat ulasan dan ubah status pesanan secara transaksional
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Buat ulasan
      const review = await tx.review.create({
        data: {
          orderId,
          userId,
          rating: Number(rating),
          komentar,
          foto,
        },
      });

      // 2. Ubah status order menjadi SELESAI
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'SELESAI' },
      });

      return review;
    });

    return result;
  }

  async getReviewsByOrder(orderId: string) {
    return this.prisma.review.findUnique({
      where: { orderId },
      include: { pengguna: true },
    });
  }
}
