export interface SourceBean {
    key: string;
    name: string;
    api: string;
    type?: number;
    searchable?: number;
    quickSearch?: number;
    ext?: any;
    jar?: string;
}
export interface ConfigJson {
    spider?: string;
    sites?: SourceBean[];
    parses?: any[];
    lives?: any[];
    flags?: string[];
    logo?: string;
}
export declare class ConfigService {
    private config;
    loadConfig(apiUrl: string): Promise<ConfigJson>;
    getConfig(): ConfigJson | null;
    getSearchableSites(): SourceBean[];
    private findResult;
    private removeJsonComments;
    private isJson;
}
