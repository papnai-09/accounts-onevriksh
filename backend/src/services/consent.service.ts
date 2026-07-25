import { ConsentRepository } from "../repositories/consent.repository.js";
import { ClientRepository } from "../repositories/client.repository.js";

export class ConsentService {
  private consentRepo = new ConsentRepository();
  private clientRepo = new ClientRepository();

  async hasConsent(userId: string, clientId: string, requestedScopes: string[]): Promise<boolean> {
    const client = await this.clientRepo.findByClientId(clientId);
    if (client && client.isFirstParty) {
      return true; // First-party applications skip consent prompt
    }

    const consent = await this.consentRepo.findConsent(userId, clientId);
    if (!consent) return false;

    // Verify all requested scopes are already granted
    return requestedScopes.every((scope) => consent.grantedScopes.includes(scope));
  }

  async grantConsent(userId: string, clientId: string, scopes: string[]) {
    return this.consentRepo.saveConsent(userId, clientId, scopes);
  }

  async getUserConnectedApps(userId: string) {
    const consents = await this.consentRepo.findUserConnectedApps(userId);
    const result = [];
    for (const consent of consents) {
      const client = await this.clientRepo.findByClientId(consent.clientId);
      if (client) {
        result.push({
          clientId: client.clientId,
          clientName: client.clientName,
          logoUrl: client.logoUrl,
          grantedScopes: consent.grantedScopes,
          grantedAt: consent.grantedAt,
        });
      }
    }
    return result;
  }

  async revokeConsent(userId: string, clientId: string) {
    return this.consentRepo.revokeConsent(userId, clientId);
  }
}
