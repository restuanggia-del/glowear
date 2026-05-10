import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}
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
  async create(data: any) {
    // Validasi pencegahan error
    if (!data.items || data.items.length === 0) {
      throw new Error('Pesanan gagal dibuat: Item barang tidak boleh kosong.');
    }

    // Format data untuk disimpan ke Prisma
    const order = await this.prisma.order.create({
      data: {
        userId: data.userId,
        totalHarga: data.totalHarga,
        alamatPengiriman: data.alamatPengiriman,
        catatanCustom: data.catatanCustom,
        statusPembayaran: 'BELUM_BAYAR',
        status: 'PENDING',
        // Jika Anda punya kolom 'desain' di database, buka komentar di bawah ini:
        // desain: data.desain, 
        
        // Simpan data item ke tabel berelasi (OrderItems)
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            jumlah: item.jumlah,
            hargaSatuan: item.hargaSatuan,
            jenisSablon: item.jenisSablon,
          })),
        },
      },
    });

    // Buat notifikasi
    if (order) {
      await this.notificationsService.create({
        judul: 'Pesanan Baru Masuk',
        pesan: `Pesanan baru telah dibuat dengan total Rp ${order.totalHarga.toLocaleString('id-ID')}`,
        tipe: 'ORDER',
        orderId: order.id,
      });
    }

    return order;
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

  async updateStatus(id: string, data: { status: any, statusPembayaran: any, dpAmount?: number, nomorResi?: string }) {
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

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        statusPembayaran: data.statusPembayaran,
        dpAmount: dp,
        sisaPembayaran: sisa,
        nomorResi: data.nomorResi
      },
      include: { pengguna: true }
    });

    // Send Expo Push Notification if user has token and status is changed
    if (updatedOrder.pengguna?.expoPushToken && data.status && data.status !== order.status) {
      const messages: any[] = [];
      let title = "Status Pesanan Diperbarui";
      let body = `Pesanan Anda ORD-${id.substring(0, 6).toUpperCase()} sekarang berstatus: ${data.status.replace('_', ' ')}`;

      if (data.status === 'DIKIRIM') {
        title = "Pesanan Anda Sedang Dikirim! 🚚";
        body = `Pesanan ORD-${id.substring(0, 6).toUpperCase()} sedang dalam perjalanan. ${data.nomorResi ? 'Resi: ' + data.nomorResi : ''}`;
      } else if (data.status === 'DIPROSES') {
        title = "Pesanan Diproses 📦";
        body = `Hore! Pembayaran diterima dan pesanan ORD-${id.substring(0, 6).toUpperCase()} sedang diproduksi.`;
      } else if (data.status === 'SELESAI') {
        title = "Pesanan Selesai ✅";
        body = `Pesanan ORD-${id.substring(0, 6).toUpperCase()} telah selesai. Terima kasih telah berbelanja di Glowear!`;
      }

      messages.push({
        to: updatedOrder.pengguna.expoPushToken,
        sound: 'default',
        title,
        body,
        data: { orderId: id },
      });

      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });
      } catch (err) {
        console.error("Failed to send push notification:", err);
      }
    }

    return updatedOrder;
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

async findByUser(userId: string) {
    return this.prisma.order.findMany({ 
      where: { userId: userId }, 
      include: { 
        items: {
          include: { product: true }
        } 
      }, 
      orderBy: { waktuDibuat: 'desc' }
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        pengguna: { select: { nama: true, email: true, noTelp: true } },
        items: {
          include: { product: true }
        }
      }
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    return order;
  }

  // Fungsi untuk update data order secara umum (seperti nambah struk)
  async update(id: string, updateData: any) {
    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
    });

    if (updateData.buktiPembayaran) {
      await this.notificationsService.create({
        judul: 'Bukti Pembayaran Diunggah',
        pesan: `Bukti pembayaran telah diunggah untuk pesanan ID: ${id.substring(0, 8)}...`,
        tipe: 'PAYMENT',
        orderId: id,
      });
    }

    return updated;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
