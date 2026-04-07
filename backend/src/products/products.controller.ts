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
  async create(
    @UploadedFile() file: Express.Multer.File, 
    @Body() createProductDto: any // Ubah sementara ke any untuk manual parsing
  ) {
    if (!file) {
      throw new BadRequestException('Silakan unggah file gambar');
    }

    // KONVERSI MANUAL: Karena FormData mengirimkan string
    const data = {
      ...createProductDto,
      harga: parseInt(createProductDto.harga),
      stok: parseInt(createProductDto.stok),
    };

    // Kirim data yang sudah dikonversi ke service
    return this.productsService.create(data, file.filename);
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
  @UseInterceptors(FileInterceptor('image', multerOptions)) // Tambahkan interceptor
  async update(
    @Param('id') id: string, 
    @Body() updateProductDto: any,
    @UploadedFile() file?: Express.Multer.File // File bersifat opsional saat edit
  ) {
    // Konversi string dari FormData menjadi number
    const data = {
      ...updateProductDto,
      harga: parseInt(updateProductDto.harga),
      stok: parseInt(updateProductDto.stok),
    };

    // Kirim data dan filename (jika ada) ke service
    return this.productsService.update(id, data, file?.filename);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}