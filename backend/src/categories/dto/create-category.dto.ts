import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  namaKategori!: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;
}