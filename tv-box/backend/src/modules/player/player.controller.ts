import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import {
  PlayRequestDto,
  SaveRecordDto,
  AddCollectDto,
  QueryRecordDto,
} from './dto/player.dto';

@ApiTags('播放')
@ApiBearerAuth()
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post('parse')
  @ApiOperation({ summary: '解析播放地址' })
  async parsePlayUrl(@Body() dto: PlayRequestDto) {
    return this.playerService.parsePlayUrl(dto);
  }

  @Get('record')
  @ApiOperation({ summary: '获取播放记录列表' })
  async getRecords(@Query() dto: QueryRecordDto) {
    const { list, total } = await this.playerService.getRecords(dto);
    return {
      list,
      total,
      page: dto.page || 1,
      pageSize: dto.pageSize || 20,
    };
  }

  @Post('record')
  @ApiOperation({ summary: '保存播放记录' })
  async saveRecord(@Body() dto: SaveRecordDto) {
    return this.playerService.saveRecord(dto);
  }

  @Delete('record/:id')
  @ApiOperation({ summary: '删除播放记录' })
  async deleteRecord(@Param('id', ParseIntPipe) id: number) {
    await this.playerService.deleteRecord(id);
    return { message: 'Record deleted successfully' };
  }

  @Get('collect')
  @ApiOperation({ summary: '获取收藏列表' })
  async getCollects(@Query() dto: QueryRecordDto) {
    const { list, total } = await this.playerService.getCollects(dto);
    return {
      list,
      total,
      page: dto.page || 1,
      pageSize: dto.pageSize || 20,
    };
  }

  @Post('collect')
  @ApiOperation({ summary: '添加收藏' })
  async addCollect(@Body() dto: AddCollectDto) {
    return this.playerService.addCollect(dto);
  }

  @Delete('collect/:id')
  @ApiOperation({ summary: '取消收藏' })
  async removeCollect(@Param('id', ParseIntPipe) id: number) {
    await this.playerService.removeCollect(id);
    return { message: 'Collect removed successfully' };
  }

  @Get('collect/check')
  @ApiOperation({ summary: '检查是否已收藏' })
  async checkCollect(@Query('sourceKey') sourceKey: string, @Query('vodId') vodId: string) {
    const collected = await this.playerService.isCollected(sourceKey, vodId);
    return { collected };
  }
}
