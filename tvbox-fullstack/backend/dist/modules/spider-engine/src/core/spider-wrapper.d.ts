import { ISpider } from '../types/spider.interface';
import { JSEngine } from './js-engine';
interface SpiderWrapperConfig {
    timeout?: number;
    enableLog?: boolean;
}
export declare class SpiderWrapper implements ISpider {
    private engine;
    private key;
    private config;
    private isInitialized;
    constructor(engine: JSEngine, key: string, config?: SpiderWrapperConfig);
    init(ext?: string): Promise<void>;
    home(filter?: boolean): Promise<string>;
    homeVod(): Promise<string>;
    category(tid: string, pg: string, filter?: boolean, extend?: Record<string, string>): Promise<string>;
    detail(ids: string[]): Promise<string>;
    search(key: string, quick?: boolean, pg?: string): Promise<string>;
    play(flag: string, id: string, vipFlags?: string[]): Promise<string>;
    sniffer(): Promise<boolean>;
    isVideo(url: string): Promise<boolean>;
    destroy(): void;
    private ensureInitialized;
    private safeCall;
}
export {};
