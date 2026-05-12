import { Controller, Post, Body, Param, UploadedFiles, UseInterceptors, Get } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('foto', 5, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async createReview(
    @Body() body: { orderId: string, userId: string, rating: string, komentar: string },
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      console.log('Received Review Body:', body);
      console.log('Received Files:', files ? files.map(f => f.filename) : 'No files');
      
      const fotoString = files && files.length > 0 ? JSON.stringify(files.map(f => f.filename)) : undefined;

      return await this.reviewsService.createReview(
        body.orderId,
        body.userId,
        Number(body.rating),
        body.komentar,
        fotoString
      );
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  @Get('order/:orderId')
  async getReviewByOrder(@Param('orderId') orderId: string) {
    return this.reviewsService.getReviewsByOrder(orderId);
  }

  @Get('product/:productId')
  async getReviewsByProduct(@Param('productId') productId: string) {
    return this.reviewsService.getReviewsByProduct(productId);
  }

  @Get()
  async getAllReviews() {
    return this.reviewsService.getAllReviews();
  }
}
