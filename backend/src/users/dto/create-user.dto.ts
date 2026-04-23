import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  declare nama: string;

  @IsString()
  declare username: string;

  @IsEmail()
  declare email: string;

  @IsString()
  @MinLength(6)
  declare kataSandi: string;

  @IsOptional()
  @IsString()
  declare noTelp?: string;

  @IsOptional()
  @IsString()
  declare alamat?: string;

  @IsEnum(Role)
  declare role?: Role;
}
