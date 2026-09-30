import Queue from 'bull';

import { env } from '@/config/env';

import { AppDataSource } from '@/database/data-source';
import { Transcription } from '@/database/entities/transcription.entity';
import { Video } from '@/database/entities/video.entity';
import { Analysis } from '@/database/entities/analysis.entity';
import { User } from '@/database/entities/user.entity';

export class JobsService {
  private static transcriptionQueue: Queue.Queue;
  private static readonly videoRepository = AppDataSource.getRepository(Video);
  private static readonly transcriptionRepository =
    AppDataSource.getRepository(Transcription);
  private static readonly analysisRepository =
    AppDataSource.getRepository(Analysis);
  private static readonly userRepository = AppDataSource.getRepository(User);

  static async initialize() {
    this.transcriptionQueue = new Queue('transcription', {
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600, // 24 hours
          count: 100,
        },
        removeOnFail: {
          age: 24 * 3600, // 24 hours
        },
      },
    });
  }
}
