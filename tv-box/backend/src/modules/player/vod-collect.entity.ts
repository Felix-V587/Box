import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 收藏记录实体
 */
@Entity('t_vod_collect')
@Index(['sourceKey', 'vodId'], { unique: true })
@Index(['collectTime'])
export class VodCollect {
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

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '视频备注',
  })
  vodRemarks: string;

  @CreateDateColumn({ type: 'datetime', comment: '收藏时间' })
  collectTime: Date;
}
