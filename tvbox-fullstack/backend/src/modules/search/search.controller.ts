import { Controller, Post, Body, Query } from '@nestjs/common';
import { SearchService, AggregatedResult } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(
    @Body('keyword') keyword: string,
    @Body('quickSearch') quickSearch = false,
    @Body('timeout') timeout = 15000,
    @Body('concurrency') concurrency = 5
  ) {
    try {
      const result = await this.searchService.search(
        keyword,
        quickSearch,
        timeout,
        concurrency
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
