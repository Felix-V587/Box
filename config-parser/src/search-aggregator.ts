import axios from 'axios';
import { SourceBean } from './types';
import { SearchOptions, SearchResult, AggregatedResult, VideoItem } from './search-types';

/**
 * 搜索聚合器
 * 聚合多个站点源的搜索结果
 */
export class SearchAggregator {
  private sites: SourceBean[];
  private baseUrl: string;

  constructor(sites: SourceBean[], baseUrl: string = 'http://127.0.0.1:9978') {
    this.sites = sites.filter(s => s.searchable === 1);
    this.baseUrl = baseUrl;
  }

  /**
   * 搜索视频
   */
  async search(options: SearchOptions): Promise<AggregatedResult> {
    const startTime = Date.now();
    const {
      keyword,
      sites: specifiedSites,
      quickSearch = false,
      timeout = 30000,
      concurrency = 5
    } = options;

    console.log(`\n开始搜索: "${keyword}"`);
    console.log(`搜索模式: ${quickSearch ? '快速搜索' : '普通搜索'}`);
    console.log(`并发数: ${concurrency}\n`);

    // 筛选要搜索的站点
    let targetSites = this.sites;
    if (specifiedSites && specifiedSites.length > 0) {
      targetSites = this.sites.filter(s => specifiedSites.includes(s.key));
    }

    console.log(`目标站点数: ${targetSites.length}`);

    // 分批并发搜索
    const results: SearchResult[] = [];
    const batches = this.chunkArray(targetSites, concurrency);

    for (let i = 0; i < batches.length; i++) {
      console.log(`\n执行批次 ${i + 1}/${batches.length}...`);
      const batchResults = await Promise.all(
        batches[i].map(site => this.searchSite(site, keyword, quickSearch, timeout))
      );
      results.push(...batchResults);
    }

    // 统计结果
    const successSites = results.filter(r => !r.error && r.videos.length > 0).length;
    const failedSites = results.filter(r => r.error).length;
    const totalVideos = results.reduce((sum, r) => sum + r.videos.length, 0);
    const duration = Date.now() - startTime;

    return {
      keyword,
      totalSites: targetSites.length,
      successSites,
      failedSites,
      totalVideos,
      results,
      duration
    };
  }

  /**
   * 搜索单个站点
   */
  private async searchSite(
    site: SourceBean,
    keyword: string,
    quickSearch: boolean,
    timeout: number
  ): Promise<SearchResult> {
    const startTime = Date.now();
    const result: SearchResult = {
      siteKey: site.key,
      siteName: site.name,
      videos: []
    };

    try {
      console.log(`  搜索 ${site.name}...`);

      // 构建搜索请求
      const searchUrl = `${this.baseUrl}/api?do=search&id=${site.key}&wd=${encodeURIComponent(keyword)}`;

      const response = await axios.get(searchUrl, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // 解析搜索结果
      if (response.data && response.data.list) {
        result.videos = response.data.list.map((item: any) => this.parseVideoItem(item));
      }

      result.duration = Date.now() - startTime;
      console.log(`  ✓ ${site.name}: 找到 ${result.videos.length} 个结果 (${result.duration}ms)`);
    } catch (error: any) {
      result.error = error.message;
      result.duration = Date.now() - startTime;
      console.log(`  ✗ ${site.name}: ${error.message} (${result.duration}ms)`);
    }

    return result;
  }

  /**
   * 解析视频项
   */
  private parseVideoItem(item: any): VideoItem {
    return {
      vod_id: item.vod_id || '',
      vod_name: item.vod_name || '',
      vod_pic: item.vod_pic,
      vod_remarks: item.vod_remarks,
      vod_year: item.vod_year,
      vod_type: item.vod_type,
      vod_area: item.vod_area,
      vod_director: item.vod_director,
      vod_actor: item.vod_actor,
      vod_content: item.vod_content,
      vod_play_from: item.vod_play_from,
      vod_play_url: item.vod_play_url
    };
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 获取支持搜索的站点列表
   */
  getSearchableSites(): SourceBean[] {
    return this.sites;
  }
}
