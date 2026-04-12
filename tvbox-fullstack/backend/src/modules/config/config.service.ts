import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface SourceBean {
  key: string;
  name: string;
  api: string;
  type?: number;
  searchable?: number;
  quickSearch?: number;
  ext?: any;
  jar?: string;
}

export interface ConfigJson {
  spider?: string;
  sites?: SourceBean[];
  parses?: any[];
  lives?: any[];
  flags?: string[];
  logo?: string;
}

@Injectable()
export class ConfigService {
  private config: ConfigJson | null = null;

  async loadConfig(apiUrl: string): Promise<ConfigJson> {
    try {
      console.log(`Loading config from: ${apiUrl}`);

      const response = await axios.get(apiUrl, {
        responseType: 'text',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      let content = response.data;
      console.log(`原始内容长度: ${content.length}`);

      // 尝试解密
      const decryptedContent = this.findResult(content, null);
      console.log(`解密后内容长度: ${decryptedContent.length}`);

      // 移除注释
      const cleanContent = this.removeJsonComments(decryptedContent);
      console.log(`清理后内容长度: ${cleanContent.length}`);

      // 解析JSON
      this.config = JSON.parse(cleanContent);
      console.log(`解析成功，站点数: ${this.config.sites?.length || 0}`);

      return this.config;
    } catch (error: any) {
      console.error('Config load failed:', error.message);
      console.error('Error details:', error);
      throw new Error(`Failed to load config: ${error.message}`);
    }
  }

  getConfig(): ConfigJson | null {
    return this.config;
  }

  getSearchableSites(): SourceBean[] {
    if (!this.config || !this.config.sites) {
      return [];
    }
    return this.config.sites.filter(site => site.searchable === 1);
  }

  private findResult(json: string, configKey: string | null): string {
    let content = json;

    try {
      console.log('开始解密...');

      // 检查是否已经是JSON
      if (this.isJson(content)) {
        console.log('内容已是JSON格式');
        return content;
      }

      // 处理Base64编码: [A-Za-z]{8}\*\*
      const base64Pattern = /[A-Za-z]{8}\*\*/;
      if (base64Pattern.test(content)) {
        console.log('检测到Base64编码');
        const match = content.match(base64Pattern);
        if (match) {
          console.log(`找到Base64标记: ${match[0]}`);
          const startIndex = content.indexOf(match[0]) + 10;
          const base64Content = content.substring(startIndex);
          console.log(`Base64内容长度: ${base64Content.length}`);
          
          try {
            content = Buffer.from(base64Content, 'base64').toString('utf8');
            console.log('Base64解码成功');
            console.log(`解码后内容长度: ${content.length}`);
            console.log(`解码后前100字符: ${content.substring(0, 100)}`);
          } catch (e) {
            console.error('Base64解码失败:', e);
          }
        }
      }

      // 检查是否是2423开头的AES-CBC加密
      if (content.startsWith('2423')) {
        console.log('检测到AES-CBC加密');
        // CBC decryption logic would go here
        console.log('警告: AES-CBC解密暂未实现');
      } else if (configKey && !this.isJson(content)) {
        console.log('检测到需要AES-ECB解密');
        // ECB decryption logic would go here
        console.log('警告: AES-ECB解密暂未实现');
      }

      // 最终检查
      if (!this.isJson(content)) {
        console.log('警告: 解密后仍然不是有效的JSON格式');
      }

      return content;
    } catch (e) {
      console.error('解密错误:', e);
      return json;
    }
  }

  private removeJsonComments(content: string): string {
    let result = content;
    const lines = result.split('\n');
    const cleanedLines: string[] = [];

    for (const line of lines) {
      let cleanedLine = line;
      const slashIndex = line.indexOf('//');
      if (slashIndex !== -1) {
        const beforeSlash = line.substring(0, slashIndex);
        const quoteCount = (beforeSlash.match(/"/g) || []).length;
        if (quoteCount % 2 === 0) {
          cleanedLine = beforeSlash;
        }
      }
      cleanedLines.push(cleanedLine);
    }

    result = cleanedLines.join('\n');
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/,(\s*[}\]])/g, '$1');

    return result;
  }

  private isJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
}
