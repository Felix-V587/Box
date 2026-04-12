import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 获取配置服务
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('app.apiPrefix') || '/api/v1';
  const port = configService.get<number>('app.port') || 3000;

  // 设置全局前缀
  app.setGlobalPrefix(apiPrefix);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 启用 CORS
  app.enableCors();

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('TVBox Backend API')
    .setDescription('TVBox Backend API 文档 - 数据源配置、搜索、播放等功能')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 启动应用
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}${apiPrefix}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
