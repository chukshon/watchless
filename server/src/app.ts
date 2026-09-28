import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { env } from './config/env';
import { getSuccessResponse } from './lib/api-response';
import { morganStream } from './lib/logger';
import routes from './routes';

const app = express();

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

export default app;
