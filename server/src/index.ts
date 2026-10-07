import 'reflect-metadata';
import app from '@/app';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { createBullAdminApp } from '@/lib/bull-board';

import { AppDataSource } from '@/database/data-source';
import { JobsService } from '@/services/jobs.service';

import { seedSubscriptionPlans } from '@/database/seed/subscription-plans.seed';

async function bootstrap() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Seed Subscription Plans
    await seedSubscriptionPlans();

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
