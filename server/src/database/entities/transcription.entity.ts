import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from '@/database/entities/video.entity';

@Entity({ name: 'transcriptions' })
export class Transcription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'float' })
  confidence: number;

  @Column({ name: 'is_music', type: 'boolean', default: false })
  isMusic: boolean;

  @Column({ name: 'audio_path', type: 'varchar', length: 500 })
  audioPath: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => Video, (video) => video.transcription, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  video: Video;
}
