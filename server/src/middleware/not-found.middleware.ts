import type { NextFunction, Request, Response } from 'express';
import { NotFoundException } from '../errors/http-errors';

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new NotFoundException(`Cannot ${req.method} ${req.originalUrl}`));
};
