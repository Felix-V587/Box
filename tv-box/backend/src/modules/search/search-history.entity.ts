import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 搜索历史实体
 */
@Entity('t_search_history')
@Index(['keyword'])
@Index(['searchTime'])
export class SearchHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '搜索关键词' })
  keyword: string;

  @Column({ type: 'int', nullable: true, comment: '结果数量' })
  resultCount: number;

  @CreateDateColumn({ type: 'datetime', comment: '搜索时间' })
  searchTime: Date;
}
