import { Controller, Post, Body, Get, Query, Put, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  getProfile(@Query('userId') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  updateProfile(
    @Query('userId') userId: string,
    @Body() dto: UpdateUserDto,
    ) {
      return this.authService.updateProfile(userId, dto);
  }

  @Post('validate')
  async validate(@Body() body: { id: string }) {
    const user = await this.authService.validateUser(body.id);
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Access denied for dashboard');
    }
    return {
      valid: true,
      role: user.role,
      nama: user.nama
    };
  }
}
