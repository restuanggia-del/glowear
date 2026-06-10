import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { multerOptions } from './multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('image', 5, multerOptions))
  async create(
    @UploadedFiles() files: Express.Multer.File[], 
    @Body() createProductDto: any
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Silakan unggah minimal satu gambar');
    }

    const data = {
      ...createProductDto,
      harga: parseInt(createProductDto.harga),
      stok: parseInt(createProductDto.stok),
    };

    const filenames = files.map(file => file.filename);
    return this.productsService.create(data, JSON.stringify(filenames));
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
  @UseInterceptors(FilesInterceptor('image', 5, multerOptions))
  async update(
    @Param('id') id: string, 
    @Body() updateProductDto: any,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    const data = {
      ...updateProductDto,
      harga: parseInt(updateProductDto.harga),
      stok: parseInt(updateProductDto.stok),
    };

    const filenames = files && files.length > 0 ? JSON.stringify(files.map(f => f.filename)) : undefined;
    return this.productsService.update(id, data, filenames);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}