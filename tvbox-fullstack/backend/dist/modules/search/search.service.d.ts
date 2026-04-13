import { ConfigService } from '../config/config.service';
import { ErrorCode } from '../../common/error.helper';
import { SpiderManager } from '@tvbox/spider-engine';
export interface VideoItem {
    vod_id: string;
    vod_name: string;
    vod_pic?: string;
    vod_remarks?: string;
    vod_year?: string;
    vod_type?: string;
    vod_area?: string;
}
export interface SearchResult {
    siteKey: string;
    siteName: string;
    videos: VideoItem[];
    error?: string;
    errorCode?: ErrorCode;
    errorDetails?: any;
}
export interface AggregatedResult {
    keyword: string;
    totalSites: number;
    successSites: number;
    failedSites: number;
    totalVideos: number;
    results: SearchResult[];
    duration: number;
}
export declare class SearchService {
    private readonly configService;
    private spiderManager;
    private logger;
    constructor(configService: ConfigService, spiderManager: SpiderManager);
    destroy(): void;
    search(keyword: string, quickSearch?: boolean, timeout?: number, concurrency?: number): Promise<AggregatedResult>;
    private searchSite;
    private executeSpider;
    getSpiderManager(): SpiderManager;
    private getSpiderType;
    private searchAppSx;
    private searchT4;
    private searchXPath;
    private searchZPan;
    private searchTVBox;
    private chunkArray;
}
