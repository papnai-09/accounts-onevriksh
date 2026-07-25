import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/onevriksh_accounts"),
  JWT_SECRET: z.string().default("onevriksh_super_secret_jwt_key_2026_change_in_prod"),
  ISSUER: z.string().default("https://accounts.onevriksh.in"),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  RSA_PRIVATE_KEY: z.string().optional(),
  RSA_PUBLIC_KEY: z.string().optional(),
  KID: z.string().default("onevriksh-rs256-key-1"),
});

export const env = envSchema.parse(process.env);
