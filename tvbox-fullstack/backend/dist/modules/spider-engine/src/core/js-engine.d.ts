export interface JSEngineConfig {
    timeout?: number;
    enableModule?: boolean;
    enableLog?: boolean;
}
export declare class JSEngine {
    private vm;
    private config;
    private globalAPI;
    private moduleLoader;
    private isDestroyed;
    constructor(config?: JSEngineConfig);
    injectGlobalAPI(): Promise<void>;
    execute(code: string): Promise<void>;
    call(funcName: string, ...args: any[]): Promise<any>;
    getGlobal(varName: string): Promise<any>;
    setGlobal(varName: string, value: any): Promise<void>;
    destroy(): void;
    private createRequire;
    private wrapObject;
}
