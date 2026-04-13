/**
 * Spider接口定义
 * 与TVBox Spider接口保持一致
 */
export interface ISpider {
    /**
     * 初始化Spider
     * @param ext 扩展参数
     */
    init(ext?: string): Promise<void>;

    /**
     * 首页数据内容
     * @param filter 是否开启筛选
     * @returns JSON字符串
     */
    home(filter?: boolean): Promise<string>;

    /**
     * 首页最近更新数据
     * @returns JSON字符串
     */
    homeVod(): Promise<string>;

    /**
     * 分类数据
     * @param tid 分类ID
     * @param pg 页码
     * @param filter 是否开启筛选
     * @param extend 扩展参数
     * @returns JSON字符串
     */
    category(
        tid: string,
        pg: string,
        filter?: boolean,
        extend?: Record<string, string>
    ): Promise<string>;

    /**
     * 详情数据
     * @param ids 视频ID列表
     * @returns JSON字符串
     */
    detail(ids: string[]): Promise<string>;

    /**
     * 搜索数据内容
     * @param key 搜索关键词
     * @param quick 是否快速搜索
     * @param pg 页码
     * @returns JSON字符串
     */
    search(key: string, quick?: boolean, pg?: string): Promise<string>;

    /**
     * 播放信息
     * @param flag 线路标识
     * @param id 视频ID
     * @param vipFlags VIP标识列表
     * @returns JSON字符串
     */
    play(flag: string, id: string, vipFlags?: string[]): Promise<string>;

    /**
     * 是否手动检测webview中加载的url
     * @returns 是否需要手动检测
     */
    sniffer(): Promise<boolean>;

    /**
     * 是否是视频格式
     * @param url URL地址
     * @returns 是否是视频
     */
    isVideo(url: string): Promise<boolean>;

    /**
     * 销毁Spider，释放资源
     */
    destroy(): void;
}

/**
 * Spider配置
 */
export interface SpiderConfig {
    /** Spider唯一标识 */
    key: string;
    /** Spider API地址 */
    api: string;
    /** 扩展参数 */
    ext?: string;
    /** JAR包地址 */
    jar?: string;
    /** 缓存时间（毫秒） */
    cacheTime?: number;
}

/**
 * Spider执行结果
 */
export interface SpiderResult<T = string> {
    /** 是否成功 */
    success: boolean;
    /** 返回数据 */
    data?: T;
    /** 错误信息 */
    error?: string;
    /** 执行时间（毫秒） */
    duration?: number;
}

/**
 * Spider包装器配置
 */
export interface SpiderWrapperConfig {
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 缓存时间（毫秒） */
    cacheTime?: number;
    /** 是否启用日志 */
    enableLog?: boolean;
}
