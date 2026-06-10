import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomDesignDto } from './dto/create-custom-design.dto';
import { UpdateCustomDesignDto } from './dto/update-custom-design.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomDesignService {
  constructor(private prisma: PrismaService) {}
  create(createCustomDesignDto: CreateCustomDesignDto) {
    return 'This action adds a new customDesign';
  }

  async findAll() {
    // Ambil item pesanan yang BUKAN pesanan polos (punya gambar/deskripsi desain)
    return this.prisma.orderItem.findMany({
      where: {
        gambarDesain: { not: null }
      },
      include: {
        order: true, // Ambil info order & pembayaran
        product: true, // Ambil info baju polosnya
      },
      orderBy: { order: { waktuDibuat: 'desc' } }
    });
  }

  async reviewDesign(id: string, data: { statusDesain: any, catatanAdmin: string }) {
    const item = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Desain tidak ditemukan');

    return this.prisma.orderItem.update({
      where: { id },
      data: {
        statusDesain: data.statusDesain,
        catatanAdmin: data.catatanAdmin
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} customDesign`;
  }

  update(id: number, updateCustomDesignDto: UpdateCustomDesignDto) {
    return `This action updates a #${id} customDesign`;
  }

  remove(id: number) {
    return `This action removes a #${id} customDesign`;
  }
}
