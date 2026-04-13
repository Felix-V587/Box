import { ISpider, SpiderConfig } from '../types/spider.interface';
import { SpiderError, SpiderErrorCode, createSpiderError } from '../types/errors';
import { JSEngine } from './js-engine';
import { SpiderWrapper } from './spider-wrapper';
import axios from 'axios';

/**
 * Spider管理器
 * 负责加载、创建、缓存和销毁Spider实例
 */
export class SpiderManager {
    private spiders: Map<string, ISpider> = new Map();
    private cache: Map<string, { code: string; timestamp: number }> = new Map();
    private config: SpiderManagerConfig;

    constructor(config: SpiderManagerConfig = {}) {
        this.config = {
            maxCacheSize: config.maxCacheSize || 100,
            cacheTime: config.cacheTime || 3600000, // 1小时
            timeout: config.timeout || 30000,
            enableLog: config.enableLog || false,
        };
    }

    /**
     * 加载Spider
     * @param config Spider配置
     * @returns Spider实例
     */
    async loadSpider(config: SpiderConfig): Promise<ISpider> {
        const { key, api, ext, jar } = config;

        // 检查缓存
        if (this.spiders.has(key)) {
            return this.spiders.get(key)!;
        }

        // 检查缓存大小
        if (this.spiders.size >= (this.config.maxCacheSize || 100)) {
            // 清理最老的Spider
            const oldestKey = this.spiders.keys().next().value;
            if (oldestKey) {
                this.destroySpider(oldestKey);
            }
        }

        try {
            // 获取Spider代码
            const spiderCode = await this.loadSpiderCode(api, jar);

            // 创建JSEngine
            const engine = new JSEngine({
                timeout: this.config.timeout,
                enableLog: this.config.enableLog,
            });

            // 执行Spider代码
            await engine.execute(spiderCode);

            // 创建Spider包装器
            const wrapper = new SpiderWrapper(engine, key, {
                timeout: this.config.timeout,
                enableLog: this.config.enableLog,
            });

            // 初始化Spider
            await wrapper.init(ext || '');

            // 缓存Spider
            this.spiders.set(key, wrapper);

            return wrapper;
        } catch (error: any) {
            if (error instanceof SpiderError) {
                throw error;
            }
            throw createSpiderError(
                SpiderErrorCode.INIT_FAILED,
                '加载Spider失败',
                { key, api, error: error.message }
            );
        }
    }

    /**
     * 获取Spider
     * @param key Spider唯一标识
     * @returns Spider实例
     */
    getSpider(key: string): ISpider | undefined {
        return this.spiders.get(key);
    }

    /**
     * 销毁Spider
     * @param key Spider唯一标识
     */
    destroySpider(key: string): void {
        const spider = this.spiders.get(key);
        if (spider) {
            spider.destroy();
            this.spiders.delete(key);
        }
    }

    /**
     * 销毁所有Spider
     */
    destroyAll(): void {
        this.spiders.forEach((spider, key) => {
            spider.destroy();
            this.spiders.delete(key);
        });
        this.cache.clear();
    }

    /**
     * 获取Spider数量
     */
    getSpiderCount(): number {
        return this.spiders.size;
    }

    /**
     * 获取Spider列表
     */
    getSpiderList(): string[] {
        return Array.from(this.spiders.keys());
    }

    /**
     * 加载Spider代码
     * @param api API地址
     * @param jar JAR包地址
     * @returns Spider代码
     */
    private async loadSpiderCode(api: string, jar?: string): Promise<string> {
        // 如果有JAR包，从JAR包加载
        if (jar) {
            return await this.loadFromJar(jar);
        }

        // 从API加载
        return await this.loadFromAPI(api);
    }

    /**
     * 从API加载代码
     * @param api API地址
     * @returns 代码
     */
    private async loadFromAPI(api: string): Promise<string> {
        // 检查缓存
        const cached = this.cache.get(api);
        if (cached && Date.now() - cached.timestamp < (this.config.cacheTime || 3600000)) {
            return cached.code;
        }

        try {
            const response = await axios.get(api, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const code = response.data;

            // 缓存代码
            if (typeof code === 'string') {
                this.cache.set(api, {
                    code: code,
                    timestamp: Date.now(),
                });
                return code;
            }
            return String(code);
        } catch (error: any) {
            throw createSpiderError(
                SpiderErrorCode.NETWORK_ERROR,
                `从API加载代码失败: ${api}`,
                { error: error.message }
            );
        }
    }

    /**
     * 从JAR包加载代码
     * @param jar JAR包地址
     * @returns 代码
     */
    private async loadFromJar(jar: string): Promise<string> {
        // 检查缓存
        const cached = this.cache.get(jar);
        if (cached && Date.now() - cached.timestamp < (this.config.cacheTime || 3600000)) {
            return cached.code;
        }

        try {
            // 下载JAR包
            const response = await axios.get<ArrayBuffer>(jar, {
                timeout: 30000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            // 这里需要解压JAR包并提取Spider代码
            // 由于Node.js没有内置的JAR解压功能，需要使用第三方库
            // 暂时返回空字符串，实际应用中需要实现JAR解压
            throw createSpiderError(
                SpiderErrorCode.INIT_FAILED,
                'JAR包加载功能暂未实现',
                { jar: jar || '' }
            );
        } catch (error: any) {
            if (error instanceof SpiderError) {
                throw error;
            }
            throw createSpiderError(
                SpiderErrorCode.NETWORK_ERROR,
                `从JAR包加载代码失败: ${jar}`,
                { error: error.message }
            );
        }
    }

    /**
     * 清理过期缓存
     */
    cleanExpiredCache(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        this.cache.forEach((value, key) => {
            if (now - value.timestamp > (this.config.cacheTime || 3600000)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.cache.delete(key));
    }
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
