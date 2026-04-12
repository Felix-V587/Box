import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 播放记录实体
 */
@Entity('t_vod_record')
@Index(['sourceKey', 'vodId'])
@Index(['updateTime'])
export class VodRecord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '视频名称' })
  vodName: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '视频图片',
  })
  vodPic: string;

  @Column({ type: 'varchar', length: 50, comment: '数据源标识' })
  sourceKey: string;

  @Column({ type: 'varchar', length: 100, comment: '视频 ID' })
  vodId: string;

  @Column({ type: 'int', nullable: true, comment: '剧集索引' })
  episodeIndex: number;

  @Column({ type: 'int', nullable: true, comment: '播放位置（秒）' })
  playPosition: number;

  @Column({ type: 'int', default: 0, comment: '播放时长（秒）' })
  duration: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}
