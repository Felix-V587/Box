import { Module } from '@nestjs/common';
import { DetailService } from './detail.service';
import { DetailController } from './detail.controller';
import { SpiderModule } from '../spider/spider.module';

@Module({
  imports: [SpiderModule],
  controllers: [DetailController],
  providers: [DetailService],
  exports: [DetailService],
})
export class DetailModule {}
