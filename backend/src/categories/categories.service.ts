import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path jika perlu
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Cek apakah nama kategori sudah ada (karena di schema kita set @unique)
    const existingCategory = await this.prisma.category.findUnique({
      where: { namaKategori: createCategoryDto.namaKategori },
    });

    if (existingCategory) {
      throw new ConflictException('Nama kategori sudah digunakan');
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { waktuDibuat: 'desc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true }, // Opsional: tampilkan produk apa saja di kategori ini
    });

    if (!category) {
      throw new NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Pastikan kategori ada

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Pastikan kategori ada

    // Catatan: Karena kita pakai onDelete: Restrict di Prisma Schema, 
    // Prisma akan otomatis menolak jika kategori ini masih punya produk.
    return this.prisma.category.delete({
      where: { id },
    });
  }
}