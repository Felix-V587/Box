import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { VodRecord } from './vod-record.entity';
import { VodCollect } from './vod-collect.entity';
import { SpiderService } from '../spider/spider.service';
import {
  PlayRequestDto,
  PlayResultDto,
  SaveRecordDto,
  AddCollectDto,
  QueryRecordDto,
} from './dto/player.dto';

/**
 * 播放服务
 */
@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(
    @InjectRepository(VodRecord)
    private readonly recordRepository: Repository<VodRecord>,
    @InjectRepository(VodCollect)
    private readonly collectRepository: Repository<VodCollect>,
    private readonly spiderService: SpiderService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 解析播放地址
   */
  async parsePlayUrl(dto: PlayRequestDto): Promise<PlayResultDto> {
    const { sourceKey, vodId, flag, url } = dto;

    // 执行 Spider 获取播放地址
    const timeout = this.configService.get<number>('spider.timeout') || 10000;
    const result = await this.spiderService.execute(
      sourceKey,
      'playerContent',
      [flag, url],
      timeout,
    );

    if (!result.success || !result.data) {
      throw new Error(`Failed to parse play URL: ${result.error || 'Unknown error'}`);
    }

    // 解析结果
    const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;

    return {
      url: data.url || '',
      header: data.header || {},
      parse: data.parse || 0,
      jxFrom: data.jxFrom || '',
    };
  }

  /**
   * 保存播放记录
   */
  async saveRecord(dto: SaveRecordDto): Promise<VodRecord> {
    const { sourceKey, vodId } = dto;

    // 查找现有记录
    let record = await this.recordRepository.findOne({
      where: { sourceKey, vodId },
    });

    if (record) {
      // 更新现有记录
      Object.assign(record, dto);
      record.updateTime = new Date();
    } else {
      // 创建新记录
      record = this.recordRepository.create(dto);
    }

    return this.recordRepository.save(record);
  }

  /**
   * 获取播放记录列表
   */
  async getRecords(dto: QueryRecordDto): Promise<{ list: VodRecord[]; total: number }> {
    const { page = 1, pageSize = 20 } = dto;

    const [list, total] = await this.recordRepository.findAndCount({
      order: { updateTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  /**
   * 获取单个播放记录
   */
  async getRecord(sourceKey: string, vodId: string): Promise<VodRecord | null> {
    return this.recordRepository.findOne({
      where: { sourceKey, vodId },
    });
  }

  /**
   * 删除播放记录
   */
  async deleteRecord(id: number): Promise<void> {
    await this.recordRepository.delete(id);
  }

  /**
   * 添加收藏
   */
  async addCollect(dto: AddCollectDto): Promise<VodCollect> {
    const { sourceKey, vodId } = dto;

    // 检查是否已收藏
    const existing = await this.collectRepository.findOne({
      where: { sourceKey, vodId },
    });

    if (existing) {
      return existing;
    }

    // 创建新收藏
    const collect = this.collectRepository.create(dto);
    return this.collectRepository.save(collect);
  }

  /**
   * 取消收藏
   */
  async removeCollect(id: number): Promise<void> {
    await this.collectRepository.delete(id);
  }

  /**
   * 获取收藏列表
   */
  async getCollects(dto: QueryRecordDto): Promise<{ list: VodCollect[]; total: number }> {
    const { page = 1, pageSize = 20 } = dto;

    const [list, total] = await this.collectRepository.findAndCount({
      order: { collectTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  /**
   * 检查是否已收藏
   */
  async isCollected(sourceKey: string, vodId: string): Promise<boolean> {
    const count = await this.collectRepository.count({
      where: { sourceKey, vodId },
    });
    return count > 0;
  }
}
