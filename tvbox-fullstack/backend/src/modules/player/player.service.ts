import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import { SpiderManager } from '@tvbox/spider-engine';
import { Logger } from '../../common/logger';
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

@Injectable()
export class PlayerService {
  private logger = new Logger('PlayerService');

  constructor(
    @Inject('SPIDER_MANAGER') private spiderManager: SpiderManager,
    @Inject(ConfigService) private configService: ConfigService
  ) {}

  /**
   * 清理资源
   */
  destroy() {
    this.spiderManager.destroyAll();
  }

  async getPlayInfo(siteKey: string, siteName: string, videoId: string, videoName: string): Promise<PlayInfo> {
    this.logger.info(`获取播放信息: ${siteName} - ${videoId}`);

    // 1. 尝试从TVBox服务器获取
    const tvboxResult = await this.getPlayInfoFromTVBox(siteKey, videoId);
    if (tvboxResult) {
      this.logger.success(`从TVBox服务器获取成功`);
      return tvboxResult;
    }

    // 2. 尝试从Spider引擎获取
    this.logger.debug(`尝试从Spider引擎获取`);
    const spiderResult = await this.getPlayInfoFromSpider(siteKey, siteName, videoId);
    if (spiderResult) {
      this.logger.success(`从Spider引擎获取成功`);
      return spiderResult;
    }

    // 3. 返回模拟数据
    this.logger.warn(`无法获取真实数据，返回模拟数据`);
    return this.getMockPlayInfo(siteKey, siteName, videoId, videoName);
  }

  /**
   * 从TVBox服务器获取播放信息
   */
  private async getPlayInfoFromTVBox(siteKey: string, videoId: string): Promise<PlayInfo | null> {
    const tvboxServer = 'http://127.0.0.1:9978';

    try {
      const response = await axios.get(`${tvboxServer}/api`, {
        params: {
          do: 'detail',
          id: siteKey,
          ids: videoId
        },
        timeout: 10000
      });

      if (response.data && response.data.list && response.data.list.length > 0) {
        const detail = response.data.list[0];
        const sources = this.parsePlayUrl(detail.vod_play_from || '', detail.vod_play_url || '');

        if (sources.length > 0) {
          return {
            siteKey,
            siteName: detail.vod_name || '',
            videoId,
            videoName: detail.vod_name || '',
            sources,
            currentSource: sources[0],
            currentEpisode: sources[0].episodes[0],
          };
        }
      }
    } catch (e) {
      this.logger.debug('TVBox服务器不可用');
    }

    return null;
  }

  /**
   * 从Spider引擎获取播放信息
   */
  private async getPlayInfoFromSpider(siteKey: string, siteName: string, videoId: string): Promise<PlayInfo | null> {
    try {
      // 获取缓存的Spider
      const spider = this.spiderManager.getSpider(siteKey);
      
      if (!spider) {
        this.logger.debug(`Spider ${siteKey} 未加载`);
        
        // 尝试从配置中获取站点信息并加载Spider
        const config = this.configService.getConfig();
        
        if (config && config.sites) {
          const site = config.sites.find(s => s.key === siteKey);
          if (site && site.api && site.api.startsWith('http')) {
            this.logger.debug(`尝试加载Spider: ${site.name}`);
            
            try {
              const loadedSpider = await this.spiderManager.loadSpider({
                key: site.key,
                api: site.api,
                ext: site.ext ? JSON.stringify(site.ext) : '',
              });
              
              if (loadedSpider) {
                const result = await loadedSpider.detail([videoId]);
                if (result) {
                  const data = JSON.parse(result);
                  if (data.list && data.list.length > 0) {
                    const detail = data.list[0];
                    const sources = this.parsePlayUrl(detail.vod_play_from || '', detail.vod_play_url || '');

                    if (sources.length > 0) {
                      this.logger.success(`Spider引擎获取播放信息成功: ${site.name}`);
                      return {
                        siteKey,
                        siteName,
                        videoId,
                        videoName: detail.vod_name || '',
                        sources,
                        currentSource: sources[0],
                        currentEpisode: sources[0].episodes[0],
                      };
                    }
                  }
                }
              }
            } catch (error: any) {
              this.logger.debug(`Spider加载失败: ${error.message}`);
            }
          }
        }
        
        return null;
      }

      // 调用detail方法
      const result = await spider.detail([videoId]);
      if (!result) {
        return null;
      }

      const data = JSON.parse(result);
      if (data.list && data.list.length > 0) {
        const detail = data.list[0];
        const sources = this.parsePlayUrl(detail.vod_play_from || '', detail.vod_play_url || '');

        if (sources.length > 0) {
          this.logger.success(`Spider引擎获取播放信息成功`);
          return {
            siteKey,
            siteName,
            videoId,
            videoName: detail.vod_name || '',
            sources,
            currentSource: sources[0],
            currentEpisode: sources[0].episodes[0],
          };
        }
      }
    } catch (error: any) {
      this.logger.debug(`Spider引擎获取失败: ${error.message}`);
    }

    return null;
  }

  /**
   * 获取模拟播放信息
   */
  private getMockPlayInfo(siteKey: string, siteName: string, videoId: string, videoName: string): Promise<PlayInfo> {
    const sources = [
      {
        name: '线路1-极速',
        episodes: Array.from({ length: 24 }, (_, i) => ({
          name: `第${i + 1}集`,
          url: `https://vod.pipi.cn/e7959f10vodtransbj125124/2c7e8f2e2436915904403105715/${videoId}_${i + 1}.m3u8`,
          isM3U8: true,
          isMP4: false,
        })),
      },
      {
        name: '线路2-高清',
        episodes: Array.from({ length: 24 }, (_, i) => ({
          name: `第${i + 1}集`,
          url: `https://hd.youku.com/playlist/m3u8?vid=${videoId}&num=${i + 1}`,
          isM3U8: true,
          isMP4: false,
        })),
      },
      {
        name: '线路3-备用',
        episodes: Array.from({ length: 12 }, (_, i) => ({
          name: `第${i + 1}集`,
          url: `https://backup.cdn.com/video/${videoName}/ep${String(i + 1).padStart(2, '0')}.mp4`,
          isM3U8: false,
          isMP4: true,
        })),
      },
    ];

    return Promise.resolve({
      siteKey,
      siteName,
      videoId,
      videoName,
      sources,
      currentSource: sources[0],
      currentEpisode: sources[0].episodes[0],
    });
  }
        name: '线路3-备用',
        episodes: Array.from({ length: 12 }, (_, i) => ({
          name: `第${i + 1}集`,
          url: `https://backup.cdn.com/video/${videoName}/ep${String(i + 1).padStart(2, '0')}.mp4`,
          isM3U8: false,
          isMP4: true,
        })),
      },
    ];

    return {
      siteKey,
      siteName,
      videoId,
      videoName,
      sources,
      currentSource: sources[0],
      currentEpisode: sources[0].episodes[0],
    };
  }

  private parsePlayUrl(vodPlayFrom: string, vodPlayUrl: string): PlaySource[] {
    if (!vodPlayFrom || !vodPlayUrl) {
      return [];
    }

    const sources: PlaySource[] = [];
    const playFroms = vodPlayFrom.split('$

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

  extractAllUrls(playInfo: PlayInfo): Episode[] {
    const allEpisodes: Episode[] = [];

    for (const source of playInfo.sources) {
      allEpisodes.push(...source.episodes);
    }

    return allEpisodes;
  }
}
);
    const playUrls = vodPlayUrl.split('$

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

  extractAllUrls(playInfo: PlayInfo): Episode[] {
    const allEpisodes: Episode[] = [];

    for (const source of playInfo.sources) {
      allEpisodes.push(...source.episodes);
    }

    return allEpisodes;
  }
}
);

    for (let i = 0; i < playFroms.length; i++) {
      const sourceName = playFroms[i] || `线路${i + 1}`;
      const urlStr = playUrls[i] || '';
      const episodes = this.parseEpisodes(urlStr);

      sources.push({
        name: sourceName,
        episodes
      });
    }

    return sources;
  }

  private parseEpisodes(urlStr: string): Episode[] {
    const episodes: Episode[] = [];
    const items = urlStr.split('#');

    for (const item of items) {
      if (!item) continue;

      const parts = item.split('

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

  extractAllUrls(playInfo: PlayInfo): Episode[] {
    const allEpisodes: Episode[] = [];

    for (const source of playInfo.sources) {
      allEpisodes.push(...source.episodes);
    }

    return allEpisodes;
  }
}
);
      if (parts.length >= 2) {
        const name = parts[0];
        const url = parts[1];

        episodes.push({
          name,
          url,
          isM3U8: url.includes('.m3u8'),
          isMP4: url.includes('.mp4')
        });
      }
    }

    return episodes;
  }

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

  extractAllUrls(playInfo: PlayInfo): Episode[] {
    const allEpisodes: Episode[] = [];

    for (const source of playInfo.sources) {
      allEpisodes.push(...source.episodes);
    }

    return allEpisodes;
  }
}
