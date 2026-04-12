// 搜索结果类型定义

export interface SearchResult {
  siteKey: string;
  siteName: string;
  videos: VideoItem[];
  error?: string;
  duration?: number;
}

export interface VideoItem {
  vod_id: string;
  vod_name: string;
  vod_pic?: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_type?: string;
  vod_area?: string;
  vod_director?: string;
  vod_actor?: string;
  vod_content?: string;
  vod_play_from?: string;
  vod_play_url?: string;
}

export interface SearchOptions {
  keyword: string;
  sites?: string[]; // 指定搜索的站点key列表，不指定则搜索所有
  quickSearch?: boolean; // 是否使用快速搜索
  timeout?: number; // 超时时间（毫秒）
  concurrency?: number; // 并发数
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
