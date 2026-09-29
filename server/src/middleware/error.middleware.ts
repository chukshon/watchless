import type { NextFunction, Request, Response } from 'express';
import { env } from '@/config/env';
import { HTTPSTATUS } from '@/constants/http-status-code';
import { AppError } from '@/errors/app-error';
import { getErrorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, {
        stack: err.stack,
        errorCode: err.errorCode,
        details: err.details,
      });
    } else {
      logger.warn(err.message, {
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        details: err.details,
      });
    }

    res
      .status(err.statusCode)
      .json(getErrorResponse(err.message, err.details, err.errorCode));
    return;
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  const message =
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res
    .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
    .json(getErrorResponse(message));
};
