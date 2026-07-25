import { Response } from "express";

export interface OAuthErrorPayload {
  error: string;
  error_description?: string;
  error_uri?: string;
  state?: string;
}

export function sendOAuthError(res: Response, statusCode: number, error: string, description?: string, state?: string) {
  const payload: OAuthErrorPayload = {
    error,
    error_description: description,
  };
  if (state) {
    payload.state = state;
  }
  return res.status(statusCode).json(payload);
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200) {
  return res.status(statusCode).json(data);
}
