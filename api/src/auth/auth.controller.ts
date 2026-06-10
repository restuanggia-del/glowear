import { Controller, Post, Body, Get, Query, Put, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Auth')
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

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.requestResetPassword(body.email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyResetOtp(body.email, body.otp);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; otp: string; kataSandiBaru: string }) {
    return this.authService.resetPassword(body.email, body.otp, body.kataSandiBaru);
  }
}
