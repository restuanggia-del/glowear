import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
