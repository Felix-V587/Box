import { ConfigService, SourceBean, ConfigJson } from './config.service';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    loadConfig(url: string): Promise<{
        success: boolean;
        data: ConfigJson;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getCurrentConfig(): {
        success: boolean;
        data: ConfigJson;
    };
    getSites(): {
        success: boolean;
        data: SourceBean[];
    };
    getSearchableSites(): {
        success: boolean;
        data: SourceBean[];
    };
}
