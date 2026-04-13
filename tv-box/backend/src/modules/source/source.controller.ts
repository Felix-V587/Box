import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { SourceService } from './source.service';
import {
  CreateSourceDto,
  UpdateSourceDto,
  UpdateSourceStatusDto,
  QuerySourceDto,
} from './dto/source.dto';

@ApiTags('数据源管理')
@ApiBearerAuth()
@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Post('config')
  @ApiOperation({ summary: '上传并解析配置文件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadConfig(@UploadedFile() file: any) {
    const configJson = file.buffer.toString('utf-8');
    const result = await this.sourceService.parseConfig(configJson);
    return {
      sources: result.sources,
      loadedCount: result.loadedCount,
      failedCount: result.failedCount,
    };
  }

  @Post('parse-url')
  @ApiOperation({ summary: '从URL解析配置并入库' })
  async parseFromUrl(@Body('url') url: string) {
    const result = await this.sourceService.parseFromUrl(url);
    return {
      sources: result.sources,
      loadedCount: result.loadedCount,
      failedCount: result.failedCount,
    };
  }

  @Post()
  @ApiOperation({ summary: '创建数据源' })
  async create(@Body() dto: CreateSourceDto) {
    return this.sourceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '获取数据源列表' })
  async findAll(@Query() query: QuerySourceDto) {
    const { list, total } = await this.sourceService.findAll(query);
    return {
      list,
      total,
      page: query.page || 1,
      pageSize: query.pageSize || 20,
    };
  }

  @Get('enabled')
  @ApiOperation({ summary: '获取所有启用的数据源' })
  async findAllEnabled() {
    return this.sourceService.findAllEnabled();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个数据源详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sourceService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新数据源' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSourceDto) {
    return this.sourceService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '启用/禁用数据源' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSourceStatusDto,
  ) {
    return this.sourceService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除数据源' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.sourceService.delete(id);
    return { message: 'Source deleted successfully' };
  }

  @Get(':id/test')
  @ApiOperation({ summary: '测试数据源连接' })
  async testConnection(@Param('id', ParseIntPipe) id: number) {
    return this.sourceService.testConnection(id);
  }
}
