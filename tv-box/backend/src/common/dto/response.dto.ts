import { ApiResponse } from '../interfaces/response.interface';

/**
 * 统一响应 DTO
 */
export class ResponseDto<T> implements ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }

  /**
   * 成功响应
   */
  static success<T>(data: T, message: string = 'success'): ResponseDto<T> {
    return new ResponseDto(200, message, data);
  }

  /**
   * 失败响应
   */
  static fail<T = null>(
    code: number = 500,
    message: string = 'Internal server error',
    data: T = null as T,
  ): ResponseDto<T> {
    return new ResponseDto(code, message, data);
  }
}
