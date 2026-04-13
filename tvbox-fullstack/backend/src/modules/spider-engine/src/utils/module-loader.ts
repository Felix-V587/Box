import * as cheerio from 'cheerio';
import CryptoJS from 'crypto-js';

/**
 * 模块加载器
 * 支持加载cheerio、crypto-js等模块
 */
export class ModuleLoader {
    private cache: Map<string, any> = new Map();

    /**
     * 加载模块
     * @param moduleName 模块名称
     * @returns 模块对象
     */
    load(moduleName: string): any {
        // 检查缓存
        if (this.cache.has(moduleName)) {
            return this.cache.get(moduleName);
        }

        let module: any;

        // 加载内置模块
        switch (moduleName) {
            case 'cheerio':
                module = cheerio;
                break;

            case 'crypto-js':
                module = CryptoJS;
                break;

            default:
                // 尝试动态加载
                try {
                    // 这里可以实现从网络或本地加载模块的逻辑
                    // 暂时返回空对象
                    module = {};
                } catch (error) {
                    console.error(`Failed to load module: ${moduleName}`, error);
                    module = {};
                }
        }

        // 缓存模块
        this.cache.set(moduleName, module);
        return module;
    }

    /**
     * 清除缓存
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * 获取模块列表
     */
    getModuleList(): string[] {
        return Array.from(this.cache.keys());
    }
}
