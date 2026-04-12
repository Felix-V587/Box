/**
 * 模块加载器
 * 支持加载cheerio、crypto-js等模块
 */
export declare class ModuleLoader {
    private cache;
    /**
     * 加载模块
     * @param moduleName 模块名称
     * @returns 模块对象
     */
    load(moduleName: string): any;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 获取模块列表
     */
    getModuleList(): string[];
}
//# sourceMappingURL=module-loader.d.ts.map