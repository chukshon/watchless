import 'dotenv/config';

import { z } from 'zod';
import { createEnv } from './create-env';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('http'),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1).default('watchless'),
  DB_USER: z.string().min(1).default('watchless'),
  DB_PASSWORD: z.string().min(1).default('watchless'),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
});

export const env = createEnv(envSchema);

export type Env = typeof env;
