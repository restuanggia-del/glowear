import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. Endpoint khusus untuk upload bukti pembayaran (struk)
  @Post(':id/upload-receipt')
  @UseInterceptors(FileInterceptor('struk', {
    storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `struk-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadReceipt(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.ordersService.update(id, {
      buktiPembayaran: file.filename,
    });
  }

  // 2. Fungsi Checkout dengan Desain Custom (Path diubah menjadi /orders/custom)
  @Post('custom')
  @UseInterceptors(FileInterceptor('fileDesain', {
    storage: diskStorage({
      destination: './uploads/designs',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `design-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  createWithDesign(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
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

    const finalData = {
      ...body,
      userId: body.userId,
      totalHarga: Number(body.totalHarga),
      desain: file ? file.filename : null, 
      items: parsedItems,
    };

    return this.ordersService.create(finalData);
  }

  // 3. Fungsi Checkout Utama dari Mobile (Path default /orders)
  @Post()
  create(@Body() createOrderDto: any) {
    // CCTV Backend: Akan muncul di terminal tempat backend berjalan
    console.log("🔴 ADA PESANAN MASUK DARI MOBILE:", createOrderDto);
    
    return this.ordersService.create(createOrderDto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
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