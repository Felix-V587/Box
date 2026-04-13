import { IsString, IsNumber, IsOptional, IsIn, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建数据源 DTO
 */
export class CreateSourceDto {
  @ApiProperty({ description: '数据源唯一标识', example: 'source_1' })
  @IsString()
  sourceKey: string;

  @ApiProperty({ description: '数据源名称', example: '数据源1' })
  @IsString()
  sourceName: string;

  @ApiProperty({ description: '数据源类型：0=XML, 1=JSON, 3=Spider, 4=扩展', example: 3 })
  @IsNumber()
  @IsIn([0, 1, 3, 4])
  sourceType: number;

  @ApiPropertyOptional({ description: '数据源 API 地址' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Spider 类型：jar/js/py' })
  @IsOptional()
  @IsString()
  spiderType?: string;

  @ApiPropertyOptional({ description: 'Spider 文件路径或内容' })
  @IsOptional()
  @IsString()
  spiderContent?: string;

  @ApiPropertyOptional({ description: '状态：0=禁用, 1=启用, 2=离线', default: 1 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ description: '扩展配置 JSON' })
  @IsOptional()
  @IsString()
  ext?: string;
}

/**
 * 更新数据源 DTO
 */
export class UpdateSourceDto {
  @ApiPropertyOptional({ description: '数据源名称' })
  @IsOptional()
  @IsString()
  sourceName?: string;

  @ApiPropertyOptional({ description: '数据源 API 地址' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Spider 内容' })
  @IsOptional()
  @IsString()
  spiderContent?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ description: '扩展配置' })
  @IsOptional()
  @IsString()
  ext?: string;
}

/**
 * 更新数据源状态 DTO
 */
export class UpdateSourceStatusDto {
  @ApiProperty({ description: '状态：0=禁用, 1=启用', example: 1 })
  @IsNumber()
  @IsIn([0, 1])
  status: number;
}

/**
 * 数据源配置解析 DTO
 */
export class SourceConfigDto {
  @ApiProperty({ description: '配置 JSON 内容' })
  @IsString()
  config: string;
}

/**
 * 查询数据源列表 DTO
 */
export class QuerySourceDto {
  @ApiPropertyOptional({ description: '当前页', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页大小', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ description: '状态过滤' })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
