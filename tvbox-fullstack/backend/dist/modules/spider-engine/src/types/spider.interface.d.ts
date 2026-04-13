export interface ISpider {
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
}
export interface SpiderConfig {
    key: string;
    api: string;
    ext?: string;
    jar?: string;
    cacheTime?: number;
}
export interface SpiderResult<T = string> {
    success: boolean;
    data?: T;
    error?: string;
    duration?: number;
}
export interface SpiderWrapperConfig {
    timeout?: number;
    enableCache?: boolean;
    cacheTime?: number;
    enableLog?: boolean;
}
