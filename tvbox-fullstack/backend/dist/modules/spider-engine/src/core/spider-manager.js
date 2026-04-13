"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderManager = void 0;
const errors_1 = require("../types/errors");
const js_engine_1 = require("./js-engine");
const spider_wrapper_1 = require("./spider-wrapper");
const axios_1 = require("axios");
class SpiderManager {
    constructor(config = {}) {
        this.spiders = new Map();
        this.cache = new Map();
        this.config = {
            maxCacheSize: config.maxCacheSize || 100,
            cacheTime: config.cacheTime || 3600000,
            timeout: config.timeout || 30000,
            enableLog: config.enableLog || false,
        };
    }
    async loadSpider(config) {
        const { key, api, ext, jar } = config;
        if (this.spiders.has(key)) {
            return this.spiders.get(key);
        }
        if (this.spiders.size >= (this.config.maxCacheSize || 100)) {
            const oldestKey = this.spiders.keys().next().value;
            if (oldestKey) {
                this.destroySpider(oldestKey);
            }
        }
        try {
            const spiderCode = await this.loadSpiderCode(api, jar);
            const engine = new js_engine_1.JSEngine({
                timeout: this.config.timeout,
                enableLog: this.config.enableLog,
            });
            await engine.execute(spiderCode);
            const wrapper = new spider_wrapper_1.SpiderWrapper(engine, key, {
                timeout: this.config.timeout,
                enableLog: this.config.enableLog,
            });
            await wrapper.init(ext || '');
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
    getSpider(key) {
        return this.spiders.get(key);
    }
    destroySpider(key) {
        const spider = this.spiders.get(key);
        if (spider) {
            spider.destroy();
            this.spiders.delete(key);
        }
    }
    destroyAll() {
        this.spiders.forEach((spider, key) => {
            spider.destroy();
            this.spiders.delete(key);
        });
        this.cache.clear();
    }
    getSpiderCount() {
        return this.spiders.size;
    }
    getSpiderList() {
        return Array.from(this.spiders.keys());
    }
    async loadSpiderCode(api, jar) {
        if (jar) {
            return await this.loadFromJar(jar);
        }
        return await this.loadFromAPI(api);
    }
    async loadFromAPI(api) {
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
    async loadFromJar(jar) {
        const cached = this.cache.get(jar);
        if (cached && Date.now() - cached.timestamp < (this.config.cacheTime || 3600000)) {
            return cached.code;
        }
        try {
            const response = await axios_1.default.get(jar, {
                timeout: 30000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.INIT_FAILED, 'JAR包加载功能暂未实现', { jar: jar || '' });
        }
        catch (error) {
            if (error instanceof errors_1.SpiderError) {
                throw error;
            }
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.NETWORK_ERROR, `从JAR包加载代码失败: ${jar}`, { error: error.message });
        }
    }
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