import { IsOptional } from 'class-validator';

export class UpdateUserDto {
   @IsOptional()
   nama?: string;

   @IsOptional()
   username?: string;

  @IsOptional()
  noTelp?: string;
  
  @IsOptional()
  alamat?: string;
 }
