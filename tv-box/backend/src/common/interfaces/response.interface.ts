/**
 * 统一 API 响应接口
 */
export interface ApiResponse<T = any> {
  /** 状态码：200=成功，4xx=客户端错误，5xx=服务端错误 */
  code: number;

  /** 响应消息 */
  message: string;

  /** 响应数据 */
  data: T;

  /** 时间戳 */
  timestamp: number;
}

/**
 * 分页响应数据接口
 */
export interface PageData<T> {
  /** 数据列表 */
  list: T[];

  /** 总数 */
  total: number;

  /** 当前页 */
  page: number;

  /** 每页大小 */
  pageSize: number;
}

/**
 * 分页响应接口
 */
export interface PageResponse<T = any> extends ApiResponse<PageData<T>> {}

/**
 * 分页查询参数接口
 */
export interface PageQuery {
  /** 当前页，默认 1 */
  page?: number;

  /** 每页大小，默认 20 */
  pageSize?: number;
}
