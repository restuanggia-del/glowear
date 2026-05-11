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

    // ======= VALIDASI STOK =======
    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      }

      if (product.stok < item.jumlah) {
        throw new BadRequestException(
          `Stok produk "${product.namaProduk}" tidak mencukupi. ` +
          `Stok tersedia: ${product.stok} pcs, Anda memesan: ${item.jumlah} pcs.`
        );
      }
    }
    // ==============================

    // Gunakan transaksi Prisma agar pembuatan order & pengurangan stok bersifat atomik
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Buat pesanan beserta item-itemnya
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          totalHarga: data.totalHarga,
          alamatPengiriman: data.alamatPengiriman,
          catatanCustom: data.catatanCustom,
          statusPembayaran: 'BELUM_BAYAR',
          status: 'PENDING',
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              jumlah: item.jumlah,
              hargaSatuan: item.hargaSatuan,
              jenisSablon: item.jenisSablon,
              deskripsiDesain: item.deskripsiDesain,
            })),
          },
        },
      });

      // 2. Kurangi stok untuk setiap item yang dipesan
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stok: { decrement: item.jumlah } },
        });
      }

      return newOrder;
    });

    // Buat notifikasi setelah transaksi berhasil
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
        },
        review: true
      },
      orderBy: { waktuDibuat: 'desc' }
    });
  }

  async updateStatus(id: string, data: { status: any, statusPembayaran: any, dpAmount?: number, kurir?: any, nomorResi?: any }) {
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
        kurir: data.kurir,
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
        const kurirName = data.kurir ? ` via ${data.kurir}` : '';
        body = `Pesanan ORD-${id.substring(0, 6).toUpperCase()} sedang dalam perjalanan${kurirName}. ${data.nomorResi ? 'Resi: ' + data.nomorResi : ''}`;
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
        },
        review: true 
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
        },
        review: true
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

  // ======= BATALKAN PESANAN OLEH PELANGGAN =======
  async cancelByUser(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan.');
    }

    // Hanya boleh dibatalkan jika masih PENDING dan belum bayar
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Pesanan tidak dapat dibatalkan. ' +
        'Pesanan hanya bisa dibatalkan saat status masih PENDING (belum diproses admin).'
      );
    }

    if (order.statusPembayaran !== 'BELUM_BAYAR') {
      throw new BadRequestException(
        'Pesanan tidak dapat dibatalkan karena pembayaran sudah diproses. ' +
        'Silakan hubungi Customer Service.'
      );
    }

    // Gunakan transaksi: batalkan order + kembalikan stok
    const cancelled = await this.prisma.$transaction(async (tx) => {
      // 1. Update status order menjadi DIBATALKAN
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'DIBATALKAN' },
      });

      // 2. Kembalikan stok produk untuk setiap item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stok: { increment: item.jumlah } },
        });
      }

      return updatedOrder;
    });

    // Buat notifikasi untuk admin
    await this.notificationsService.create({
      judul: 'Pesanan Dibatalkan oleh Pelanggan',
      pesan: `Pesanan ID: ${id.substring(0, 8)}... telah dibatalkan oleh pelanggan.`,
      tipe: 'ORDER',
      orderId: id,
    });

    return cancelled;
  }
  // =================================================
}
