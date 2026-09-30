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

  RESEND_API_KEY: z.string().min(1),
  RESEND_EMAIL_SENDER: z.string().email(),

  FRONTEND_URL: z.url(),

  GCS_BUCKET_NAME: z.string().min(1),
  GCS_LOCATION: z.string().min(1),
  GCS_STORAGE_CLASS: z.string().min(1),
});

export const env = createEnv(envSchema);

export type Env = typeof env;
