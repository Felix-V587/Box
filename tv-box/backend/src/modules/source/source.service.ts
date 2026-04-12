import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Source } from './source.entity';
import { SpiderService } from '../spider/spider.service';
import { SpiderConfig } from '../spider/interfaces/spider.interface';
import {
  CreateSourceDto,
  UpdateSourceDto,
  QuerySourceDto,
} from './dto/source.dto';
import { ConfigParseException } from '../../common/exceptions/business.exception';

/**
 * 数据源服务
 */
@Injectable()
export class SourceService {
  private readonly logger = new Logger(SourceService.name);

  constructor(
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
    private readonly spiderService: SpiderService,
  ) {}

  /**
   * 创建数据源
   */
  async create(dto: CreateSourceDto): Promise<Source> {
    const source = this.sourceRepository.create(dto);
    const saved = await this.sourceRepository.save(source);

    // 如果是 Spider 类型且已启用，尝试加载
    if (saved.sourceType === 3 && saved.status === 1 && saved.spiderContent) {
      await this.loadSpider(saved);
    }

    return saved;
  }

  /**
   * 批量创建数据源
   */
  async createBatch(dtos: CreateSourceDto[]): Promise<Source[]> {
    const sources = this.sourceRepository.create(dtos);
    return this.sourceRepository.save(sources);
  }

  /**
   * 更新数据源
   */
  async update(id: number, dto: UpdateSourceDto): Promise<Source> {
    const source = await this.findOne(id);

    Object.assign(source, dto);
    const saved = await this.sourceRepository.save(source);

    // 如果是 Spider 类型，重新加载
    if (saved.sourceType === 3 && saved.status === 1 && saved.spiderContent) {
      await this.loadSpider(saved);
    }

    return saved;
  }

  /**
   * 更新数据源状态
   */
  async updateStatus(id: number, status: number): Promise<Source> {
    const source = await this.findOne(id);
    source.status = status;
    return this.sourceRepository.save(source);
  }

  /**
   * 删除数据源
   */
  async delete(id: number): Promise<void> {
    const source = await this.findOne(id);

    // 卸载 Spider
    if (source.sourceType === 3) {
      await this.spiderService.unloadSpider(source.sourceKey);
    }

    await this.sourceRepository.delete(id);
  }

  /**
   * 查询单个数据源
   */
  async findOne(id: number): Promise<Source> {
    const source = await this.sourceRepository.findOne({ where: { id } });
    if (!source) {
      throw new Error(`Source with id ${id} not found`);
    }
    return source;
  }

  /**
   * 根据 sourceKey 查询数据源
   */
  async findByKey(sourceKey: string): Promise<Source | null> {
    return this.sourceRepository.findOne({ where: { sourceKey } });
  }

  /**
   * 查询数据源列表
   */
  async findAll(query: QuerySourceDto): Promise<{ list: Source[]; total: number }> {
    const { page = 1, pageSize = 20, status, keyword } = query;

    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }
    if (keyword) {
      where.sourceName = Like(`%${keyword}%`);
    }

    const [list, total] = await this.sourceRepository.findAndCount({
      where,
      order: { sort: 'ASC', createTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  /**
   * 获取所有启用的数据源
   */
  async findAllEnabled(): Promise<Source[]> {
    return this.sourceRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC' },
    });
  }

  /**
   * 解析配置文件
   */
  async parseConfig(configJson: string): Promise<{
    sources: CreateSourceDto[];
    loadedCount: number;
    failedCount: number;
  }> {
    try {
      const config = JSON.parse(configJson);
      const sources: CreateSourceDto[] = [];

      // 解析数据源列表
      if (config.video && Array.isArray(config.video)) {
        for (const item of config.video) {
          sources.push({
            sourceKey: item.key || item.name,
            sourceName: item.name,
            sourceType: item.type || 0,
            sourceUrl: item.url,
            spiderType: item.type === 3 ? this.getSpiderType(item) : undefined,
            spiderContent: item.type === 3 ? item.ext || item.jar || item.js : undefined,
            status: 1,
          });
        }
      }

      // 保存到数据库
      const saved = await this.createBatch(sources);

      // 加载 Spider
      let loadedCount = 0;
      let failedCount = 0;

      for (const source of saved) {
        if (source.sourceType === 3 && source.spiderContent) {
          try {
            await this.loadSpider(source);
            loadedCount++;
          } catch (error) {
            this.logger.error(`Failed to load Spider ${source.sourceKey}`, error);
            failedCount++;
          }
        }
      }

      return { sources, loadedCount, failedCount };
    } catch (error) {
      throw new ConfigParseException('Failed to parse config: ' + error.message);
    }
  }

  /**
   * 获取 Spider 类型
   */
  private getSpiderType(item: any): 'js' | 'py' | 'jar' {
    if (item.jar) return 'jar';
    if (item.js) return 'js';
    if (item.py) return 'py';
    return 'js';
  }

  /**
   * 加载 Spider
   */
  private async loadSpider(source: Source): Promise<void> {
    const config: SpiderConfig = {
      type: source.spiderType as any,
      content: source.spiderContent,
    };

    await this.spiderService.loadSpider(source.sourceKey, config);
    this.logger.log(`Spider ${source.sourceKey} loaded`);
  }

  /**
   * 测试数据源连接
   */
  async testConnection(id: number): Promise<{ success: boolean; message: string }> {
    const source = await this.findOne(id);

    try {
      if (source.sourceType === 3) {
        // 测试 Spider
        const result = await this.spiderService.execute(
          source.sourceKey,
          'homeContent',
          [true],
        );

        return {
          success: result.success,
          message: result.success ? 'Connection successful' : result.error || 'Unknown error',
        };
      } else {
        // 测试 HTTP API
        // TODO: 实现 HTTP 连接测试
        return { success: true, message: 'HTTP API test not implemented' };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
