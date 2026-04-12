import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 缓存实体
 */
@Entity('t_cache')
@Index(['cacheKey'], { unique: true })
export class Cache {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '缓存键' })
  cacheKey: string;

  @Column({ type: 'text', comment: '缓存值' })
  cacheValue: string;

  @Column({ type: 'datetime', comment: '过期时间' })
  expireTime: Date;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}
