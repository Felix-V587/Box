import { PlayerService, PlayInfo } from './player.service';
export declare class PlayerController {
    private readonly playerService;
    constructor(playerService: PlayerService);
    getPlayInfo(siteKey: string, siteName: string, videoId: string, videoName: string): Promise<{
        success: boolean;
        data: PlayInfo;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getM3U8Urls(playInfo: PlayInfo): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
