import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("❌ [Global Error Handler]:", err);

  const statusCode = err.statusCode || err.status || 500;
  const error = err.code || err.error || "server_error";
  const description = err.description || err.message || "An unexpected error occurred on the server";

  res.status(statusCode).json({
    error,
    error_description: description,
  });
}
