// 播放相关类型定义

export interface VideoDetail {
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
  vod_play_from?: string; // 播放来源，如：线路1$$$线路2
  vod_play_url?: string;  // 播放地址，如：第1集$http://xxx.m3u8#第2集$http://yyy.m3u8
}

export interface PlaySource {
  name: string;           // 线路名称
  episodes: Episode[];    // 剧集列表
}

export interface Episode {
  name: string;           // 剧集名称，如：第1集
  url: string;            // 播放地址
  isM3U8?: boolean;       // 是否为M3U8
  isMP4?: boolean;        // 是否为MP4
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

export interface ParseResult {
  success: boolean;
  playInfo?: PlayInfo;
  error?: string;
}
