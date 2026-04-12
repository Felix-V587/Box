"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleLoader = void 0;
const cheerio = require("cheerio");
const crypto_js_1 = require("crypto-js");
class ModuleLoader {
    constructor() {
        this.cache = new Map();
    }
    load(moduleName) {
        if (this.cache.has(moduleName)) {
            return this.cache.get(moduleName);
        }
        let module;
        switch (moduleName) {
            case 'cheerio':
                module = cheerio;
                break;
            case 'crypto-js':
                module = crypto_js_1.default;
                break;
            default:
                try {
                    module = {};
                }
                catch (error) {
                    console.error(`Failed to load module: ${moduleName}`, error);
                    module = {};
                }
        }
        this.cache.set(moduleName, module);
        return module;
    }
    clearCache() {
        this.cache.clear();
    }
    getModuleList() {
        return Array.from(this.cache.keys());
    }
}
exports.ModuleLoader = ModuleLoader;
//# sourceMappingURL=module-loader.js.map