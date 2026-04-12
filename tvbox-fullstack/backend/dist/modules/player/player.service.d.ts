import { SpiderManager } from '@tvbox/spider-engine';
import { ConfigService } from '../config/config.service';
export interface PlaySource {
    name: string;
    episodes: Episode[];
}
export interface Episode {
    name: string;
    url: string;
    isM3U8?: boolean;
    isMP4?: boolean;
}
export interface PlayInfo {
    siteKey: string;
    siteName: string;
    videoId: string;
    videoName: string;
    sources: PlaySource[];
    currentSource?: PlaySource;
    currentEpisode?: Episode;
}
export declare class PlayerService {
    private spiderManager;
    private configService;
    private logger;
    constructor(spiderManager: SpiderManager, configService: ConfigService);
    destroy(): void;
    getPlayInfo(siteKey: string, siteName: string, videoId: string, videoName: string): Promise<PlayInfo>;
    private getPlayInfoFromTVBox;
    private getPlayInfoFromSpider;
    private getMockPlayInfo;
    name: '线路3-备用';
    episodes: Array.from;
}
