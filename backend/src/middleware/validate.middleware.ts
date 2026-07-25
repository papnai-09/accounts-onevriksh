import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendOAuthError } from "../utils/response.util.js";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return sendOAuthError(res, 400, "invalid_request", issues);
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return sendOAuthError(res, 400, "invalid_request", issues);
      }
      next(error);
    }
  };
}
