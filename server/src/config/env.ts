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
    .default('info'),
});

export const env = createEnv(envSchema);

export type Env = typeof env;
