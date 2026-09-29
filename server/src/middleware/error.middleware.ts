import { ErrorRequestHandler } from 'express';
import { HTTPSTATUS } from '@/constants/http-status-code';
import { AppError } from '@/errors/app-error';
import { logger } from '@/lib/logger';

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  logger.error(err.message, { error: err });

  if (err instanceof AppError) {
    const response = err?.details
      ? { success: false, message: err.message, errors: err.details.errors }
      : { success: false, message: err.message };

    return res.status(err.statusCode).json(response);
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    error: err?.message || 'An unknown error occurred',
  });
};
