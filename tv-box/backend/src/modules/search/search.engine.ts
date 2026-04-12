import { Logger } from '@nestjs/common';
import { Source } from '../source/source.entity';
import { SpiderService } from '../spider/spider.service';
import { SearchResultItemDto } from './dto/search.dto';

/**
 * 搜索引擎
 * 实现多数据源并发搜索
 */
export class SearchEngine {
  private readonly logger = new Logger(SearchEngine.name);

  constructor(private readonly spiderService: SpiderService) {}

  /**
   * 并发搜索多个数据源
   * @param keyword 搜索关键词
   * @param sources 数据源列表
   * @param quick 是否快速模式
   * @param timeout 超时时间
   */
  async search(
    keyword: string,
    sources: Source[],
    quick: boolean = false,
    timeout: number = 10000,
  ): Promise<SearchResultItemDto[]> {
    const startTime = Date.now();
    this.logger.log(`Starting search for "${keyword}" across ${sources.length} sources`);

    // 创建搜索任务
    const tasks = sources.map((source) => this.searchFromSource(source, keyword, quick, timeout));

    // 并发执行，使用 Promise.allSettled 实现容错
    const results = await Promise.allSettled(tasks);

    // 过滤成功结果并合并
    const successResults = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<SearchResultItemDto[]>).value)
      .flat();

    // 记录失败的数据源
    const failedCount = results.filter((r) => r.status === 'rejected').length;
    if (failedCount > 0) {
      this.logger.warn(`${failedCount} sources failed during search`);
    }

    const duration = Date.now() - startTime;
    this.logger.log(`Search completed in ${duration}ms, found ${successResults.length} results`);

    return successResults;
  }

  /**
   * 从单个数据源搜索
   */
  private async searchFromSource(
    source: Source,
    keyword: string,
    quick: boolean,
    timeout: number,
  ): Promise<SearchResultItemDto[]> {
    const startTime = Date.now();

    try {
      // 执行 Spider 搜索
      const result = await this.spiderService.execute(source.sourceKey, 'searchContent', [keyword, quick], timeout);

      if (!result.success || !result.data) {
        this.logger.warn(`Source ${source.sourceKey} search failed: ${result.error}`);
        return [];
      }

      // 解析结果
      const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      const list = data.list || [];

      // 转换为统一格式
      return list.map((item: any) => ({
        vodId: item.vod_id || item.vodId,
        vodName: item.vod_name || item.vodName,
        vodPic: item.vod_pic || item.vodPic,
        vodRemarks: item.vod_remarks || item.vodRemarks,
        sourceKey: source.sourceKey,
        sourceName: source.sourceName,
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Source ${source.sourceKey} search error after ${duration}ms: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * 聚合搜索结果
   * @param results 搜索结果列表
   * @param page 当前页
   * @param pageSize 每页大小
   */
  aggregateResults(
    results: SearchResultItemDto[],
    page: number = 1,
    pageSize: number = 20,
  ): { list: SearchResultItemDto[]; total: number } {
    // 去重：基于 vodId + sourceKey
    const uniqueMap = new Map<string, SearchResultItemDto>();
    for (const item of results) {
      const key = `${item.sourceKey}_${item.vodId}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }

    const uniqueResults = Array.from(uniqueMap.values());

    // 排序：可以按相关度、时间等排序
    // 这里简单按名称排序
    uniqueResults.sort((a, b) => a.vodName.localeCompare(b.vodName));

    // 分页
    const total = uniqueResults.length;
    const start = (page - 1) * pageSize;
    const list = uniqueResults.slice(start, start + pageSize);

    return { list, total };
  }
}
