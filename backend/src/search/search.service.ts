import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async logSearch(keyword: string, userId?: string) {
    await this.prisma.searchLog.create({
      data: {
        keyword: keyword.toLowerCase(),
        userId: userId || null
      }
    });
    return { success: true };
  }

  async getPopularSearches() {
    // Prisma does not directly support grouping by and counting while ordering, 
    // so we'll use raw query or group by.
    const grouped = await this.prisma.searchLog.groupBy({
      by: ['keyword'],
      _count: {
        keyword: true
      },
      orderBy: {
        _count: {
          keyword: 'desc'
        }
      },
      take: 10
    });

    return grouped.map(item => ({
      keyword: item.keyword,
      count: item._count.keyword
    }));
  }
}
