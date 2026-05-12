import { Controller, Get, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('log')
  async logSearch(@Body() body: { keyword: string, userId?: string }) {
    if (!body.keyword || body.keyword.trim() === '') return { success: false };
    return this.searchService.logSearch(body.keyword.trim(), body.userId);
  }

  @Get('popular')
  async getPopularSearches() {
    return this.searchService.getPopularSearches();
  }
}
