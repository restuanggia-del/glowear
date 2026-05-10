import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ReviewsService {
  async createReview(orderId: string, userId: string, rating: number, komentar: string, foto?: string) {
    // Pastikan order ada
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Buat ulasan dan ubah status pesanan secara transaksional
    const result = await prisma.$transaction(async (tx) => {
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
    return prisma.review.findUnique({
      where: { orderId },
      include: { pengguna: true },
    });
  }
}
