import express from 'express';
import cors from 'cors';
import Queue from 'bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';

export function createBullAdminApp(queue: Queue.Queue) {
  const serverAdapter = new ExpressAdapter();
  const bullAdminApp = express();

  createBullBoard({
    queues: [new BullAdapter(queue)],
    serverAdapter,
  });

  serverAdapter.setBasePath('/admin/queues');
  bullAdminApp.use(cors());
  bullAdminApp.use('/admin/queues', serverAdapter.getRouter());

  return bullAdminApp;
}
