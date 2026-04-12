import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import {
  SearchRequestDto,
  QuerySearchHistoryDto,
} from './dto/search.dto';

@ApiTags('搜索')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({ summary: '执行搜索' })
  async search(@Body() dto: SearchRequestDto) {
    return this.searchService.search(dto);
  }

  @Get('history')
  @ApiOperation({ summary: '获取搜索历史' })
  async getHistory(@Query() dto: QuerySearchHistoryDto) {
    return this.searchService.getHistory(dto);
  }

  @Delete('history')
  @ApiOperation({ summary: '清空搜索历史' })
  async clearHistory() {
    await this.searchService.clearHistory();
    return { message: 'Search history cleared' };
  }

  @Get('suggest')
  @ApiOperation({ summary: '获取搜索建议' })
  async getSuggestions(@Query('keyword') keyword: string, @Query('limit') limit?: number) {
    return this.searchService.getSuggestions(keyword, limit);
  }
}
