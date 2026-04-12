import { Logger } from '@nestjs/common';
import { SpiderExecutor } from '../spider.executor';
import { Spider, SpiderResult, SpiderConfig } from '../interfaces/spider.interface';
import { QuickJSSandbox } from '../sandbox/quickjs.sandbox';

/**
 * QuickJS Spider 适配器
 * 用于执行 JavaScript Spider
 */
export class QuickJSAdapter extends SpiderExecutor {
  private sandbox: QuickJSSandbox;
  private spiderInstance: Spider | null = null;

  constructor(config: SpiderConfig) {
    super(config);
    this.sandbox = new QuickJSSandbox({
      memoryLimit: config.memoryLimit || 128,
      executionTimeout: config.timeout || 10000,
    });
  }

  /**
   * 加载 Spider
   */
  async load(): Promise<Spider> {
    try {
      if (!this.sandbox.isInitialized()) {
        await this.sandbox.init();
      }

      if (!this.config.content) {
        throw new Error('Spider content is required');
      }

      // 执行 Spider 代码
      await this.sandbox.execute(this.config.content);

      // 创建 Spider 实例代理
      this.spiderInstance = this.createSpiderProxy();

      this.logger.log('QuickJS Spider loaded successfully');
      return this.spiderInstance;
    } catch (error) {
      this.logger.error('Failed to load QuickJS Spider', error);
      throw error;
    }
  }

  /**
   * 创建 Spider 代理实例
   */
  private createSpiderProxy(): Spider {
    return {
      init: async (config: any) => {
        const result = await this.sandbox.callFunction('init', [config]);
        return result;
      },

      homeContent: async (quick: boolean) => {
        const result = await this.sandbox.callFunction('homeContent', [quick]);
        return result;
      },

      categoryContent: async (tid: string, pg: number, filter?: any, extend?: any) => {
        const result = await this.sandbox.callFunction('categoryContent', [
          tid,
          pg,
          filter,
          extend,
        ]);
        return result;
      },

      searchContent: async (key: string, quick: boolean) => {
        const result = await this.sandbox.callFunction('searchContent', [key, quick]);
        return result;
      },

      detailContent: async (ids: string[]) => {
        const result = await this.sandbox.callFunction('detailContent', [ids]);
        return result;
      },

      playerContent: async (flag: string, id: string) => {
        const result = await this.sandbox.callFunction('playerContent', [flag, id]);
        return result;
      },

      isVideoFormat: (url: string) => {
        // 同步方法，需要特殊处理
        return false;
      },

      manualVideoCheck: () => {
        // 同步方法，需要特殊处理
        return false;
      },
    };
  }

  /**
   * 执行 Spider 方法
   */
  async execute(
    method: keyof Spider,
    args: any[],
    timeout?: number,
  ): Promise<SpiderResult> {
    if (!this.spiderInstance) {
      await this.load();
    }

    return this.executeMethod(
      this.spiderInstance!,
      method,
      args,
      timeout || this.config.timeout || 10000,
    );
  }

  /**
   * 销毁 Spider
   */
  async destroy(): Promise<void> {
    try {
      await this.sandbox.destroy();
      this.spiderInstance = null;
      this.logger.log('QuickJS Spider destroyed');
    } catch (error) {
      this.logger.error('Failed to destroy QuickJS Spider', error);
    }
  }
}
