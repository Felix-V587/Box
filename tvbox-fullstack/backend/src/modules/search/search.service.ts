import { Injectable, Inject } from '@nestjs/common';
import { ConfigService, SourceBean } from '../config/config.service';
import axios from 'axios';
import { Logger } from '../../common/logger';
import { ErrorHelper, ErrorCode, SpiderError } from '../../common/error.helper';
import { SpiderManager } from '@tvbox/spider-engine';

export interface VideoItem {
  vod_id: string;
  vod_name: string;
  vod_pic?: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_type?: string;
  vod_area?: string;
}

export interface SearchResult {
  siteKey: string;
  siteName: string;
  videos: VideoItem[];
  error?: string;
  errorCode?: ErrorCode;
  errorDetails?: any;
}

export interface AggregatedResult {
  keyword: string;
  totalSites: number;
  successSites: number;
  failedSites: number;
  totalVideos: number;
  results: SearchResult[];
  duration: number;
}

@Injectable()
export class SearchService {
  private logger = new Logger('SearchService');

  constructor(
    private readonly configService: ConfigService,
    @Inject('SPIDER_MANAGER') private spiderManager: SpiderManager
  ) {}

  /**
   * 清理资源
   */
  destroy() {
    this.spiderManager.destroyAll();
  }

  async search(keyword: string, quickSearch = false, timeout = 15000, concurrency = 5): Promise<AggregatedResult> {
    const startTime = Date.now();
    const sites = this.configService.getSearchableSites();

    this.logger.info(`开始搜索: "${keyword}"`);
    this.logger.info(`目标站点数: ${sites.length}`);

    const results: SearchResult[] = [];
    const batches = this.chunkArray(sites, concurrency);

    for (let i = 0; i < batches.length; i++) {
      this.logger.debug(`执行批次 ${i + 1}/${batches.length}`);
      const batchResults = await Promise.all(
        batches[i].map(site => this.searchSite(site, keyword, timeout))
      );
      results.push(...batchResults);
    }

    const successSites = results.filter(r => !r.error && r.videos.length > 0).length;
    const failedSites = results.filter(r => r.error).length;
    const totalVideos = results.reduce((sum, r) => sum + r.videos.length, 0);
    const duration = Date.now() - startTime;

    this.logger.info(`搜索完成: 成功${successSites}个站点, 失败${failedSites}个站点, 共${totalVideos}个结果`);

    return {
      keyword,
      totalSites: sites.length,
      successSites,
      failedSites,
      totalVideos,
      results,
      duration,
    };
  }

  private async searchSite(
    site: SourceBean,
    keyword: string,
    timeout: number
  ): Promise<SearchResult> {
    const result: SearchResult = {
      siteKey: site.key,
      siteName: site.name,
      videos: [],
    };

    try {
      // 1. 尝试使用Spider引擎执行
      this.logger.debug(`[${site.name}] 尝试Spider引擎执行`);
      const spiderResult = await this.executeSpider(site, keyword);
      
      if (spiderResult && spiderResult.list && spiderResult.list.length > 0) {
        result.videos = spiderResult.list;
        this.logger.success(`[${site.name}] Spider执行成功: ${result.videos.length}个结果`);
        return result;
      }

      // 2. Spider执行失败，尝试连接TVBox服务器
      this.logger.debug(`[${site.name}] Spider执行失败，尝试TVBox服务器`);
      const tvboxResult = await this.searchTVBox(site, keyword);
      
      if (tvboxResult && tvboxResult.list && tvboxResult.list.length > 0) {
        result.videos = tvboxResult.list;
        this.logger.success(`[${site.name}] TVBox服务器成功: ${result.videos.length}个结果`);
        return result;
      }

      // 3. 所有方式都失败，返回错误
      result.error = `站点 ${site.name} 暂不支持或无法访问`;
      result.errorCode = ErrorCode.SPIDER_NOT_SUPPORTED;
      result.errorDetails = {
        siteKey: site.key,
        api: site.api,
        type: this.getSpiderType(site.api)
      };
      this.logger.warn(`[${site.name}] 不支持或无法访问`, result.errorDetails);

    } catch (error: any) {
      result.error = ErrorHelper.getErrorMessage(error);
      result.errorCode = ErrorHelper.isNetworkError(error) ? ErrorCode.NETWORK_ERROR : ErrorCode.SPIDER_EXECUTION_FAILED;
      result.errorDetails = {
        originalError: error.message,
        stack: error.stack
      };
      this.logger.fail(`[${site.name}] 执行失败: ${result.error}`);
    }

    return result;
  }

  /**
   * 执行Spider搜索
   */
  private async executeSpider(site: SourceBean, keyword: string): Promise<any> {
    const api = site.api || '';
    const spiderType = this.getSpiderType(api);

    this.logger.debug(`[${site.name}] Spider类型: ${spiderType}`);

    // 优先使用Spider引擎执行
    if (spiderType === 'Unknown' || api.startsWith('http')) {
      try {
        this.logger.debug(`[${site.name}] 使用Spider引擎执行`);
        const spider = await this.spiderManager.loadSpider({
          key: site.key,
          api: api,
          ext: site.ext ? JSON.stringify(site.ext) : '',
        });

        if (spider) {
          const result = await spider.search(keyword, false);
          if (result) {
            return JSON.parse(result);
          }
        }
      } catch (error: any) {
        this.logger.debug(`[${site.name}] Spider引擎执行失败: ${error.message}`);
        // 继续尝试其他方式
      }
    }

    // 对于特定类型，使用专用方法
    switch (spiderType) {
      case 'AppSx':
        return await this.searchAppSx(site, keyword);
      case 'T4':
        return await this.searchT4(site, keyword);
      case 'XPath':
        return await this.searchXPath(site, keyword);
      case 'ZPan':
        return await this.searchZPan(site, keyword);
      default:
        this.logger.debug(`[${site.name}] 不支持的Spider类型: ${spiderType}`);
        return null;
    }
  }

  /**
   * 获取Spider管理器（用于播放服务）
   */
  getSpiderManager(): SpiderManager {
    return this.spiderManager;
  }

  /**
   * 获取Spider管理器（用于播放服务）
   */
  getSpiderManager(): SpiderManager {
    return this.spiderManager;
  }

  /**
   * 获取Spider类型
   */
  private getSpiderType(api: string): string {
    if (api.includes('csp_AppSx') || api.includes('csp_AppTT')) return 'AppSx';
    if (api.includes('csp_T4')) return 'T4';
    if (api.includes('csp_XPath')) return 'XPath';
    if (api.includes('csp_S_zps')) return 'ZPan';
    return 'Unknown';
  }

  /**
   * AppSx 站点搜索
   */
  private async searchAppSx(site: SourceBean, keyword: string): Promise<any> {
    try {
      const ext = site.ext;
      let apiUrl = '';

      if (typeof ext === 'object' && ext.siteUrl) {
        apiUrl = ext.siteUrl;
      }

      if (!apiUrl) {
        throw ErrorHelper.createError(
          ErrorCode.DATA_INVALID,
          'AppSx站点缺少siteUrl配置',
          { site: site.key, ext }
        );
      }

      this.logger.debug(`[${site.name}] AppSx API: ${apiUrl}`);

      const response = await axios.get(`${apiUrl}/api.php/provide/vod/`, {
        params: {
          ac: 'list',
          wd: keyword
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.data) {
        throw ErrorHelper.createError(ErrorCode.DATA_EMPTY, 'API返回空数据');
      }

      return response.data;
    } catch (error) {
      if (error instanceof SpiderError) {
        throw error;
      }
      throw ErrorHelper.createError(
        ErrorCode.SPIDER_API_ERROR,
        `AppSx搜索失败: ${ErrorHelper.getErrorMessage(error)}`,
        { originalError: error.message }
      );
    }
  }

  /**
   * T4 站点搜索
   */
  private async searchT4(site: SourceBean, keyword: string): Promise<any> {
    this.logger.debug(`[${site.name}] T4引擎暂未实现`);
    throw ErrorHelper.createError(
      ErrorCode.SPIDER_NOT_SUPPORTED,
      'T4引擎暂未实现',
      { site: site.key }
    );
  }

  /**
   * XPath 站点搜索
   */
  private async searchXPath(site: SourceBean, keyword: string): Promise<any> {
    this.logger.debug(`[${site.name}] XPath解析暂未实现`);
    throw ErrorHelper.createError(
      ErrorCode.SPIDER_NOT_SUPPORTED,
      'XPath解析暂未实现',
      { site: site.key }
    );
  }

  /**
   * ZPan 站点搜索
   */
  private async searchZPan(site: SourceBean, keyword: string): Promise<any> {
    this.logger.debug(`[${site.name}] ZPan搜索暂未实现`);
    throw ErrorHelper.createError(
      ErrorCode.SPIDER_NOT_SUPPORTED,
      'ZPan搜索暂未实现',
      { site: site.key }
    );
  }

  /**
   * TVBox服务器搜索
   */
  private async searchTVBox(site: SourceBean, keyword: string): Promise<any> {
    const tvboxServer = 'http://127.0.0.1:9978';
    
    try {
      this.logger.debug(`[${site.name}] 尝试连接TVBox: ${tvboxServer}`);
      
      const response = await axios.get(`${tvboxServer}/api`, {
        params: {
          do: 'search',
          id: site.key,
          wd: keyword
        },
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      this.logger.debug(`[${site.name}] TVBox服务器不可用: ${ErrorHelper.getErrorMessage(error)}`);
      return null;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
