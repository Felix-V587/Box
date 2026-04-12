import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常基类
 */
export class BusinessException extends HttpException {
  constructor(message: string, statusCode: number = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
  }
}

/**
 * Spider 执行异常
 */
export class SpiderException extends BusinessException {
  constructor(message: string = 'Spider execution failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 数据源异常
 */
export class SourceException extends BusinessException {
  constructor(message: string = 'Source error') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * 资源未找到异常
 */
export class NotFoundException extends BusinessException {
  constructor(message: string = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * 配置解析异常
 */
export class ConfigParseException extends BusinessException {
  constructor(message: string = 'Config parse failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * 搜索异常
 */
export class SearchException extends BusinessException {
  constructor(message: string = 'Search failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 播放地址解析异常
 */
export class PlayerException extends BusinessException {
  constructor(message: string = 'Player parse failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
