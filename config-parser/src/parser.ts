import axios from 'axios';
import { AES } from './aes';
import { ConfigJson, ParseResult } from './types';

/**
 * 配置解析器
 * 复刻Java版本的ApiConfig.java实现
 */
export class ConfigParser {
  /**
   * 加载配置
   */
  async loadConfig(apiUrl: string, retries: number = 3): Promise<ParseResult> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`正在加载配置: ${apiUrl}${i > 0 ? ` (重试 ${i}/${retries})` : ''}`);

        // 处理特殊格式
        const { configUrl, configKey } = this.processUrl(apiUrl);
        console.log(`处理后的URL: ${configUrl}`);
        if (configKey) {
          console.log(`检测到加密密钥`);
        }

        // 获取配置内容（增加超时时间和重试）
        const response = await axios.get(configUrl, {
          responseType: 'text',
          timeout: 60000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          },
          maxRedirects: 5,
          validateStatus: (status) => status >= 200 && status < 300
        });

        let content = response.data;
        console.log(`获取到配置内容，长度: ${content.length}`);

        // 解密配置内容
        const decryptedContent = this.findResult(content, configKey);
        console.log(`解密后内容长度: ${decryptedContent.length}`);

        // 保存解密后的原始内容（用于调试）
        const fs = require('fs');
        const path = require('path');
        const debugPath = path.join(__dirname, '..', 'output');
        if (!fs.existsSync(debugPath)) {
          fs.mkdirSync(debugPath, { recursive: true });
        }
        fs.writeFileSync(path.join(debugPath, 'decrypted-raw.txt'), decryptedContent, 'utf8');

        // 移除JSON注释并解析
        const cleanContent = this.removeJsonComments(decryptedContent);

        // 保存清理后的内容（用于调试）
        fs.writeFileSync(path.join(debugPath, 'clean-content.txt'), cleanContent, 'utf8');

        const config: ConfigJson = JSON.parse(cleanContent);

        return {
          success: true,
          config,
          rawContent: content,
          decryptedContent
        };
      } catch (error: any) {
        console.error(`配置加载失败 (尝试 ${i + 1}/${retries}):`, error.message);
        if (i === retries - 1) {
          return {
            success: false,
            error: error.message
          };
        }
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return {
      success: false,
      error: '重试次数已用完'
    };
  }

  /**
   * 处理URL特殊格式
   */
  private processUrl(apiUrl: string): { configUrl: string; configKey: string | null } {
    let configUrl = apiUrl;
    let configKey: string | null = null;

    // 处理 pk 分隔符 (加密密钥)
    const pk = ';pk;';
    if (apiUrl.includes(pk)) {
      const parts = apiUrl.split(pk);
      configKey = parts[1];
      configUrl = parts[0];
    }

    // 处理 clan 协议
    if (configUrl.startsWith('clan://')) {
      configUrl = this.clanToAddress(configUrl);
    }

    // 确保有协议前缀
    if (!configUrl.startsWith('http://') && !configUrl.startsWith('https://')) {
      configUrl = 'http://' + configUrl;
    }

    return { configUrl, configKey };
  }

  /**
   * Clan协议地址转换
   */
  private clanToAddress(lanLink: string): string {
    if (lanLink.startsWith('clan://localhost/')) {
      // 本地Clan地址，需要本地服务器支持
      return lanLink.replace('clan://localhost/', 'http://127.0.0.1:9978/file/');
    } else {
      // 远程Clan地址
      const link = lanLink.substring(7);
      const end = link.indexOf('/');
      return 'http://' + link.substring(0, end) + '/file/' + link.substring(end + 1);
    }
  }

  /**
   * 解密配置内容
   * 复刻Java版本的FindResult方法
   */
  private findResult(json: string, configKey: string | null): string {
    let content = json;

    try {
      // 如果已经是JSON，直接返回
      if (AES.isJson(content)) {
        return content;
      }

      // 处理Base64编码 (********前缀)
      const base64Pattern = /[A-Za-z0]{8}\*\*/;
      if (base64Pattern.test(content)) {
        const match = content.match(base64Pattern);
        if (match) {
          content = content.substring(content.indexOf(match[0]) + 10);
          content = Buffer.from(content, 'base64').toString('utf8');
        }
      }

      // 处理AES-CBC加密 (2423开头)
      if (content.startsWith('2423')) {
        try {
          // 提取加密数据
          const dataStart = content.indexOf('2324') + 4;
          const dataEnd = content.length - 26;
          const data = content.substring(dataStart, dataEnd);

          // 转换为小写并提取密钥和IV
          const lowerContent = content.toLowerCase();
          const keyStart = lowerContent.indexOf('$#') + 2;
          const keyEnd = lowerContent.indexOf('#$');
          let key = lowerContent.substring(keyStart, keyEnd);
          key = AES.rightPadding(key, '0', 16);

          let iv = lowerContent.substring(lowerContent.length - 13);
          iv = AES.rightPadding(iv, '0', 16);

          content = AES.CBC(data, key, iv);
        } catch (e) {
          console.error('CBC解密失败:', e);
        }
      }
      // 处理AES-ECB加密 (有密钥且不是JSON)
      else if (configKey && !AES.isJson(content)) {
        content = AES.ECB(content, configKey);
      }

      return content;
    } catch (e) {
      console.error('解密过程出错:', e);
      return json;
    }
  }

  /**
   * 修复内容中的相对路径
   */
  private fixContentPath(url: string, content: string): string {
    if (content.includes('"./')) {
      const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
      content = content.replace(/"\.\//g, '"' + baseUrl);
    }
    return content;
  }

  /**
   * 移除JSON中的注释
   */
  private removeJsonComments(content: string): string {
    let result = content;
    const lines = result.split('\n');
    const cleanedLines: string[] = [];

    for (const line of lines) {
      // 移除单行注释，但要小心不要移除字符串内的//
      let cleanedLine = line;
      const slashIndex = line.indexOf('//');
      if (slashIndex !== -1) {
        // 检查//前面是否有奇数个引号（表示在字符串内）
        const beforeSlash = line.substring(0, slashIndex);
        const quoteCount = (beforeSlash.match(/"/g) || []).length;
        if (quoteCount % 2 === 0) {
          // 偶数个引号，说明//不在字符串内，可以移除
          cleanedLine = beforeSlash;
        }
      }
      cleanedLines.push(cleanedLine);
    }

    result = cleanedLines.join('\n');

    // 移除多行注释 /* ... */
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    // 移除尾随逗号
    result = result.replace(/,(\s*[}\]])/g, '$1');

    return result;
  }
}
