import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SpiderResult {
  list: any[];
}

@Injectable()
export class SpiderEngine {
  /**
   * 执行搜索
   */
  async search(site: any, keyword: string): Promise<SpiderResult> {
    try {
      // 根据站点类型选择不同的执行方式
      const api = site.api || '';
      
      if (api.includes('csp_AppSx') || api.includes('csp_AppTT')) {
        return await this.searchAppSx(site, keyword);
      } else if (api.includes('csp_T4')) {
        return await this.searchT4(site, keyword);
      } else if (api.includes('csp_XPath')) {
        return await this.searchXPath(site, keyword);
      } else if (api.includes('http')) {
        return await this.searchHttp(site, keyword);
      } else {
        // 默认返回空结果
        return { list: [] };
      }
    } catch (error) {
      console.error(`Spider search error for ${site.name}:`, error.message);
      return { list: [] };
    }
  }

  /**
   * 获取详情
   */
  async detail(site: any, videoId: string): Promise<any> {
    try {
      const api = site.api || '';
      
      if (api.includes('csp_AppSx') || api.includes('csp_AppTT')) {
        return await this.detailAppSx(site, videoId);
      } else if (api.includes('csp_T4')) {
        return await this.detailT4(site, videoId);
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Spider detail error for ${site.name}:`, error.message);
      return null;
    }
  }

  /**
   * AppSx 类型站点搜索
   */
  private async searchAppSx(site: any, keyword: string): Promise<SpiderResult> {
    try {
      // AppSx 站点通常有 ext 配置
      const ext = site.ext;
      let apiUrl = '';
      
      if (typeof ext === 'string' && ext.startsWith('http')) {
        // ext 是加密的配置，需要解密（简化处理）
        apiUrl = 'https://api.example.com'; // 示例
      } else if (typeof ext === 'object' && ext.siteUrl) {
        apiUrl = ext.siteUrl;
      }

      if (!apiUrl) {
        return { list: [] };
      }

      // 调用苹果CMS风格的API
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

      if (response.data && response.data.list) {
        return { list: response.data.list };
      }

      return { list: [] };
    } catch (error) {
      return { list: [] };
    }
  }

  /**
   * T4 类型站点搜索
   */
  private async searchT4(site: any, keyword: string): Promise<SpiderResult> {
    try {
      // T4 站点通常有 ext 配置
      const ext = site.ext;
      
      if (!ext) {
        return { list: [] };
      }

      // T4 引擎的搜索逻辑（简化实现）
      // 实际需要执行 T4 Spider 代码
      
      return { list: [] };
    } catch (error) {
      return { list: [] };
    }
  }

  /**
   * XPath 类型站点搜索
   */
  private async searchXPath(site: any, keyword: string): Promise<SpiderResult> {
    try {
      // XPath 站点需要解析 HTML
      // 简化实现，实际需要完整的 XPath 解析
      
      return { list: [] };
    } catch (error) {
      return { list: [] };
    }
  }

  /**
   * HTTP 类型站点搜索
   */
  private async searchHttp(site: any, keyword: string): Promise<SpiderResult> {
    try {
      const apiUrl = site.api;
      
      if (!apiUrl || !apiUrl.startsWith('http')) {
        return { list: [] };
      }

      // 尝试调用站点API
      const response = await axios.get(apiUrl, {
        params: {
          ac: 'list',
          wd: keyword
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.list) {
        return { list: response.data.list };
      }

      return { list: [] };
    } catch (error) {
      return { list: [] };
    }
  }

  /**
   * AppSx 类型站点详情
   */
  private async detailAppSx(site: any, videoId: string): Promise<any> {
    try {
      const ext = site.ext;
      let apiUrl = '';
      
      if (typeof ext === 'object' && ext.siteUrl) {
        apiUrl = ext.siteUrl;
      }

      if (!apiUrl) {
        return null;
      }

      const response = await axios.get(`${apiUrl}/api.php/provide/vod/`, {
        params: {
          ac: 'detail',
          ids: videoId
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.list && response.data.list.length > 0) {
        return response.data.list[0];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * T4 类型站点详情
   */
  private async detailT4(site: any, videoId: string): Promise<any> {
    try {
      // T4 引擎的详情逻辑（简化实现）
      return null;
    } catch (error) {
      return null;
    }
  }
}
