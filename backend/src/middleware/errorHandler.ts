import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

interface HttpError extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || 500;
  logger.error(`${req.method} ${req.path} failed`, err);
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}
