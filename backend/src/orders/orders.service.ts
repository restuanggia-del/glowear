import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async getFinancialReport(month: number, year: number) {
    // Cari tanggal awal dan akhir bulan yang dipilih
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const orders = await this.prisma.order.findMany({
      where: {
        waktuDibuat: {
          gte: startDate,
          lt: endDate,
        },
        // Hanya hitung pesanan yang minimal sudah DP atau LUNAS
        statusPembayaran: { in: ['DP', 'LUNAS'] }
      },
      include: {
        pengguna: { select: { nama: true } },
      },
      orderBy: { waktuDibuat: 'asc' }
    });

    // Kalkulasi Total
    const totalOmzet = orders.reduce((sum, order) => sum + (order.totalHarga || 0), 0);
    const totalDPMasuk = orders.reduce((sum, order) => sum + (order.dpAmount || 0), 0);
    const pesananSelesai = orders.filter(o => o.status === 'SELESAI').length;

    return {
      summary: {
        totalOmzet,
        totalDP: totalDPMasuk,
        totalPesanan: orders.length,
        pesananSelesai
      },
      orders
    };
  }
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

  async findPendingVerification() {
    return this.prisma.order.findMany({
      where: {
        buktiPembayaran: { not: null }, // Sudah upload bukti
        statusPembayaran: { not: 'LUNAS' } // Tapi belum lunas (atau masih DP)
      },
      include: {
        // Kita asumsikan relasi ke model Pengguna bernama 'user'
        // Jika di schema Anda namanya 'pengguna', ganti jadi pengguna: true
        pengguna: {
          select: { nama: true, email: true }
        }
      },
      orderBy: { waktuDiupdate: 'asc' } // Yang duluan upload tampil di atas
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
