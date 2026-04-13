import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpiderExecutor } from './spider.executor';
import type { Spider, SpiderResult, SpiderConfig } from './interfaces/spider.interface';
import { QuickJSAdapter } from './adapters/quickjs.adapter';
import { PythonAdapter } from './adapters/python.adapter';
import { HttpAdapter } from './adapters/http.adapter';

/**
 * Spider 服务
 * 管理 Spider 的加载、缓存和执行
 */
@Injectable()
export class SpiderService implements OnModuleDestroy {
  private readonly logger = new Logger(SpiderService.name);
  private readonly executorCache: Map<string, SpiderExecutor> = new Map();
  private readonly defaultTimeout: number;
  private readonly defaultMemoryLimit: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTimeout = this.configService.get<number>('spider.timeout') || 10000;
    this.defaultMemoryLimit = this.configService.get<number>('spider.memoryLimit') || 128;
  }

  /**
   * 加载 Spider
   * @param sourceKey 数据源标识
   * @param config Spider 配置
   */
  async loadSpider(sourceKey: string, config: SpiderConfig): Promise<Spider> {
    try {
      // 检查缓存
      if (this.executorCache.has(sourceKey)) {
        this.logger.log(`Spider ${sourceKey} already loaded, returning cached instance`);
        const executor = this.executorCache.get(sourceKey)!;
        return executor.load();
      }

      // 创建执行器
      const executor = this.createExecutor(config);

      // 加载 Spider
      const spider = await executor.load();

      // 缓存执行器
      this.executorCache.set(sourceKey, executor);

      this.logger.log(`Spider ${sourceKey} loaded successfully`);
      return spider;
    } catch (error) {
      this.logger.error(`Failed to load Spider ${sourceKey}`, error);
      throw error;
    }
  }

  /**
   * 创建执行器
   */
  private createExecutor(config: SpiderConfig): SpiderExecutor {
    const fullConfig: SpiderConfig = {
      ...config,
      timeout: config.timeout || this.defaultTimeout,
      memoryLimit: config.memoryLimit || this.defaultMemoryLimit,
    };

    switch (config.type) {
      case 'js':
        return new QuickJSAdapter(fullConfig);
      case 'py':
        return new PythonAdapter(fullConfig);
      case 'http':
        return new HttpAdapter(fullConfig);
      case 'jar':
        throw new Error('JAR Spider is not supported yet');
      default:
        throw new Error(`Unknown Spider type: ${config.type}`);
    }
  }

  /**
   * 执行 Spider 方法
   * @param sourceKey 数据源标识
   * @param method 方法名
   * @param args 参数
   * @param timeout 超时时间
   */
  async execute(
    sourceKey: string,
    method: keyof Spider,
    args: any[],
    timeout?: number,
  ): Promise<SpiderResult> {
    try {
      const executor = this.executorCache.get(sourceKey);

      if (!executor) {
        throw new Error(`Spider ${sourceKey} not loaded`);
      }

      return await executor.execute(method, args, timeout);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to execute Spider ${sourceKey}.${method}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        duration: 0,
      };
    }
  }

  /**
   * 卸载 Spider
   * @param sourceKey 数据源标识
   */
  async unloadSpider(sourceKey: string): Promise<void> {
    try {
      const executor = this.executorCache.get(sourceKey);

      if (executor) {
        await executor.destroy();
        this.executorCache.delete(sourceKey);
        this.logger.log(`Spider ${sourceKey} unloaded`);
      }
    } catch (error) {
      this.logger.error(`Failed to unload Spider ${sourceKey}`, error);
    }
  }

  /**
   * 检查 Spider 是否已加载
   * @param sourceKey 数据源标识
   */
  isLoaded(sourceKey: string): boolean {
    return this.executorCache.has(sourceKey);
  }

  /**
   * 获取已加载的 Spider 列表
   */
  getLoadedSpiders(): string[] {
    return Array.from(this.executorCache.keys());
  }

  /**
   * 模块销毁时清理所有 Spider
   */
  async onModuleDestroy() {
    this.logger.log('Destroying all Spiders...');

    for (const [sourceKey, executor] of this.executorCache.entries()) {
      try {
        await executor.destroy();
        this.logger.log(`Spider ${sourceKey} destroyed`);
      } catch (error) {
        this.logger.error(`Failed to destroy Spider ${sourceKey}`, error);
      }
    }

    this.executorCache.clear();
    this.logger.log('All Spiders destroyed');
  }
}
