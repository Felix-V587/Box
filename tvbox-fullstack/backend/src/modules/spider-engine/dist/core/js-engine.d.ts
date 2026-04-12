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
export declare class JSEngine {
    private vm;
    private config;
    private globalAPI;
    private moduleLoader;
    private isDestroyed;
    constructor(config?: JSEngineConfig);
    /**
     * 注入全局API
     */
    injectGlobalAPI(): Promise<void>;
    /**
     * 执行JavaScript代码
     */
    execute(code: string): Promise<void>;
    /**
     * 调用Spider方法
     */
    call(funcName: string, ...args: any[]): Promise<any>;
    /**
     * 获取全局变量
     */
    getGlobal(varName: string): Promise<any>;
    /**
     * 设置全局变量
     */
    setGlobal(varName: string, value: any): Promise<void>;
    /**
     * 销毁引擎
     */
    destroy(): void;
    /**
     * 创建require函数
     */
    private createRequire;
    /**
     * 包装对象，使其在vm2中可用
     */
    private wrapObject;
}
//# sourceMappingURL=js-engine.d.ts.map