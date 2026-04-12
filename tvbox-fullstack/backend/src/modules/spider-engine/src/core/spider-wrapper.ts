import { ISpider, SpiderConfig, SpiderResult } from '../types/spider.interface';
import { SpiderError, SpiderErrorCode, createSpiderError } from '../types/errors';
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
export class SpiderWrapper implements ISpider {
    private engine: JSEngine;
    private key: string;
    private config: SpiderWrapperConfig;
    private isInitialized: boolean = false;

    constructor(
        engine: JSEngine,
        key: string,
        config: SpiderWrapperConfig = {}
    ) {
        this.engine = engine;
        this.key = key;
        this.config = {
            timeout: config.timeout || 30000,
            enableLog: config.enableLog || false,
        };
    }

    /**
     * 初始化Spider
     */
    async init(ext?: string): Promise<void> {
        try {
            // 注入全局API
            await this.engine.injectGlobalAPI();

            // 调用Spider的init方法
            if (ext) {
                await this.engine.call('init', ext);
            } else {
                await this.engine.call('init');
            }

            this.isInitialized = true;
        } catch (error: any) {
            if (error instanceof SpiderError) {
                throw error;
            }
            throw createSpiderError(
                SpiderErrorCode.INIT_FAILED,
                'Spider初始化失败',
                { error: error.message }
            );
        }
    }

    /**
     * 首页数据
     */
    async home(filter?: boolean): Promise<string> {
        this.ensureInitialized();
        return await this.safeCall('home', filter);
    }

    /**
     * 首页最近更新
     */
    async homeVod(): Promise<string> {
        this.ensureInitialized();
        return await this.safeCall('homeVod');
    }

    /**
     * 分类数据
     */
    async category(
        tid: string,
        pg: string,
        filter?: boolean,
        extend?: Record<string, string>
    ): Promise<string> {
        this.ensureInitialized();
        return await this.safeCall('category', tid, pg, filter, extend);
    }

    /**
     * 详情数据
     */
    async detail(ids: string[]): Promise<string> {
        this.ensureInitialized();
        return await this.safeCall('detail', ids);
    }

    /**
     * 搜索数据
     */
    async search(key: string, quick?: boolean, pg?: string): Promise<string> {
        this.ensureInitialized();
        
        if (pg !== undefined) {
            return await this.safeCall('search', key, quick, pg);
        }
        return await this.safeCall('search', key, quick);
    }

    /**
     * 播放数据
     */
    async play(flag: string, id: string, vipFlags?: string[]): Promise<string> {
        this.ensureInitialized();
        return await this.safeCall('play', flag, id, vipFlags);
    }

    /**
     * 是否手动检测
     */
    async sniffer(): Promise<boolean> {
        this.ensureInitialized();
        try {
            const result = await this.safeCall('sniffer');
            return result === 'true';
        } catch (error) {
            return false;
        }
    }

    /**
     * 是否是视频
     */
    async isVideo(url: string): Promise<boolean> {
        this.ensureInitialized();
        try {
            const result = await this.safeCall('isVideo', url);
            return result === 'true';
        } catch (error) {
            return false;
        }
    }

    /**
     * 销毁Spider
     */
    destroy(): void {
        this.engine.destroy();
        this.isInitialized = false;
    }

    /**
     * 确保Spider已初始化
     */
    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw createSpiderError(
                SpiderErrorCode.INIT_FAILED,
                'Spider未初始化，请先调用init方法'
            );
        }
    }

    /**
     * 安全调用方法
     */
    private async safeCall(funcName: string, ...args: any[]): Promise<string> {
        try {
            const startTime = Date.now();

            // 调用方法
            const result = await this.engine.call(funcName, ...args);

            // 检查超时
            const duration = Date.now() - startTime;
            if (duration > (this.config.timeout || 30000)) {
                throw createSpiderError(
                    SpiderErrorCode.EXEC_TIMEOUT,
                    `方法 ${funcName} 执行超时`,
                    { duration, timeout: this.config.timeout || 30000 }
                );
            }

            // 返回结果
            if (typeof result === 'string') {
                return result;
            } else if (result !== null && result !== undefined) {
                return JSON.stringify(result);
            }

            return '';
        } catch (error: any) {
            if (error instanceof SpiderError) {
                throw error;
            }
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                `调用方法 ${funcName} 失败`,
                { error: error.message, args: args || [] }
            );
        }
    }
}
