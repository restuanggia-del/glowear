import { IsString, IsInt, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  namaProduk!: string;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  deskripsi!: string;

  @IsInt()
  @Min(0, { message: 'Harga tidak boleh minus' })
  harga!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stok?: number;

  @IsString()
  @IsOptional()
  gambar?: string;

  @IsString()
  @IsNotEmpty({ message: 'ID Kategori tidak boleh kosong' })
  categoryId!: string;
}