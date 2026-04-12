import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 播放请求 DTO
 */
export class PlayRequestDto {
  @ApiProperty({ description: '数据源标识' })
  @IsString()
  sourceKey: string;

  @ApiProperty({ description: '视频 ID' })
  @IsString()
  vodId: string;

  @ApiProperty({ description: '播放标识/线路' })
  @IsString()
  flag: string;

  @ApiProperty({ description: '播放地址' })
  @IsString()
  url: string;
}

/**
 * 播放结果 DTO
 */
export class PlayResultDto {
  @ApiProperty({ description: '播放地址' })
  url: string;

  @ApiPropertyOptional({ description: '请求头' })
  header?: Record<string, string>;

  @ApiPropertyOptional({ description: '是否需要解析：0=不需要，1=需要' })
  parse?: number;

  @ApiPropertyOptional({ description: '解析来源' })
  jxFrom?: string;
}

/**
 * 保存播放记录 DTO
 */
export class SaveRecordDto {
  @ApiProperty({ description: '视频 ID' })
  @IsString()
  vodId: string;

  @ApiProperty({ description: '视频名称' })
  @IsString()
  vodName: string;

  @ApiPropertyOptional({ description: '视频图片' })
  @IsOptional()
  @IsString()
  vodPic?: string;

  @ApiProperty({ description: '数据源标识' })
  @IsString()
  sourceKey: string;

  @ApiPropertyOptional({ description: '剧集索引' })
  @IsOptional()
  @IsNumber()
  episodeIndex?: number;

  @ApiPropertyOptional({ description: '播放位置（秒）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  playPosition?: number;

  @ApiPropertyOptional({ description: '播放时长（秒）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}

/**
 * 添加收藏 DTO
 */
export class AddCollectDto {
  @ApiProperty({ description: '视频 ID' })
  @IsString()
  vodId: string;

  @ApiProperty({ description: '视频名称' })
  @IsString()
  vodName: string;

  @ApiPropertyOptional({ description: '视频图片' })
  @IsOptional()
  @IsString()
  vodPic?: string;

  @ApiProperty({ description: '数据源标识' })
  @IsString()
  sourceKey: string;

  @ApiPropertyOptional({ description: '视频备注' })
  @IsOptional()
  @IsString()
  vodRemarks?: string;
}

/**
 * 查询播放记录 DTO
 */
export class QueryRecordDto {
  @ApiPropertyOptional({ description: '当前页', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页大小', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number;
}
