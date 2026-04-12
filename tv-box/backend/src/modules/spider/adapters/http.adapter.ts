import { Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SpiderExecutor } from '../spider.executor';
import { Spider, SpiderResult, SpiderConfig } from '../interfaces/spider.interface';

/**
 * HTTP API Spider 适配器
 * 用于访问 XML/JSON API 数据源
 */
export class HttpAdapter extends SpiderExecutor {
  private httpClient: AxiosInstance;
  private spiderInstance: Spider | null = null;

  constructor(config: SpiderConfig) {
    super(config);

    // 创建 HTTP 客户端
    this.httpClient = axios.create({
      timeout: config.timeout || 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
  }

  /**
   * 加载 Spider
   */
  async load(): Promise<Spider> {
    try {
      if (!this.config.content) {
        throw new Error('Spider content (API URL) is required');
      }

      // 创建 Spider 实例
      this.spiderInstance = this.createSpiderInstance();

      this.logger.log('HTTP API Spider loaded successfully');
      return this.spiderInstance;
    } catch (error) {
      this.logger.error('Failed to load HTTP API Spider', error);
      throw error;
    }
  }

  /**
   * 创建 Spider 实例
   */
  private createSpiderInstance(): Spider {
    const apiUrl = this.config.content!;

    return {
      init: async (config: any) => {
        // HTTP API 不需要初始化
      },

      homeContent: async (quick: boolean) => {
        try {
          const response = await this.httpClient.get(apiUrl, {
            params: { ac: 'detail', quick: quick ? 1 : 0 },
          });
          return typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);
        } catch (error) {
          this.logger.error('Failed to fetch home content', error);
          return JSON.stringify({ list: [] });
        }
      },

      categoryContent: async (tid: string, pg: number, filter?: any, extend?: any) => {
        try {
          const response = await this.httpClient.get(apiUrl, {
            params: { ac: 'detail', t: tid, pg, ...filter, ...extend },
          });
          return typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);
        } catch (error) {
          this.logger.error('Failed to fetch category content', error);
          return JSON.stringify({ list: [] });
        }
      },

      searchContent: async (key: string, quick: boolean) => {
        try {
          const response = await this.httpClient.get(apiUrl, {
            params: { ac: 'detail', wd: key, quick: quick ? 1 : 0 },
          });
          return typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);
        } catch (error) {
          this.logger.error('Failed to search content', error);
          return JSON.stringify({ list: [] });
        }
      },

      detailContent: async (ids: string[]) => {
        try {
          const response = await this.httpClient.get(apiUrl, {
            params: { ac: 'detail', ids: ids.join(',') },
          });
          return typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);
        } catch (error) {
          this.logger.error('Failed to fetch detail content', error);
          return JSON.stringify({ list: [] });
        }
      },

      playerContent: async (flag: string, id: string) => {
        try {
          const response = await this.httpClient.get(apiUrl, {
            params: { ac: 'player', id, flag },
          });
          return typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);
        } catch (error) {
          this.logger.error('Failed to fetch player content', error);
          return JSON.stringify({});
        }
      },

      isVideoFormat: (url: string) => {
        const videoExtensions = [
          '.mp4',
          '.m3u8',
          '.mkv',
          '.avi',
          '.rmvb',
          '.wmv',
          '.flv',
        ];
        return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
      },

      manualVideoCheck: () => {
        return false;
      },
    };
  }

  /**
   * 执行 Spider 方法
   */
  async execute(
    method: keyof Spider,
    args: any[],
    timeout?: number,
  ): Promise<SpiderResult> {
    if (!this.spiderInstance) {
      await this.load();
    }

    return this.executeMethod(
      this.spiderInstance!,
      method,
      args,
      timeout || this.config.timeout || 10000,
    );
  }

  /**
   * 销毁 Spider
   */
  async destroy(): Promise<void> {
    try {
      this.spiderInstance = null;
      this.logger.log('HTTP API Spider destroyed');
    } catch (error) {
      this.logger.error('Failed to destroy HTTP API Spider', error);
    }
  }
}
