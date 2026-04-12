import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from './search-history.entity';
import { Source } from '../source/source.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SpiderModule } from '../spider/spider.module';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory, Source]), SpiderModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
