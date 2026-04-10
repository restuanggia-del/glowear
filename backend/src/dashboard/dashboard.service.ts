import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {

  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. STATISTIK KARTU (CARD STATS)
    // Hitung total produk di katalog
    const totalProduk = await this.prisma.product.count(); 
    
    // Hitung pesanan yang butuh diproses
    const pesananBaru = await this.prisma.order.count({
      where: { status: 'PENDING' },
    });

    // Hitung pelanggan (Abaikan akun Admin)
    const totalPelanggan = await this.prisma.pengguna.count({
      where: { role: 'PELANGGAN' },
    });

    // Hitung pendapatan bulan ini (Hanya yang lunas/DP yang masuk hitungan)
    const pendapatanBulanIni = await this.prisma.order.aggregate({
      where: {
        waktuDibuat: { gte: startOfThisMonth },
        statusPembayaran: { in: ['LUNAS', 'DP'] },
      },
      _sum: {
        totalHarga: true,
      },
    });
    const pendapatan = pendapatanBulanIni._sum.totalHarga || 0;

    // 2. PESANAN TERBARU (TABEL)
    const recentOrdersRaw = await this.prisma.order.findMany({
      take: 4, // Ambil 4 pesanan paling baru
      orderBy: { waktuDibuat: 'desc' },
      include: {
        pengguna: { select: { nama: true } },
      },
    });

    const recentOrders = recentOrdersRaw.map((order) => ({
      id: `ORD-${order.id.substring(0, 6).toUpperCase()}`,
      pelanggan: order.pengguna?.nama || 'Tanpa Nama',
      tagihan: order.totalHarga,
      status: order.statusPembayaran === 'LUNAS' ? 'LUNAS' : order.status,
    }));

    // 3. GRAFIK PENDAPATAN (6 BULAN TERAKHIR)
    const chartData: any[] = []; 
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthOmzet = await this.prisma.order.aggregate({
        where: {
          waktuDibuat: { gte: startOfMonth, lte: endOfMonth },
          statusPembayaran: { in: ['LUNAS', 'DP'] },
        },
        _sum: { totalHarga: true },
      });

      chartData.push({
        // 👇 PERBAIKAN 2: Pastikan ini tertulis 'name', bukan 'nam'
        name: d.toLocaleString('id-ID', { month: 'short' }), 
        omzet: monthOmzet._sum.totalHarga || 0,
      });
    } 

    // 4. PRODUK TERLARIS (TOP 3)
    // Ambil 3 produk secara acak (bisa diubah nanti menggunakan agregasi orderItems yang lebih kompleks)
    const topProducts = await this.prisma.product.findMany({
      take: 3,
    });
    const bestSellers = topProducts.map((p, index) => ({
      nama: p.namaProduk,
      terjual: (3 - index) * 15 + Math.floor(Math.random() * 10), // Simulasi angka terjual untuk UI
    }));

    // KEMBALIKAN DATA SESUAI FORMAT YANG DIMINTA FRONTEND NEXT.JS
    return {
      stats: { totalProduk, pesananBaru, totalPelanggan, pendapatan },
      chartData,
      recentOrders,
      bestSellers,
    };
  }
  create(createDashboardDto: CreateDashboardDto) {
    return 'This action adds a new dashboard';
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
