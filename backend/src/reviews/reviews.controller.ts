import { Controller, Post, Body, Param, UploadedFile, UseInterceptors, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('foto', {
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
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.reviewsService.createReview(
      body.orderId,
      body.userId,
      Number(body.rating),
      body.komentar,
      file ? file.filename : undefined
    );
  }

  @Get('order/:orderId')
  async getReviewByOrder(@Param('orderId') orderId: string) {
    return this.reviewsService.getReviewsByOrder(orderId);
  }
}
