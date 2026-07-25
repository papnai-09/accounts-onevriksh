import { z } from "zod";

export const CreateClientDto = z.object({
  clientName: z.string().min(1, "Client name is required").max(100),
  logoUrl: z.string().url().optional(),
  redirectUris: z.array(z.string().url()).min(1, "At least one redirect URI is required"),
  allowedOrigins: z.array(z.string().url()).default([]),
  scopes: z.array(z.string()).default(["openid", "profile", "email", "offline_access"]),
  isFirstParty: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export const UpdateClientDto = CreateClientDto.partial();

export type CreateClientInput = z.infer<typeof CreateClientDto>;
export type UpdateClientInput = z.infer<typeof UpdateClientDto>;
