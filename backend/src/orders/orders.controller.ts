import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Endpoint khusus untuk upload bukti pembayaran (struk)
  @Post(':id/upload-receipt')
  @UseInterceptors(FileInterceptor('struk', {
    storage: diskStorage({
      // Kita simpan langsung di folder uploads agar mudah dibaca oleh Admin
      destination: './uploads', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `struk-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadReceipt(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    // Panggil service untuk memperbarui nama file di database
    return this.ordersService.update(id, {
      buktiPembayaran: file.filename,
      // Kita tidak mengubah status menjadi LUNAS di sini, karena Admin yang harus verifikasi
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('fileDesain', {
    storage: diskStorage({
      destination: './uploads/designs',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `design-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  // PASTIKAN parameter @Body() menggunakan tipe 'any' agar tidak diblokir otomatis
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    
    // 1. Terjemahkan string JSON dari Frontend menjadi Array Asli
    let parsedItems = [];
    if (typeof body.items === 'string') {
      try {
        parsedItems = JSON.parse(body.items);
      } catch (e) {
        console.error("Gagal membaca data items");
      }
    } else if (Array.isArray(body.items)) {
      parsedItems = body.items;
    }

    // 2. Susun ulang datanya
    const finalData = {
      ...body,
      userId: body.userId,
      totalHarga: Number(body.totalHarga), // Pastikan jadi angka
      desain: file ? file.filename : null, // Simpan nama file gambar
      items: parsedItems, // Masukkan array yang sudah diterjemahkan
    };

    return this.ordersService.create(finalData);
  }

  @Get('pending-verification')
  findPendingVerification() {
    return this.ordersService.findPendingVerification();
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateData: { 
      status: any, 
      statusPembayaran: any, 
      dpAmount?: number 
    }
  ) {
    return this.ordersService.updateStatus(id, updateData);
  }

  @Get('report')
  getReport(@Query('month') month: string, @Query('year') year: string) {
    // Default ke bulan & tahun saat ini jika tidak ada query
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();
    return this.ordersService.getFinancialReport(m, y);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
