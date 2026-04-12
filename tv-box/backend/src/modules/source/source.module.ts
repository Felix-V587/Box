import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './source.entity';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { SpiderModule } from '../spider/spider.module';

@Module({
  imports: [TypeOrmModule.forFeature([Source]), SpiderModule],
  controllers: [SourceController],
  providers: [SourceService],
  exports: [SourceService],
})
export class SourceModule {}
