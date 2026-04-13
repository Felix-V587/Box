import { ISpider, SpiderConfig } from '../types/spider.interface';
/**
 * Spider管理器
 * 负责加载、创建、缓存和销毁Spider实例
 */
export declare class SpiderManager {
    private spiders;
    private cache;
    private config;
    constructor(config?: SpiderManagerConfig);
    /**
     * 加载Spider
     * @param config Spider配置
     * @returns Spider实例
     */
    loadSpider(config: SpiderConfig): Promise<ISpider>;
    /**
     * 获取Spider
     * @param key Spider唯一标识
     * @returns Spider实例
     */
    getSpider(key: string): ISpider | undefined;
    /**
     * 销毁Spider
     * @param key Spider唯一标识
     */
    destroySpider(key: string): void;
    /**
     * 销毁所有Spider
     */
    destroyAll(): void;
    /**
     * 获取Spider数量
     */
    getSpiderCount(): number;
    /**
     * 获取Spider列表
     */
    getSpiderList(): string[];
    /**
     * 加载Spider代码
     * @param api API地址
     * @param jar JAR包地址
     * @returns Spider代码
     */
    private loadSpiderCode;
    /**
     * 从API加载代码
     * @param api API地址
     * @returns 代码
     */
    private loadFromAPI;
    /**
     * 从JAR包加载代码
     * @param jar JAR包地址
     * @returns 代码
     */
    private loadFromJar;
    /**
     * 清理过期缓存
     */
    cleanExpiredCache(): void;
}
/**
 * Spider管理器配置
 */
interface SpiderManagerConfig {
    /** 最大缓存数量 */
    maxCacheSize?: number;
    /** 缓存时间（毫秒） */
    cacheTime?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 是否启用日志 */
    enableLog?: boolean;
}
export {};
//# sourceMappingURL=spider-manager.d.ts.map