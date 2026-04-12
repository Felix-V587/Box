import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DetailService } from './detail.service';
import { DetailRequestDto } from './dto/detail.dto';

@ApiTags('详情')
@ApiBearerAuth()
@Controller('detail')
export class DetailController {
  constructor(private readonly detailService: DetailService) {}

  @Get()
  @ApiOperation({ summary: '获取视频详情' })
  async getDetail(@Query() dto: DetailRequestDto) {
    return this.detailService.getDetail(dto);
  }
}
