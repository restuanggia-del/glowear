import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { multerOptions } from './multer.config';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createProductDto: CreateProductDto) {
    if (!file) {
      throw new BadRequestException('Silakan unggah file gambar');
    }
    // createProductDto.harga = Number(createProductDto.harga); // Pastikan ini number jika DTO-nya number
    // createProductDto.stok = Number(createProductDto.stok); // Pastikan ini number jika DTO-nya number
    // Kirim filename ke service untuk disimpan di DB
    return this.productsService.create(createProductDto, file.filename);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Menggunakan PUT sesuai permintaan Anda
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}