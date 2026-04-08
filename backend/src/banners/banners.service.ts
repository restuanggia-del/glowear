import { Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}
  create(data: any) {
    return this.prisma.banner.create({ data });
  }

  findAll() {
    return this.prisma.banner.findMany({ orderBy: { waktuDibuat: 'desc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} banner`;
  }

  update(id: number, updateBannerDto: UpdateBannerDto) {
    return `This action updates a #${id} banner`;
  }

  remove(id: string) {
    return this.prisma.banner.delete({ 
      where: { id } 
    });
  }
}
