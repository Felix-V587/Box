"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderManager = void 0;
const errors_1 = require("../types/errors");
const js_engine_1 = require("./js-engine");
const spider_wrapper_1 = require("./spider-wrapper");
const axios_1 = __importDefault(require("axios"));
/**
 * Spider管理器
 * 负责加载、创建、缓存和销毁Spider实例
 */
class SpiderManager {
    constructor(config = {}) {
        this.spiders = new Map();
        this.cache = new Map();
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
    async loadSpider(config) {
        const { key, api, ext, jar } = config;
        // 检查缓存
        if (this.spiders.has(key)) {
            return this.spiders.get(key);
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
            const engine = new js_engine_1.JSEngine({
                timeout: this.config.timeout,
                enableLog: this.config.enableLog,
            });
            // 执行Spider代码
            await engine.execute(spiderCode);
            // 创建Spider包装器
            const wrapper = new spider_wrapper_1.SpiderWrapper(engine, key, {
                timeout: this.config.timeout,
                enableLog: this.config.enableLog,
            });
            // 初始化Spider
            await wrapper.init(ext || '');
            // 缓存Spider
            this.spiders.set(key, wrapper);
            return wrapper;
        }
        catch (error) {
            if (error instanceof errors_1.SpiderError) {
                throw error;
            }
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.INIT_FAILED, '加载Spider失败', { key, api, error: error.message });
        }
    }
    /**
     * 获取Spider
     * @param key Spider唯一标识
     * @returns Spider实例
     */
    getSpider(key) {
        return this.spiders.get(key);
    }
    /**
     * 销毁Spider
     * @param key Spider唯一标识
     */
    destroySpider(key) {
        const spider = this.spiders.get(key);
        if (spider) {
            spider.destroy();
            this.spiders.delete(key);
        }
    }
    /**
     * 销毁所有Spider
     */
    destroyAll() {
        this.spiders.forEach((spider, key) => {
            spider.destroy();
            this.spiders.delete(key);
        });
        this.cache.clear();
    }
    /**
     * 获取Spider数量
     */
    getSpiderCount() {
        return this.spiders.size;
    }
    /**
     * 获取Spider列表
     */
    getSpiderList() {
        return Array.from(this.spiders.keys());
    }
    /**
     * 加载Spider代码
     * @param api API地址
     * @param jar JAR包地址
     * @returns Spider代码
     */
    async loadSpiderCode(api, jar) {
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
    async loadFromAPI(api) {
        // 检查缓存
        const cached = this.cache.get(api);
        if (cached && Date.now() - cached.timestamp < (this.config.cacheTime || 3600000)) {
            return cached.code;
        }
        try {
            const response = await axios_1.default.get(api, {
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
        }
        catch (error) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.NETWORK_ERROR, `从API加载代码失败: ${api}`, { error: error.message });
        }
    }
    /**
     * 从JAR包加载代码
     * @param jar JAR包地址
     * @returns 代码
     */
    async loadFromJar(jar) {
        // 检查缓存
        const cached = this.cache.get(jar);
        if (cached && Date.now() - cached.timestamp < (this.config.cacheTime || 3600000)) {
            return cached.code;
        }
        try {
            // 下载JAR包
            const response = await axios_1.default.get(jar, {
                timeout: 30000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            // 这里需要解压JAR包并提取Spider代码
            // 由于Node.js没有内置的JAR解压功能，需要使用第三方库
            // 暂时返回空字符串，实际应用中需要实现JAR解压
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.INIT_FAILED, 'JAR包加载功能暂未实现', { jar: jar || '' });
        }
        catch (error) {
            if (error instanceof errors_1.SpiderError) {
                throw error;
            }
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.NETWORK_ERROR, `从JAR包加载代码失败: ${jar}`, { error: error.message });
        }
    }
    /**
     * 清理过期缓存
     */
    cleanExpiredCache() {
        const now = Date.now();
        const keysToDelete = [];
        this.cache.forEach((value, key) => {
            if (now - value.timestamp > (this.config.cacheTime || 3600000)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
    }
}
exports.SpiderManager = SpiderManager;
//# sourceMappingURL=spider-manager.js.map