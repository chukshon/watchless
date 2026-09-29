import 'reflect-metadata';

import { join } from 'path';
import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { User } from './entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: [User],
  migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
});
