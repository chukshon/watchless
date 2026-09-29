import { AppError } from '@/errors/app-error';
import {
  HTTPSTATUS,
  type HttpStatusCodeType,
} from '@/constants/http-status-code';

export class HttpException extends AppError {
  constructor(
    message = 'Http Exception error',
    statusCode: HttpStatusCodeType,
    errorCode?: string,
  ) {
    super(message, statusCode, errorCode);
  }
}

export class NotFoundException extends AppError {
  constructor(message = 'Resource not found', errorCode?: string) {
    super(message, HTTPSTATUS.NOT_FOUND, errorCode);
  }
}

export class BadRequestException extends AppError {
  constructor(message = 'Bad request', errorCode?: string) {
    super(message, HTTPSTATUS.BAD_REQUEST, errorCode);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized Access', errorCode?: string) {
    super(message, HTTPSTATUS.UNAUTHORIZED, errorCode);
  }
}

export class InternalServerErrorException extends AppError {
  constructor(message = 'Internal server error', errorCode?: string) {
    super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = 'Forbidden', errorCode?: string) {
    super(message, HTTPSTATUS.FORBIDDEN, errorCode);
  }
}

export class ConflictException extends AppError {
  constructor(message = 'Conflict', errorCode?: string) {
    super(message, HTTPSTATUS.CONFLICT, errorCode);
  }
}

export class UnprocessableEntityException extends AppError {
  constructor(
    message = 'Unprocessable entity',
    errorCode?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, HTTPSTATUS.UNPROCESSABLE_ENTITY, errorCode, details);
  }
}

export class TooManyRequestsException extends AppError {
  constructor(message = 'Too many requests', errorCode?: string) {
    super(message, HTTPSTATUS.TOO_MANY_REQUEST, errorCode);
  }
}
