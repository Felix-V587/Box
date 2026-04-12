"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderWrapper = void 0;
const errors_1 = require("../types/errors");
/**
 * Spider包装器
 * 封装JSEngine，提供ISpider接口
 */
class SpiderWrapper {
    constructor(engine, key, config = {}) {
        this.isInitialized = false;
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
    async init(ext) {
        try {
            // 注入全局API
            await this.engine.injectGlobalAPI();
            // 调用Spider的init方法
            if (ext) {
                await this.engine.call('init', ext);
            }
            else {
                await this.engine.call('init');
            }
            this.isInitialized = true;
        }
        catch (error) {
            if (error instanceof errors_1.SpiderError) {
                throw error;
            }
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.INIT_FAILED, 'Spider初始化失败', { error: error.message });
        }
    }
    /**
     * 首页数据
     */
    async home(filter) {
        this.ensureInitialized();
        return await this.safeCall('home', filter);
    }
    /**
     * 首页最近更新
     */
    async homeVod() {
        this.ensureInitialized();
        return await this.safeCall('homeVod');
    }
    /**
     * 分类数据
     */
    async category(tid, pg, filter, extend) {
        this.ensureInitialized();
        return await this.safeCall('category', tid, pg, filter, extend);
    }
    /**
     * 详情数据
     */
    async detail(ids) {
        this.ensureInitialized();
        return await this.safeCall('detail', ids);
    }
    /**
     * 搜索数据
     */
    async search(key, quick, pg) {
        this.ensureInitialized();
        if (pg !== undefined) {
            return await this.safeCall('search', key, quick, pg);
        }
        return await this.safeCall('search', key, quick);
    }
    /**
     * 播放数据
     */
    async play(flag, id, vipFlags) {
        this.ensureInitialized();
        return await this.safeCall('play', flag, id, vipFlags);
    }
    /**
     * 是否手动检测
     */
    async sniffer() {
        this.ensureInitialized();
        try {
            const result = await this.safeCall('sniffer');
            return result === 'true';
        }
        catch (error) {
            return false;
        }
    }
    /**
     * 是否是视频
     */
    async isVideo(url) {
        this.ensureInitialized();
        try {
            const result = await this.safeCall('isVideo', url);
            return result === 'true';
        }
        catch (error) {
            return false;
        }
    }
    /**
     * 销毁Spider
     */
    destroy() {
        this.engine.destroy();
        this.isInitialized = false;
    }
    /**
     * 确保Spider已初始化
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.INIT_FAILED, 'Spider未初始化，请先调用init方法');
        }
    }
    /**
     * 安全调用方法
     */
    async safeCall(funcName, ...args) {
        try {
            const startTime = Date.now();
            // 调用方法
            const result = await this.engine.call(funcName, ...args);
            // 检查超时
            const duration = Date.now() - startTime;
            if (duration > (this.config.timeout || 30000)) {
                throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_TIMEOUT, `方法 ${funcName} 执行超时`, { duration, timeout: this.config.timeout || 30000 });
            }
            // 返回结果
            if (typeof result === 'string') {
                return result;
            }
            else if (result !== null && result !== undefined) {
                return JSON.stringify(result);
            }
            return '';
        }
        catch (error) {
            if (error instanceof errors_1.SpiderError) {
                throw error;
            }
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, `调用方法 ${funcName} 失败`, { error: error.message, args: args || [] });
        }
    }
}
exports.SpiderWrapper = SpiderWrapper;
//# sourceMappingURL=spider-wrapper.js.map