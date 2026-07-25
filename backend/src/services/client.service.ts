import { ClientRepository } from "../repositories/client.repository.js";
import { CryptoService } from "./crypto.service.js";
import { generateClientId, generateClientSecret } from "../utils/tokens.util.js";
import { CreateClientInput, UpdateClientInput } from "../dtos/client.dto.js";

export class ClientService {
  private clientRepo = new ClientRepository();
  private cryptoService = new CryptoService();

  async getClientByClientId(clientId: string) {
    return this.clientRepo.findByClientId(clientId);
  }

  async getAllClients() {
    return this.clientRepo.findAll();
  }

  async createClient(input: CreateClientInput) {
    const clientId = generateClientId();
    let rawSecret: string | undefined = undefined;
    let secretHash: string | undefined = undefined;

    if (!input.isPublic) {
      rawSecret = generateClientSecret();
      secretHash = await this.cryptoService.hashSecret(rawSecret);
    }

    const client = await this.clientRepo.create({
      clientId,
      clientSecretHash: secretHash,
      clientName: input.clientName,
      logoUrl: input.logoUrl,
      redirectUris: input.redirectUris,
      allowedOrigins: input.allowedOrigins,
      scopes: input.scopes,
      isFirstParty: input.isFirstParty,
      isPkceRequired: true,
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      status: "ACTIVE",
    });

    return { client, rawSecret };
  }

  async updateClient(clientId: string, updates: UpdateClientInput) {
    return this.clientRepo.updateByClientId(clientId, updates);
  }

  async rotateSecret(clientId: string) {
    const rawSecret = generateClientSecret();
    const secretHash = await this.cryptoService.hashSecret(rawSecret);

    await this.clientRepo.updateByClientId(clientId, {
      clientSecretHash: secretHash,
    });

    return { clientId, rawSecret };
  }

  async deleteClient(clientId: string) {
    return this.clientRepo.deleteByClientId(clientId);
  }

  async validateClientCredentials(clientId: string, clientSecret?: string) {
    const client = await this.clientRepo.findByClientId(clientId);
    if (!client || client.status !== "ACTIVE") {
      return { valid: false, client: null };
    }
    // If confidential client with secret hash
    if (client.clientSecretHash) {
      if (!clientSecret) {
        return { valid: false, client: null };
      }
      const match = await this.cryptoService.compareSecret(clientSecret, client.clientSecretHash);
      if (!match) {
        return { valid: false, client: null };
      }
    }
    return { valid: true, client };
  }
}
