"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleLoader = void 0;
const cheerio = __importStar(require("cheerio"));
const crypto_js_1 = __importDefault(require("crypto-js"));
/**
 * 模块加载器
 * 支持加载cheerio、crypto-js等模块
 */
class ModuleLoader {
    constructor() {
        this.cache = new Map();
    }
    /**
     * 加载模块
     * @param moduleName 模块名称
     * @returns 模块对象
     */
    load(moduleName) {
        // 检查缓存
        if (this.cache.has(moduleName)) {
            return this.cache.get(moduleName);
        }
        let module;
        // 加载内置模块
        switch (moduleName) {
            case 'cheerio':
                module = cheerio;
                break;
            case 'crypto-js':
                module = crypto_js_1.default;
                break;
            default:
                // 尝试动态加载
                try {
                    // 这里可以实现从网络或本地加载模块的逻辑
                    // 暂时返回空对象
                    module = {};
                }
                catch (error) {
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
    clearCache() {
        this.cache.clear();
    }
    /**
     * 获取模块列表
     */
    getModuleList() {
        return Array.from(this.cache.keys());
    }
}
exports.ModuleLoader = ModuleLoader;
//# sourceMappingURL=module-loader.js.map