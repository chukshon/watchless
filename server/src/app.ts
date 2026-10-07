import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { env } from '@/config/env';
import { morganStream } from '@/lib/logger';
import routes from '@/routes';

import { getSuccessResponse } from '@/types/api-response';
import { errorHandlerMiddleware } from '@/middleware/error.middleware';
import { notFoundMiddleware } from '@/middleware/not-found.middleware';

import { SubscriptionController } from './controllers/subscription.controller';

const app = express();

app.post(
  '/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  SubscriptionController.handleWebhook
);

app.use(cors());
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: morganStream,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json(
    getSuccessResponse({ name: 'watchless-api' }, 'Watchless API is running')
  );
});

app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
