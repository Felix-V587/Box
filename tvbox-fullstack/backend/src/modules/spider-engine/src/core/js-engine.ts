import { VM } from 'vm2';
import { SpiderError, SpiderErrorCode, createSpiderError } from '../types/errors';
import { GlobalAPI } from '../api/global-api';
import { ModuleLoader } from '../utils/module-loader';

/**
 * JavaScript引擎配置
 */
export interface JSEngineConfig {
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 是否启用模块系统 */
    enableModule?: boolean;
    /** 是否启用日志 */
    enableLog?: boolean;
}

/**
 * JavaScript引擎
 * 使用vm2创建安全的JavaScript执行环境
 */
export class JSEngine {
    private vm: VM;
    private config: JSEngineConfig;
    private globalAPI: GlobalAPI;
    private moduleLoader: ModuleLoader;
    private isDestroyed: boolean = false;

    constructor(config: JSEngineConfig = {}) {
        this.config = {
            timeout: config.timeout || 30000,
            enableModule: config.enableModule !== false,
            enableLog: config.enableLog || false,
        };

        // 创建vm2沙箱
        this.vm = new VM({
            timeout: this.config.timeout,
            sandbox: {},
            eval: false,
            wasm: false,
            fixAsync: true,
            allowAsync: false,
        });

        // 初始化全局API
        this.globalAPI = new GlobalAPI();

        // 初始化模块加载器
        this.moduleLoader = new ModuleLoader();
    }

    /**
     * 注入全局API
     */
    async injectGlobalAPI(): Promise<void> {
        if (this.isDestroyed) {
            throw createSpiderError(
                SpiderErrorCode.INIT_FAILED,
                'JSEngine已被销毁'
            );
        }

        try {
            // 注入HTTP模块
            this.vm.setGlobal('http', this.wrapObject(this.globalAPI.http));

            // 注入HTML解析模块
            this.vm.setGlobal('pdfh', this.globalAPI.pdfh);
            this.vm.setGlobal('pdfa', this.globalAPI.pdfa);
            this.vm.setGlobal('pd', this.globalAPI.pd);
            this.vm.setGlobal('pdfla', this.globalAPI.pdfla);

            // 注入加密模块
            this.vm.setGlobal('crypto', this.wrapObject(this.globalAPI.crypto));

            // 注入工具函数
            this.vm.setGlobal('joinUrl', this.globalAPI.joinUrl);
            this.vm.setGlobal('s2t', this.globalAPI.s2t);
            this.vm.setGlobal('t2s', this.globalAPI.t2s);

            // 注入require函数（如果启用模块系统）
            if (this.config.enableModule) {
                this.vm.setGlobal('require', this.createRequire());
            }

        } catch (error: any) {
            throw createSpiderError(
                SpiderErrorCode.INIT_FAILED,
                '注入全局API失败',
                { error: error.message }
            );
        }
    }

    /**
     * 执行JavaScript代码
     */
    async execute(code: string): Promise<void> {
        if (this.isDestroyed) {
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                'JSEngine已被销毁'
            );
        }

        try {
            await this.vm.run(code);
        } catch (error: any) {
            if (error.message && error.message.includes('Script execution timed out')) {
                throw createSpiderError(
                    SpiderErrorCode.EXEC_TIMEOUT,
                    '脚本执行超时',
                    { timeout: this.config.timeout }
                );
            }
            throw createSpiderError(
                SpiderErrorCode.RUNTIME_ERROR,
                '脚本执行失败',
                { error: error.message, stack: error.stack }
            );
        }
    }

    /**
     * 调用Spider方法
     */
    async call(funcName: string, ...args: any[]): Promise<any> {
        if (this.isDestroyed) {
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                'JSEngine已被销毁'
            );
        }

        try {
            // 检查方法是否存在
            const exists = await this.vm.run(`typeof ${funcName} !== 'undefined'`);
            if (!exists) {
                throw createSpiderError(
                    SpiderErrorCode.METHOD_NOT_FOUND,
                    `方法 ${funcName} 不存在`
                );
            }

            // 调用方法
            const result = await this.vm.run(`${funcName}(...${JSON.stringify(args)})`);
            return result;
        } catch (error: any) {
            if (error instanceof SpiderError) {
                throw error;
            }
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                `调用方法 ${funcName} 失败`,
                { error: error.message, args }
            );
        }
    }

    /**
     * 获取全局变量
     */
    async getGlobal(varName: string): Promise<any> {
        if (this.isDestroyed) {
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                'JSEngine已被销毁'
            );
        }

        try {
            return await this.vm.run(varName);
        } catch (error: any) {
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                `获取全局变量 ${varName} 失败`,
                { error: error.message }
            );
        }
    }

    /**
     * 设置全局变量
     */
    async setGlobal(varName: string, value: any): Promise<void> {
        if (this.isDestroyed) {
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                'JSEngine已被销毁'
            );
        }

        try {
            this.vm.setGlobal(varName, value);
        } catch (error: any) {
            throw createSpiderError(
                SpiderErrorCode.EXEC_FAILED,
                `设置全局变量 ${varName} 失败`,
                { error: error.message }
            );
        }
    }

    /**
     * 销毁引擎
     */
    destroy(): void {
        if (this.isDestroyed) return;

        try {
            // vm2的VM实例没有destroy方法，只需要标记为已销毁
            this.isDestroyed = true;
        } catch (error) {
            // 忽略销毁错误
        }
    }

    /**
     * 创建require函数
     */
    private createRequire(): (moduleName: string) => any {
        return (moduleName: string) => {
            return this.moduleLoader.load(moduleName);
        };
    }

    /**
     * 包装对象，使其在vm2中可用
     */
    private wrapObject(obj: any): any {
        const wrapped: any = {};
        for (const key in obj) {
            if (typeof obj[key] === 'function') {
                wrapped[key] = (...args: any[]) => {
                    try {
                        return obj[key](...args);
                    } catch (error: any) {
                        throw createSpiderError(
                            SpiderErrorCode.RUNTIME_ERROR,
                            `调用 ${key} 失败`,
                            { error: error.message }
                        );
                    }
                };
            } else {
                wrapped[key] = obj[key];
            }
        }
        return wrapped;
    }
}
