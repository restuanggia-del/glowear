import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 🔥 BIAR GLOBAL
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 🔥 WAJIB
})
export class PrismaModule {}