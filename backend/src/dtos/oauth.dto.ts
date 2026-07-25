import { z } from "zod";

export const AuthorizeQueryDto = z.object({
  client_id: z.string().min(1, "client_id is required"),
  redirect_uri: z.string().url("redirect_uri must be a valid URL"),
  response_type: z.literal("code", {
    errorMap: () => ({ message: "response_type must be 'code' for OAuth 2.1" }),
  }),
  scope: z.string().default("openid profile email"),
  state: z.string().min(1, "state is required"),
  code_challenge: z.string().min(1, "code_challenge is required for PKCE"),
  code_challenge_method: z.literal("S256", {
    errorMap: () => ({ message: "code_challenge_method must be 'S256'" }),
  }),
  nonce: z.string().optional(),
});

export const TokenRequestBodyDto = z.object({
  grant_type: z.enum(["authorization_code", "refresh_token"]),
  client_id: z.string().min(1, "client_id is required"),
  client_secret: z.string().optional(),
  code: z.string().optional(),
  redirect_uri: z.string().optional(),
  code_verifier: z.string().optional(),
  refresh_token: z.string().optional(),
});

export const RevokeTokenDto = z.object({
  token: z.string().min(1, "token is required"),
  token_type_hint: z.enum(["access_token", "refresh_token"]).optional(),
  client_id: z.string().min(1, "client_id is required"),
  client_secret: z.string().optional(),
});

export const IntrospectTokenDto = z.object({
  token: z.string().min(1, "token is required"),
  token_type_hint: z.enum(["access_token", "refresh_token"]).optional(),
});

export type AuthorizeQueryInput = z.infer<typeof AuthorizeQueryDto>;
export type TokenRequestBodyInput = z.infer<typeof TokenRequestBodyDto>;
