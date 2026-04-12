import { Controller, Post, Body } from '@nestjs/common';
import { PlayerService, PlayInfo } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post('info')
  async getPlayInfo(
    @Body('siteKey') siteKey: string,
    @Body('siteName') siteName: string,
    @Body('videoId') videoId: string,
    @Body('videoName') videoName: string
  ) {
    try {
      const playInfo = await this.playerService.getPlayInfo(
        siteKey,
        siteName,
        videoId,
        videoName
      );

      return {
        success: true,
        data: playInfo,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('m3u8')
  async getM3U8Urls(@Body() playInfo: PlayInfo) {
    try {
      const m3u8Urls = this.playerService.extractM3U8Urls(playInfo);

      return {
        success: true,
        data: m3u8Urls,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
