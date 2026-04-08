import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('gambar', {
    storage: diskStorage({
      destination: './uploads/banners',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.bannersService.create({
      judul: body.judul,
      link: body.link,
      gambar: file.filename,
    });
  }

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(+id, updateBannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }
}
