import 'reflect-metadata';

import app from '@/app';
import { env } from '@/config/env';
import { AppDataSource } from '@/database/data-source';
import { logger } from '@/lib/logger';
import { JobsService } from '@/services/jobs.service';

async function bootstrap() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Initialize jobs service
    await JobsService.initialize();
    logger.info('Jobs service initialized');

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
