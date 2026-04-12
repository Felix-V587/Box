import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 详情请求 DTO
 */
export class DetailRequestDto {
  @ApiProperty({ description: '数据源标识' })
  @IsString()
  sourceKey: string;

  @ApiProperty({ description: '视频 ID' })
  @IsString()
  vodId: string;
}

/**
 * 剧集信息 DTO
 */
export class EpisodeDto {
  @ApiProperty({ description: '剧集名称' })
  name: string;

  @ApiProperty({ description: '播放地址' })
  url: string;
}

/**
 * 线路信息 DTO
 */
export class SeriesDto {
  @ApiProperty({ description: '线路名称' })
  name: string;

  @ApiProperty({ description: '剧集列表', type: [EpisodeDto] })
  episodes: EpisodeDto[];
}

/**
 * 视频详情 DTO
 */
export class VodInfoDto {
  @ApiProperty({ description: '视频 ID' })
  vodId: string;

  @ApiProperty({ description: '视频名称' })
  vodName: string;

  @ApiPropertyOptional({ description: '视频图片' })
  vodPic?: string;

  @ApiPropertyOptional({ description: '备注信息' })
  vodRemarks?: string;

  @ApiPropertyOptional({ description: '视频简介' })
  vodContent?: string;

  @ApiPropertyOptional({ description: '导演' })
  vodDirector?: string;

  @ApiPropertyOptional({ description: '演员' })
  vodActor?: string;

  @ApiPropertyOptional({ description: '地区' })
  vodArea?: string;

  @ApiPropertyOptional({ description: '年份' })
  vodYear?: string;

  @ApiPropertyOptional({ description: '播放来源（线路名称）' })
  vodPlayFrom?: string;

  @ApiPropertyOptional({ description: '播放地址列表' })
  vodPlayUrl?: string;

  @ApiPropertyOptional({ description: '线路列表', type: [SeriesDto] })
  series?: SeriesDto[];
}
