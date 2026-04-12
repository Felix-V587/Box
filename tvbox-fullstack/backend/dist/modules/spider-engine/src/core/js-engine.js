"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSEngine = void 0;
const vm2_1 = require("vm2");
const errors_1 = require("../types/errors");
const global_api_1 = require("../api/global-api");
const module_loader_1 = require("../utils/module-loader");
class JSEngine {
    constructor(config = {}) {
        this.isDestroyed = false;
        this.config = {
            timeout: config.timeout || 30000,
            enableModule: config.enableModule !== false,
            enableLog: config.enableLog || false,
        };
        this.vm = new vm2_1.VM({
            timeout: this.config.timeout,
            sandbox: {},
            eval: false,
            wasm: false,
            fixAsync: true,
            allowAsync: false,
        });
        this.globalAPI = new global_api_1.GlobalAPI();
        this.moduleLoader = new module_loader_1.ModuleLoader();
    }
    async injectGlobalAPI() {
        if (this.isDestroyed) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.INIT_FAILED, 'JSEngine已被销毁');
        }
        try {
            this.vm.setGlobal('http', this.wrapObject(this.globalAPI.http));
            this.vm.setGlobal('pdfh', this.globalAPI.pdfh);
            this.vm.setGlobal('pdfa', this.globalAPI.pdfa);
            this.vm.setGlobal('pd', this.globalAPI.pd);
            this.vm.setGlobal('pdfla', this.globalAPI.pdfla);
            this.vm.setGlobal('crypto', this.wrapObject(this.globalAPI.crypto));
            this.vm.setGlobal('joinUrl', this.globalAPI.joinUrl);
            this.vm.setGlobal('s2t', this.globalAPI.s2t);
            this.vm.setGlobal('t2s', this.globalAPI.t2s);
            if (this.config.enableModule) {
                this.vm.setGlobal('require', this.createRequire());
            }
        }
        catch (error) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.INIT_FAILED, '注入全局API失败', { error: error.message });
        }
    }
    async execute(code) {
        if (this.isDestroyed) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, 'JSEngine已被销毁');
        }
        try {
            await this.vm.run(code);
        }
        catch (error) {
            if (error.message && error.message.includes('Script execution timed out')) {
                throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_TIMEOUT, '脚本执行超时', { timeout: this.config.timeout });
            }
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.RUNTIME_ERROR, '脚本执行失败', { error: error.message, stack: error.stack });
        }
    }
    async call(funcName, ...args) {
        if (this.isDestroyed) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, 'JSEngine已被销毁');
        }
        try {
            const exists = await this.vm.run(`typeof ${funcName} !== 'undefined'`);
            if (!exists) {
                throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.METHOD_NOT_FOUND, `方法 ${funcName} 不存在`);
            }
            const result = await this.vm.run(`${funcName}(...${JSON.stringify(args)})`);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.SpiderError) {
                throw error;
            }
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, `调用方法 ${funcName} 失败`, { error: error.message, args });
        }
    }
    async getGlobal(varName) {
        if (this.isDestroyed) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, 'JSEngine已被销毁');
        }
        try {
            return await this.vm.run(varName);
        }
        catch (error) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, `获取全局变量 ${varName} 失败`, { error: error.message });
        }
    }
    async setGlobal(varName, value) {
        if (this.isDestroyed) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, 'JSEngine已被销毁');
        }
        try {
            this.vm.setGlobal(varName, value);
        }
        catch (error) {
            throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.EXEC_FAILED, `设置全局变量 ${varName} 失败`, { error: error.message });
        }
    }
    destroy() {
        if (this.isDestroyed)
            return;
        try {
            this.isDestroyed = true;
        }
        catch (error) {
        }
    }
    createRequire() {
        return (moduleName) => {
            return this.moduleLoader.load(moduleName);
        };
    }
    wrapObject(obj) {
        const wrapped = {};
        for (const key in obj) {
            if (typeof obj[key] === 'function') {
                wrapped[key] = (...args) => {
                    try {
                        return obj[key](...args);
                    }
                    catch (error) {
                        throw (0, errors_1.createSpiderError)(errors_1.SpiderErrorCode.RUNTIME_ERROR, `调用 ${key} 失败`, { error: error.message });
                    }
                };
            }
            else {
                wrapped[key] = obj[key];
            }
        }
        return wrapped;
    }
}
exports.JSEngine = JSEngine;
//# sourceMappingURL=js-engine.js.map