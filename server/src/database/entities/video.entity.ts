import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VideoStatus } from '@/constants/video';
import { Transcription } from '@/database/entities/transcription.entity';
import { User } from '@/database/entities/user.entity';

@Entity({ name: 'videos' })
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail: string | null;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.PENDING,
  })
  status: VideoStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.videos, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @OneToOne(() => Transcription, (transcription) => transcription.video)
  transcription: Transcription;
}
