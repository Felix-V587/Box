import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SearchHistory } from './search-history.entity';
import { Source } from '../source/source.entity';
import { SpiderService } from '../spider/spider.service';
import { SearchEngine } from './search.engine';
import {
  SearchRequestDto,
  SearchResultDto,
  SearchHistoryDto,
  QuerySearchHistoryDto,
} from './dto/search.dto';

/**
 * 搜索服务
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly searchEngine: SearchEngine;
  private readonly maxHistoryCount: number = 30;

  constructor(
    @InjectRepository(SearchHistory)
    private readonly historyRepository: Repository<SearchHistory>,
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
    private readonly spiderService: SpiderService,
    private readonly configService: ConfigService,
  ) {
    this.searchEngine = new SearchEngine(spiderService);
  }

  /**
   * 执行搜索
   */
  async search(dto: SearchRequestDto): Promise<SearchResultDto> {
    const startTime = Date.now();
    const { keyword, sources: sourceKeys, quick = false, page = 1, pageSize = 20 } = dto;

    // 获取数据源列表
    let sources: Source[];
    if (sourceKeys && sourceKeys.length > 0) {
      sources = await this.sourceRepository.find({
        where: sourceKeys.map(key => ({ sourceKey: key, status: 1 })),
      });
    } else {
      sources = await this.sourceRepository.find({ where: { status: 1 } });
    }

    if (sources.length === 0) {
      return {
        list: [],
        total: 0,
        page,
        pageSize,
        searchTime: 0,
      };
    }

    // 执行搜索
    const timeout = this.configService.get<number>('spider.timeout') || 10000;
    const results = await this.searchEngine.search(keyword, sources, quick, timeout);

    // 聚合结果
    const { list, total } = this.searchEngine.aggregateResults(results, page, pageSize);

    const searchTime = Date.now() - startTime;

    // 保存搜索历史
    await this.saveHistory(keyword, total);

    return {
      list,
      total,
      page,
      pageSize,
      searchTime,
    };
  }

  /**
   * 保存搜索历史
   */
  private async saveHistory(keyword: string, resultCount: number): Promise<void> {
    try {
      // 检查是否已存在相同关键词
      const existing = await this.historyRepository.findOne({
        where: { keyword },
        order: { searchTime: 'DESC' },
      });

      if (existing) {
        // 更新现有记录
        existing.searchTime = new Date();
        existing.resultCount = resultCount;
        await this.historyRepository.save(existing);
      } else {
        // 创建新记录
        const history = this.historyRepository.create({
          keyword,
          resultCount,
        });
        await this.historyRepository.save(history);
      }

      // 清理超过最大数量的历史记录
      await this.cleanOldHistory();
    } catch (error) {
      this.logger.error('Failed to save search history', error);
    }
  }

  /**
   * 清理旧的历史记录
   */
  private async cleanOldHistory(): Promise<void> {
    const count = await this.historyRepository.count();
    if (count > this.maxHistoryCount) {
      const deleteCount = count - this.maxHistoryCount;
      const oldRecords = await this.historyRepository.find({
        order: { searchTime: 'ASC' },
        take: deleteCount,
      });

      if (oldRecords.length > 0) {
        await this.historyRepository.delete(oldRecords.map((r) => r.id));
        this.logger.log(`Cleaned ${oldRecords.length} old search history records`);
      }
    }
  }

  /**
   * 获取搜索历史
   */
  async getHistory(dto: QuerySearchHistoryDto): Promise<SearchHistoryDto[]> {
    const { limit = 10 } = dto;

    const histories = await this.historyRepository.find({
      order: { searchTime: 'DESC' },
      take: limit,
    });

    return histories.map((h) => ({
      id: h.id,
      keyword: h.keyword,
      searchTime: h.searchTime,
      resultCount: h.resultCount,
    }));
  }

  /**
   * 清空搜索历史
   */
  async clearHistory(): Promise<void> {
    await this.historyRepository.clear();
    this.logger.log('Search history cleared');
  }

  /**
   * 获取搜索建议
   * 基于搜索历史生成
   */
  async getSuggestions(keyword: string, limit: number = 10): Promise<string[]> {
    const histories = await this.historyRepository.find({
      where: {
        keyword: Like(`%${keyword}%`) as any,
      },
      order: { searchTime: 'DESC' },
      take: limit,
    });

    return histories.map((h) => h.keyword);
  }
}
