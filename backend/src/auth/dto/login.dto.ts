import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  kataSandi!: string;
}