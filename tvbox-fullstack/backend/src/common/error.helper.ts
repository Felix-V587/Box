export enum ErrorCode {
  // 配置相关
  CONFIG_LOAD_FAILED = 'CONFIG_LOAD_FAILED',
  CONFIG_PARSE_FAILED = 'CONFIG_PARSE_FAILED',
  CONFIG_DECRYPT_FAILED = 'CONFIG_DECRYPT_FAILED',
  
  // Spider相关
  SPIDER_NOT_SUPPORTED = 'SPIDER_NOT_SUPPORTED',
  SPIDER_EXECUTION_FAILED = 'SPIDER_EXECUTION_FAILED',
  SPIDER_API_ERROR = 'SPIDER_API_ERROR',
  SPIDER_TIMEOUT = 'SPIDER_TIMEOUT',
  
  // 网络相关
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  TVBOX_SERVER_UNAVAILABLE = 'TVBOX_SERVER_UNAVAILABLE',
  
  // 数据相关
  DATA_PARSE_ERROR = 'DATA_PARSE_ERROR',
  DATA_EMPTY = 'DATA_EMPTY',
  DATA_INVALID = 'DATA_INVALID',
  
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class SpiderError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SpiderError';
  }

  toString(): string {
    return `[${this.code}] ${this.message}${this.details ? ` | Details: ${JSON.stringify(this.details)}` : ''}`;
  }
}

export class ErrorHelper {
  static createError(code: ErrorCode, message: string, details?: any): SpiderError {
    return new SpiderError(code, message, details);
  }

  static getErrorMessage(error: any): string {
    if (error instanceof SpiderError) {
      return error.toString();
    }
    
    if (error.response) {
      // Axios error
      const status = error.response.status;
      const data = error.response.data;
      return `HTTP ${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
    }
    
    if (error.code === 'ECONNABORTED') {
      return '请求超时';
    }
    
    if (error.code === 'ENOTFOUND') {
      return 'DNS解析失败';
    }
    
    if (error.code === 'ECONNREFUSED') {
      return '连接被拒绝';
    }
    
    return error.message || '未知错误';
  }

  static isNetworkError(error: any): boolean {
    return error.code === 'ECONNABORTED' ||
           error.code === 'ENOTFOUND' ||
           error.code === 'ECONNREFUSED' ||
           error.code === 'ETIMEDOUT';
  }
}
