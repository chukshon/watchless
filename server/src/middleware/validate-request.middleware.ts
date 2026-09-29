import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { UnprocessableEntityException } from '@/errors/http-errors';

type ParamsRecord = Record<string, string>;
type QueryRecord = Record<string, unknown>;

export interface RequestValidationSchema {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export type ValidatedRequest = Request & {
  validatedQuery?: QueryRecord;
};

const formatZodError = (error: ZodError) => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
};

export const validateRequest = (schema: RequestValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.params) {
        const parsedParams = schema.params.parse(req.params) as ParamsRecord;
        req.params = parsedParams as Request['params'];
      }

      if (schema.query) {
        const parsedQuery = schema.query.parse(req.query) as QueryRecord;
        (req as ValidatedRequest).validatedQuery = parsedQuery;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new UnprocessableEntityException(
            'Validation Error',
            'VALIDATION_ERROR',
            { errors: formatZodError(error) },
          ),
        );
        return;
      }

      next(error);
    }
  };
};
