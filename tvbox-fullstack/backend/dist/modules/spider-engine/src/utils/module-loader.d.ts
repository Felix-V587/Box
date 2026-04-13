export declare class ModuleLoader {
    private cache;
    load(moduleName: string): any;
    clearCache(): void;
    getModuleList(): string[];
}
