import {
  HTTPSTATUS,
  type HttpStatusCodeType,
} from '@/constants/http-status-code';

export class AppError extends Error {
  readonly statusCode: HttpStatusCodeType;
  readonly errorCode?: string;
  readonly details?: Record<string, unknown>;
  readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    this.name = this.constructor.name;

    Error.captureStackTrace?.(this, this.constructor);
  }
}
