import { Module, Global, Inject } from '@nestjs/common';
import { SpiderManager } from '@tvbox/spider-engine';

/**
 * 全局Spider管理器模块
 * 提供共享的Spider管理器实例
 */
@Global()
@Module({
  providers: [
    {
      provide: 'SPIDER_MANAGER',
      useFactory: () => {
        console.log('初始化全局Spider管理器');
        return new SpiderManager({
          maxCacheSize: 20,
          cacheTime: 3600000, // 1小时
          timeout: 30000,
          enableLog: true,
        });
      },
    },
  ],
  exports: ['SPIDER_MANAGER'],
})
export class SpiderManagerModule {}
