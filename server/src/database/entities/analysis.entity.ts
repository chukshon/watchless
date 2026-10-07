import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AnalysisSentiment } from '@/constants/analysis';
import { Video } from '@/database/entities/video.entity';

@Entity({ name: 'analyses' })
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ name: 'key_points', type: 'text', array: true })
  keyPoints: string[];

  @Column({
    type: 'enum',
    enum: AnalysisSentiment,
    default: AnalysisSentiment.NEUTRAL,
  })
  sentiment: AnalysisSentiment;

  @Column({ type: 'text', array: true })
  topics: string[];

  @Column({ name: 'suggested_tags', type: 'text', array: true })
  suggestedTags: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => Video, (video) => video.analysis, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'video_id' })
  video: Video;
}
