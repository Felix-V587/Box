import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VodRecord } from './vod-record.entity';
import { VodCollect } from './vod-collect.entity';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { SpiderModule } from '../spider/spider.module';

@Module({
  imports: [TypeOrmModule.forFeature([VodRecord, VodCollect]), SpiderModule],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
