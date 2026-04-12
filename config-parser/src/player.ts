import axios from 'axios';
import { VideoDetail, PlaySource, Episode, PlayInfo, ParseResult } from './player-types';

/**
 * 播放地址解析器
 * 获取视频详情并解析播放地址
 */
export class PlayerParser {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:9978') {
    this.baseUrl = baseUrl;
  }

  /**
   * 获取视频详情
   */
  async getVideoDetail(siteKey: string, videoId: string): Promise<VideoDetail | null> {
    try {
      console.log(`获取视频详情: ${videoId}`);

      const detailUrl = `${this.baseUrl}/api?do=detail&id=${siteKey}&ids=${videoId}`;

      const response = await axios.get(detailUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.list && response.data.list.length > 0) {
        return response.data.list[0];
      }

      return null;
    } catch (error: any) {
      console.error(`获取详情失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 解析播放地址
   */
  parsePlayUrl(vodPlayFrom: string, vodPlayUrl: string): PlaySource[] {
    if (!vodPlayFrom || !vodPlayUrl) {
      return [];
    }

    const sources: PlaySource[] = [];

    // 分割播放来源（多个线路用$$$分隔）
    const playFroms = vodPlayFrom.split('$$$');
    const playUrls = vodPlayUrl.split('$$$');

    for (let i = 0; i < playFroms.length; i++) {
      const sourceName = playFroms[i] || `线路${i + 1}`;
      const urlStr = playUrls[i] || '';

      // 解析剧集列表（用#分隔）
      const episodes = this.parseEpisodes(urlStr);

      sources.push({
        name: sourceName,
        episodes
      });
    }

    return sources;
  }

  /**
   * 解析剧集列表
   */
  private parseEpisodes(urlStr: string): Episode[] {
    const episodes: Episode[] = [];

    // 用#分隔不同剧集
    const items = urlStr.split('#');

    for (const item of items) {
      if (!item) continue;

      // 用$分隔剧集名称和地址
      const parts = item.split('$');

      if (parts.length >= 2) {
        const name = parts[0];
        const url = parts[1];

        episodes.push({
          name,
          url,
          isM3U8: url.includes('.m3u8'),
          isMP4: url.includes('.mp4')
        });
      } else if (parts.length === 1 && parts[0].includes('http')) {
        // 没有剧集名称，只有URL
        episodes.push({
          name: `第${episodes.length + 1}集`,
          url: parts[0],
          isM3U8: parts[0].includes('.m3u8'),
          isMP4: parts[0].includes('.mp4')
        });
      }
    }

    return episodes;
  }

  /**
   * 获取播放信息
   */
  async getPlayInfo(siteKey: string, siteName: string, videoId: string, videoName: string): Promise<ParseResult> {
    try {
      console.log(`\n开始获取播放信息...`);
      console.log(`站点: ${siteName}`);
      console.log(`视频ID: ${videoId}`);
      console.log(`视频名称: ${videoName}\n`);

      // 获取详情
      const detail = await this.getVideoDetail(siteKey, videoId);

      if (!detail) {
        return {
          success: false,
          error: '获取视频详情失败'
        };
      }

      // 解析播放地址
      const sources = this.parsePlayUrl(detail.vod_play_from || '', detail.vod_play_url || '');

      if (sources.length === 0) {
        return {
          success: false,
          error: '未找到播放地址'
        };
      }

      const playInfo: PlayInfo = {
        siteKey,
        siteName,
        videoId,
        videoName: detail.vod_name || videoName,
        sources,
        currentSource: sources[0],
        currentEpisode: sources[0].episodes[0]
      };

      return {
        success: true,
        playInfo
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 提取M3U8地址
   */
  extractM3U8Urls(playInfo: PlayInfo): Episode[] {
    const m3u8Episodes: Episode[] = [];

    for (const source of playInfo.sources) {
      for (const episode of source.episodes) {
        if (episode.isM3U8) {
          m3u8Episodes.push(episode);
        }
      }
    }

    return m3u8Episodes;
  }

  /**
   * 提取所有播放地址
   */
  extractAllUrls(playInfo: PlayInfo): Episode[] {
    const allEpisodes: Episode[] = [];

    for (const source of playInfo.sources) {
      allEpisodes.push(...source.episodes);
    }

    return allEpisodes;
  }
}
