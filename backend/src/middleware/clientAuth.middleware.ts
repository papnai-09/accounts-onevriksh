import { Request, Response, NextFunction } from "express";
import { ClientService } from "../services/client.service.js";
import { sendOAuthError } from "../utils/response.util.js";

const clientService = new ClientService();

export interface ClientAuthenticatedRequest extends Request {
  oauthClient?: any;
}

export async function authenticateOAuthClient(
  req: ClientAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let clientId: string | undefined = req.body.client_id || (req.query.client_id as string);
  let clientSecret: string | undefined = req.body.client_secret;

  // Check HTTP Basic Auth Header (Authorization: Basic <base64(client_id:client_secret)>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Basic ")) {
    const credentials = Buffer.from(authHeader.substring(6), "base64").toString("utf-8");
    const [id, secret] = credentials.split(":");
    clientId = id;
    clientSecret = secret;
  }

  if (!clientId) {
    return sendOAuthError(res, 401, "invalid_client", "client_id is missing");
  }

  const { valid, client } = await clientService.validateClientCredentials(clientId, clientSecret);
  if (!valid || !client) {
    return sendOAuthError(res, 401, "invalid_client", "Client authentication failed");
  }

  req.oauthClient = client;
  next();
}
