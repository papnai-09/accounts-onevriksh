import { OAuthClient, IOAuthClient } from "../models/OAuthClient.js";

export class ClientRepository {
  async findByClientId(clientId: string): Promise<IOAuthClient | null> {
    return OAuthClient.findOne({ clientId }).select("+clientSecretHash");
  }

  async findAll(): Promise<IOAuthClient[]> {
    return OAuthClient.find().sort({ createdAt: -1 });
  }

  async create(data: Partial<IOAuthClient>): Promise<IOAuthClient> {
    return OAuthClient.create(data);
  }

  async updateByClientId(clientId: string, updates: Partial<IOAuthClient>): Promise<IOAuthClient | null> {
    return OAuthClient.findOneAndUpdate({ clientId }, updates, { new: true });
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    const result = await OAuthClient.deleteOne({ clientId });
    return result.deletedCount > 0;
  }
}
