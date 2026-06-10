import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  // Tentukan lokasi penyimpanan
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads'; // Pastikan folder ini ada atau akan dibuat
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    // Tentukan pola nama file agar unik
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  // Validasi tipe file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Hanya file gambar (jpg, jpeg, png) yang diperbolehkan!'), false);
    }
  },
};