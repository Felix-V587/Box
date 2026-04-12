import * as crypto from 'crypto';

/**
 * AES加解密工具类
 * 复刻Java版本的AES.java实现
 */
export class AES {
  /**
   * ECB模式解密
   */
  static ECB(data: string, key: string): string {
    try {
      // 确保密钥长度为16字节
      const keyBuffer = Buffer.alloc(16, 0);
      Buffer.from(key).copy(keyBuffer, 0, 0, Math.min(key.length, 16));

      const decipher = crypto.createDecipheriv('aes-128-ecb', keyBuffer, null);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (e) {
      console.error('AES ECB解密失败:', e);
      return data;
    }
  }

  /**
   * CBC模式解密
   */
  static CBC(data: string, key: string, iv: string): string {
    try {
      // 确保密钥和IV长度为16字节
      const keyBuffer = Buffer.alloc(16, 0);
      Buffer.from(key).copy(keyBuffer, 0, 0, Math.min(key.length, 16));

      const ivBuffer = Buffer.alloc(16, 0);
      Buffer.from(iv).copy(ivBuffer, 0, 0, Math.min(iv.length, 16));

      const decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (e) {
      console.error('AES CBC解密失败:', e);
      return data;
    }
  }

  /**
   * 右填充字符串到指定长度
   */
  static rightPadding(str: string, padChar: string, length: number): string {
    while (str.length < length) {
      str += padChar;
    }
    return str.substring(0, length);
  }

  /**
   * 左填充字符串到指定长度
   */
  static leftPadding(str: string, padChar: string, length: number): string {
    while (str.length < length) {
      str = padChar + str;
    }
    return str.substring(0, length);
  }

  /**
   * 将十六进制字符串转换为字节数组
   */
  static toBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  /**
   * 检查字符串是否为有效JSON
   */
  static isJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
}
