import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpiderService } from '../spider/spider.service';
import type { DetailRequestDto, VodInfoDto, SeriesDto, EpisodeDto } from './dto/detail.dto';

/**
 * 详情服务
 */
@Injectable()
export class DetailService {
  private readonly logger = new Logger(DetailService.name);
  private readonly cache: Map<string, { data: VodInfoDto; expireTime: number }> = new Map();
  private readonly cacheTTL: number = 3600000; // 1 小时

  constructor(
    private readonly spiderService: SpiderService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取视频详情
   */
  async getDetail(dto: DetailRequestDto): Promise<VodInfoDto> {
    const { sourceKey, vodId } = dto;
    const cacheKey = `detail:${sourceKey}:${vodId}`;

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expireTime > Date.now()) {
      this.logger.log(`Returning cached detail for ${cacheKey}`);
      return cached.data;
    }

    // 执行 Spider 获取详情
    const timeout = this.configService.get<number>('spider.timeout') || 10000;
    const result = await this.spiderService.execute(sourceKey, 'detailContent', [[vodId]], timeout);

    if (!result.success || !result.data) {
      throw new Error(`Failed to get detail: ${result.error || 'Unknown error'}`);
    }

    // 解析结果
    const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    const list = data.list || [];

    if (list.length === 0) {
      throw new Error('Video not found');
    }

    const item = list[0];

    // 转换为统一格式
    const vodInfo: VodInfoDto = {
      vodId: item.vod_id || item.vodId,
      vodName: item.vod_name || item.vodName,
      vodPic: item.vod_pic || item.vodPic,
      vodRemarks: item.vod_remarks || item.vodRemarks,
      vodContent: item.vod_content || item.vodContent,
      vodDirector: item.vod_director || item.vodDirector,
      vodActor: item.vod_actor || item.vodActor,
      vodArea: item.vod_area || item.vodArea,
      vodYear: item.vod_year || item.vodYear,
      vodPlayFrom: item.vod_play_from || item.vodPlayFrom,
      vodPlayUrl: item.vod_play_url || item.vodPlayUrl,
      series: this.parseSeries(item.vod_play_from || item.vodPlayFrom, item.vod_play_url || item.vodPlayUrl),
    };

    // 保存到缓存
    this.cache.set(cacheKey, {
      data: vodInfo,
      expireTime: Date.now() + this.cacheTTL,
    });

    return vodInfo;
  }

  /**
   * 解析剧集列表
   */
  private parseSeries(vodPlayFrom?: string, vodPlayUrl?: string): SeriesDto[] {
    if (!vodPlayFrom || !vodPlayUrl) {
      return [];
    }

    const series: SeriesDto[] = [];

    // 分割线路
    const playFroms = vodPlayFrom.split('$$$');
    const playUrls = vodPlayUrl.split('$$$');

    for (let i = 0; i < playFroms.length && i < playUrls.length; i++) {
      const name = playFroms[i] || `线路${i + 1}`;
      const urlStr = playUrls[i];

      // 解析剧集
      const episodes: EpisodeDto[] = [];
      const episodeList = urlStr.split('#');

      for (const episode of episodeList) {
        const parts = episode.split('$');
        if (parts.length >= 2) {
          episodes.push({
            name: parts[0],
            url: parts[1],
          });
        }
      }

      series.push({ name, episodes });
    }

    return series;
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expireTime <= now) {
        this.cache.delete(key);
      }
    }
  }
}
