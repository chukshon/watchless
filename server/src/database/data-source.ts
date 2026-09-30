import 'reflect-metadata';

import { join } from 'path';
import { DataSource } from 'typeorm';
import { env } from '@/config/env';
import { Analysis } from '@/database/entities/analysis.entity';
import { Transcription } from '@/database/entities/transcription.entity';
import { User } from '@/database/entities/user.entity';
import { Video } from '@/database/entities/video.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: [User, Video, Transcription, Analysis],
  migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
});
