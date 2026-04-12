export interface SpiderResult {
    list: any[];
}
export declare class SpiderEngine {
    search(site: any, keyword: string): Promise<SpiderResult>;
    detail(site: any, videoId: string): Promise<any>;
    private searchAppSx;
    private searchT4;
    private searchXPath;
    private searchHttp;
    private detailAppSx;
    private detailT4;
}
