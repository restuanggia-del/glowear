import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Hanya ada 2 fungsi ini, pastikan tidak ada fungsi bawaan NestJS yang tersisa
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  updateSettings(@Body() updateData: any) {
    return this.settingsService.updateSettings(updateData);
  }
}