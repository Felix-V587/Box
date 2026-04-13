import { SearchService, AggregatedResult } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(keyword: string, quickSearch?: boolean, timeout?: number, concurrency?: number): Promise<{
        success: boolean;
        data: AggregatedResult;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
