import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 数据源实体
 */
@Entity('t_source')
@Index(['sourceKey'], { unique: true })
export class Source {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '数据源唯一标识' })
  sourceKey: string;

  @Column({ type: 'varchar', length: 100, comment: '数据源名称' })
  sourceName: string;

  @Column({
    type: 'int',
    comment: '数据源类型：0=XML, 1=JSON, 3=Spider, 4=扩展',
  })
  sourceType: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '数据源 API 地址',
  })
  sourceUrl: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Spider 类型：jar/js/py',
  })
  spiderType: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Spider 文件路径或内容',
  })
  spiderContent: string;

  @Column({
    type: 'int',
    default: 1,
    comment: '状态：0=禁用, 1=启用, 2=离线',
  })
  status: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'text', nullable: true, comment: '扩展配置 JSON' })
  ext: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}
