import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(userId: string, productId: string) {
    // Cek apakah sudah ada
    const existing = await this.checkWishlist(userId, productId);
    if (existing.isWishlisted) {
      return { success: true, message: 'Sudah ada di wishlist' };
    }

    await this.prisma.wishlist.create({
      data: { userId, productId },
    });
    return { success: true };
  }

  async removeFromWishlist(userId: string, productId: string) {
    await this.prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
    return { success: true };
  }

  async getUserWishlist(userId: string) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true }
        }
      },
      orderBy: { waktuDibuat: 'desc' }
    });
    return wishlists.map(w => w.product);
  }

  async checkWishlist(userId: string, productId: string) {
    const item = await this.prisma.wishlist.findFirst({
      where: { userId, productId }
    });
    return { isWishlisted: !!item };
  }
}
