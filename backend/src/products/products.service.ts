import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs';
import { join } from 'path';

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

  async update(id: string, updateProductDto: any, imageFilename?: string) {
    // 1. Cari produk lama untuk mengecek apakah dia punya gambar
    const existingProduct = await this.findOne(id);

    // 2. Siapkan data yang akan diupdate
    const dataToUpdate: any = { ...updateProductDto };

    // 3. Jika user mengunggah gambar baru
    if (imageFilename) {
      dataToUpdate.gambar = imageFilename; // Update nama file di DB

      // 4. Hapus gambar lama dari folder uploads (jika ada)
      if (existingProduct.gambar) {
        const oldImagePath = join(process.cwd(), 'uploads', existingProduct.gambar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Hapus file fisik
        }
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dataToUpdate,
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