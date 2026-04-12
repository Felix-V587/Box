import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 搜索请求 DTO
 */
export class SearchRequestDto {
  @ApiProperty({ description: '搜索关键词', example: '复仇者联盟' })
  @IsString()
  keyword: string;

  @ApiPropertyOptional({ description: '指定数据源列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sources?: string[];

  @ApiPropertyOptional({ description: '是否快速搜索模式', default: false })
  @IsOptional()
  @IsBoolean()
  quick?: boolean;

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
}

/**
 * 搜索结果项 DTO
 */
export class SearchResultItemDto {
  @ApiProperty({ description: '视频 ID' })
  vodId: string;

  @ApiProperty({ description: '视频名称' })
  vodName: string;

  @ApiPropertyOptional({ description: '视频图片' })
  vodPic?: string;

  @ApiPropertyOptional({ description: '备注信息' })
  vodRemarks?: string;

  @ApiProperty({ description: '数据源标识' })
  sourceKey: string;

  @ApiProperty({ description: '数据源名称' })
  sourceName: string;
}

/**
 * 搜索结果 DTO
 */
export class SearchResultDto {
  @ApiProperty({ description: '结果列表', type: [SearchResultItemDto] })
  list: SearchResultItemDto[];

  @ApiProperty({ description: '总数' })
  total: number;

  @ApiProperty({ description: '当前页' })
  page: number;

  @ApiProperty({ description: '每页大小' })
  pageSize: number;

  @ApiProperty({ description: '搜索耗时（毫秒）' })
  searchTime: number;
}

/**
 * 搜索历史 DTO
 */
export class SearchHistoryDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '搜索关键词' })
  keyword: string;

  @ApiProperty({ description: '搜索时间' })
  searchTime: Date;

  @ApiPropertyOptional({ description: '结果数量' })
  resultCount?: number;
}

/**
 * 查询搜索历史 DTO
 */
export class QuerySearchHistoryDto {
  @ApiPropertyOptional({ description: '限制数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  limit?: number;
}
