import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  // Tambahkan fungsi ini di bawah constructor
  async create(createOrderDto: any) {
    if (!createOrderDto.items || !Array.isArray(createOrderDto.items) || createOrderDto.items.length === 0) {
      throw new BadRequestException('Pesanan gagal dibuat: Item barang tidak boleh kosong.');
    }
    // Hitung total harga otomatis berdasarkan item yang dibeli
    const totalHarga = createOrderDto.items.reduce(
      (sum: number, item: any) => sum + (item.jumlah * item.hargaSatuan), 
      0
    );

    return this.prisma.order.create({
      data: {
        userId: createOrderDto.userId, // Untuk sementara kita pakai ID dummy
        alamatPengiriman: createOrderDto.alamatPengiriman,
        totalHarga: totalHarga,
        catatanCustom: createOrderDto.catatanCustom,
        items: {
          create: createOrderDto.items.map((item: any) => ({
            productId: item.productId,
            jumlah: item.jumlah,
            hargaSatuan: item.hargaSatuan,
            jenisSablon: item.jenisSablon,
            deskripsiDesain: item.deskripsiDesain,
          })),
        },
      },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        // Ambil detail barang yang dipesan beserta produk polosnya
        items: {
          include: { product: true }
        }
      },
      orderBy: { waktuDibuat: 'desc' }
    });
  }

  async updateStatus(id: string, data: { status: any, statusPembayaran: any, dpAmount?: number }) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    // Kalkulasi sisa pembayaran jika ada input DP
    let dp = data.dpAmount || order.dpAmount;
    let sisa = order.totalHarga - dp;

    // Jika diubah jadi LUNAS, DP dianggap sama dengan Total, sisa 0
    if (data.statusPembayaran === 'LUNAS') {
      dp = order.totalHarga;
      sisa = 0;
    } else if (data.statusPembayaran === 'BELUM_BAYAR') {
      dp = 0;
      sisa = order.totalHarga;
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        statusPembayaran: data.statusPembayaran,
        dpAmount: dp,
        sisaPembayaran: sisa
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
