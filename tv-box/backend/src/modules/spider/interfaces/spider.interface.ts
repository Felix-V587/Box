/**
 * Spider 标准接口
 * 所有 Spider 必须实现此接口
 */
export interface Spider {
  /**
   * 初始化 Spider
   * @param config Spider 配置
   */
  init(config: any): Promise<void>;

  /**
   * 获取首页内容
   * @param quick 是否快速模式
   * @returns JSON 字符串
   */
  homeContent(quick: boolean): Promise<string>;

  /**
   * 获取分类内容
   * @param tid 分类 ID
   * @param pg 页码
   * @param filter 过滤条件
   * @param extend 扩展参数
   * @returns JSON 字符串
   */
  categoryContent(
    tid: string,
    pg: number,
    filter?: any,
    extend?: any,
  ): Promise<string>;

  /**
   * 搜索内容
   * @param key 搜索关键词
   * @param quick 是否快速模式
   * @returns JSON 字符串
   */
  searchContent(key: string, quick: boolean): Promise<string>;

  /**
   * 获取详情内容
   * @param ids 视频 ID 数组
   * @returns JSON 字符串
   */
  detailContent(ids: string[]): Promise<string>;

  /**
   * 获取播放内容
   * @param flag 播放标识
   * @param id 视频 ID
   * @returns JSON 字符串
   */
  playerContent(flag: string, id: string): Promise<string>;

  /**
   * 检查是否为视频格式
   * @param url URL 地址
   * @returns 是否为视频格式
   */
  isVideoFormat(url: string): boolean;

  /**
   * 手动视频检查
   * @returns 是否需要手动检查
   */
  manualVideoCheck(): boolean;
}

/**
 * Spider 执行结果
 */
export interface SpiderResult {
  /** 是否成功 */
  success: boolean;

  /** 结果数据 */
  data?: any;

  /** 错误信息 */
  error?: string;

  /** 执行时间（毫秒） */
  duration: number;
}

/**
 * Spider 配置
 */
export interface SpiderConfig {
  /** Spider 类型 */
  type: 'js' | 'py' | 'jar' | 'http';

  /** Spider 内容或路径 */
  content?: string;

  /** 超时时间（毫秒） */
  timeout?: number;

  /** 内存限制（MB） */
  memoryLimit?: number;

  /** 扩展配置 */
  ext?: any;
}
