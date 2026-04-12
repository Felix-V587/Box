import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { getDatabaseConfig } from './config/database.config';
import appConfig from './config/app.config';
import spiderConfig from './config/spider.config';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// 业务模块
import { SpiderModule } from './modules/spider/spider.module';
import { SourceModule } from './modules/source/source.module';
import { SearchModule } from './modules/search/search.module';
import { DetailModule } from './modules/detail/detail.module';
import { PlayerModule } from './modules/player/player.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, spiderConfig],
      envFilePath: ['.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // 业务模块
    SpiderModule,
    SourceModule,
    SearchModule,
    DetailModule,
    PlayerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局响应拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 全局日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
