import { ISpider } from '../types/spider.interface';
import { JSEngine } from './js-engine';
/**
 * Spider包装器配置
 */
interface SpiderWrapperConfig {
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 是否启用日志 */
    enableLog?: boolean;
}
/**
 * Spider包装器
 * 封装JSEngine，提供ISpider接口
 */
export declare class SpiderWrapper implements ISpider {
    private engine;
    private key;
    private config;
    private isInitialized;
    constructor(engine: JSEngine, key: string, config?: SpiderWrapperConfig);
    /**
     * 初始化Spider
     */
    init(ext?: string): Promise<void>;
    /**
     * 首页数据
     */
    home(filter?: boolean): Promise<string>;
    /**
     * 首页最近更新
     */
    homeVod(): Promise<string>;
    /**
     * 分类数据
     */
    category(tid: string, pg: string, filter?: boolean, extend?: Record<string, string>): Promise<string>;
    /**
     * 详情数据
     */
    detail(ids: string[]): Promise<string>;
    /**
     * 搜索数据
     */
    search(key: string, quick?: boolean, pg?: string): Promise<string>;
    /**
     * 播放数据
     */
    play(flag: string, id: string, vipFlags?: string[]): Promise<string>;
    /**
     * 是否手动检测
     */
    sniffer(): Promise<boolean>;
    /**
     * 是否是视频
     */
    isVideo(url: string): Promise<boolean>;
    /**
     * 销毁Spider
     */
    destroy(): void;
    /**
     * 确保Spider已初始化
     */
    private ensureInitialized;
    /**
     * 安全调用方法
     */
    private safeCall;
}
export {};
//# sourceMappingURL=spider-wrapper.d.ts.map