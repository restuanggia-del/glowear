import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async addToWishlist(@Body() body: { userId: string, productId: string }) {
    return this.wishlistService.addToWishlist(body.userId, body.productId);
  }

  @Delete(':userId/:productId')
  async removeFromWishlist(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Get('user/:userId')
  async getUserWishlist(@Param('userId') userId: string) {
    return this.wishlistService.getUserWishlist(userId);
  }

  @Get('check/:userId/:productId')
  async checkWishlist(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.checkWishlist(userId, productId);
  }
}
