import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // Cari pengaturan dengan ID 1
    let settings = await this.prisma.pengaturanToko.findUnique({ where: { id: 1 } });
    
    // Jika belum ada di database, buat otomatis (hanya terjadi 1x saat aplikasi baru jalan)
    if (!settings) {
      settings = await this.prisma.pengaturanToko.create({ data: { id: 1 } });
    }
    return settings;
  }

  async updateSettings(data: any) {
    // Upsert = Update jika ada, Insert jika belum ada
    return this.prisma.pengaturanToko.upsert({
      where: { id: 1 },
      update: {
        namaToko: data.namaToko,
        whatsappCS: data.whatsappCS,
        namaBank: data.namaBank,
        nomorRekening: data.nomorRekening,
        atasNamaBank: data.atasNamaBank,
        syaratKetentuan: data.syaratKetentuan,
      },
      create: {
        id: 1,
        ...data
      }
    });
  }
  create(createSettingDto: CreateSettingDto) {
    return 'This action adds a new setting';
  }

  findAll() {
    return `This action returns all settings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return `This action updates a #${id} setting`;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
