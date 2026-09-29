import type { RequestHandler, Request, Response, NextFunction } from "express";

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

type ErrorForwarder = (error: Error) => void;

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

const forwardError = (nextFn: ErrorForwarder, error: unknown) => {
  nextFn(toError(error));
};

export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    void handler(req, res, next).catch((error: unknown) =>
      forwardError(next as ErrorForwarder, error),
    );
  };
};
