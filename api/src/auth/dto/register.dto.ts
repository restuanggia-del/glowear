import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  nama!: string;

  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  kataSandi!: string;
}