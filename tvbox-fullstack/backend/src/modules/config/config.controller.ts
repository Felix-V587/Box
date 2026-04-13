import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ConfigService, SourceBean, ConfigJson } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post('load')
  async loadConfig(@Body('url') url: string) {
    try {
      const config = await this.configService.loadConfig(url);
      return {
        success: true,
        data: config,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('current')
  getCurrentConfig() {
    const config = this.configService.getConfig();
    return {
      success: true,
      data: config,
    };
  }

  @Get('sites')
  getSites() {
    const config = this.configService.getConfig();
    return {
      success: true,
      data: config?.sites || [],
    };
  }

  @Get('searchable-sites')
  getSearchableSites() {
    const sites = this.configService.getSearchableSites();
    return {
      success: true,
      data: sites,
    };
  }
}
