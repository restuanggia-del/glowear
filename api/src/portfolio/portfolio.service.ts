import { Injectable } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}
  create(data: any) {
    return this.prisma.portofolio.create({ data });
  }

  findAll() {
    return this.prisma.portofolio.findMany({ 
      orderBy: { waktuDibuat: 'desc' } 
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} portfolio`;
  }

  update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    return `This action updates a #${id} portfolio`;
  }

  remove(id: string) {
    return this.prisma.portofolio.delete({ 
      where: { id } 
    });
  }
}
