import { Logger } from '@nestjs/common';
import { Spider, SpiderResult, SpiderConfig } from './interfaces/spider.interface';

/**
 * Spider 执行器抽象基类
 */
export abstract class SpiderExecutor {
  protected readonly logger: Logger;
  protected readonly config: SpiderConfig;

  constructor(config: SpiderConfig) {
    this.config = config;
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * 执行 Spider 方法
   * @param spider Spider 实例
   * @param method 方法名
   * @param args 参数
   * @param timeout 超时时间
   */
  protected async executeMethod(
    spider: Spider,
    method: keyof Spider,
    args: any[],
    timeout: number = 10000,
  ): Promise<SpiderResult> {
    const startTime = Date.now();

    try {
      // 创建超时 Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Spider method ${method} timeout after ${timeout}ms`));
        }, timeout);
      });

      // 执行方法
      const methodFn = spider[method];
      if (typeof methodFn !== 'function') {
        throw new Error(`Spider method ${method} is not a function`);
      }

      const result = await Promise.race([
        (methodFn as Function).apply(spider, args),
        timeoutPromise,
      ]);

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Spider method ${method} failed: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  /**
   * 加载 Spider
   */
  abstract load(): Promise<Spider>;

  /**
   * 销毁 Spider
   */
  abstract destroy(): Promise<void>;

  /**
   * 执行 Spider 方法
   */
  abstract execute(
    method: keyof Spider,
    args: any[],
    timeout?: number,
  ): Promise<SpiderResult>;
}
