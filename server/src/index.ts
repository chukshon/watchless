import 'reflect-metadata';
import express from 'express';
import app from '@/app';
import cors from 'cors';
import { env } from '@/config/env';
import { AppDataSource } from '@/database/data-source';
import { logger } from '@/lib/logger';
import { JobsService } from '@/services/jobs.service';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullAdminApp } from './lib/bull-board';

async function bootstrap() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Initialize jobs service
    await JobsService.initialize();
    logger.info('Jobs service initialized');

    // Initialize bull board
    const bullAdminApp = createBullAdminApp(
      JobsService.getTranscriptionQueue()
    );

    // Start bull admin server
    bullAdminApp.listen(env.BULL_ADMIN_PORT, () => {
      logger.info(
        `Bull admin server listening on http://localhost:${env.BULL_ADMIN_PORT}`
      );
    });

    // Start server
    app.listen(env.PORT, () => {
      logger.info(`Server listening on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

void bootstrap();
