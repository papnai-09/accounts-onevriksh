import { ConnectedApp, IConnectedApp } from "../models/ConnectedApp.js";

export class ConsentRepository {
  async findConsent(userId: string, clientId: string): Promise<IConnectedApp | null> {
    return ConnectedApp.findOne({ userId, clientId });
  }

  async saveConsent(userId: string, clientId: string, scopes: string[]): Promise<IConnectedApp> {
    return ConnectedApp.findOneAndUpdate(
      { userId, clientId },
      { grantedScopes: scopes, grantedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  async findUserConnectedApps(userId: string): Promise<IConnectedApp[]> {
    return ConnectedApp.find({ userId }).sort({ updatedAt: -1 });
  }

  async revokeConsent(userId: string, clientId: string): Promise<boolean> {
    const result = await ConnectedApp.deleteOne({ userId, clientId });
    return result.deletedCount > 0;
  }
}
