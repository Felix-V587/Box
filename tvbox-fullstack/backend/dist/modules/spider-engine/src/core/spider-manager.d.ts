import { ISpider, SpiderConfig } from '../types/spider.interface';
export declare class SpiderManager {
    private spiders;
    private cache;
    private config;
    constructor(config?: SpiderManagerConfig);
    loadSpider(config: SpiderConfig): Promise<ISpider>;
    getSpider(key: string): ISpider | undefined;
    destroySpider(key: string): void;
    destroyAll(): void;
    getSpiderCount(): number;
    getSpiderList(): string[];
    private loadSpiderCode;
    private loadFromAPI;
    private loadFromJar;
    cleanExpiredCache(): void;
}
interface SpiderManagerConfig {
    maxCacheSize?: number;
    cacheTime?: number;
    timeout?: number;
    enableLog?: boolean;
}
export {};
