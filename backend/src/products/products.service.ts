import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, imageFilename: string) {
    const productData = {
      ...createProductDto,
      gambar: imageFilename,
    };
    return this.prisma.product.create({
      data: productData,
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true, // Mengambil detail kategori sekaligus
      },
      orderBy: { waktuDibuat: 'desc' }, // Produk terbaru di atas
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Cek apakah produk ada sebelum update
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    // Cek apakah produk ada sebelum hapus
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}