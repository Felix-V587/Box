import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { SearchModule } from './modules/search/search.module';
import { PlayerModule } from './modules/player/player.module';
import { SpiderManagerModule } from './modules/spider-manager/spider-manager.module';

@Module({
  imports: [ConfigModule, SearchModule, PlayerModule, SpiderManagerModule],
})
export class AppModule {}
