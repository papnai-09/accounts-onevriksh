import { AuthorizationCode, IAuthorizationCode } from "../models/AuthorizationCode.js";

export class AuthCodeRepository {
  async create(data: Partial<IAuthorizationCode>): Promise<IAuthorizationCode> {
    return AuthorizationCode.create(data);
  }

  async findByCodeHash(codeHash: string): Promise<IAuthorizationCode | null> {
    return AuthorizationCode.findOne({ codeHash });
  }

  async markAsUsed(id: string): Promise<void> {
    await AuthorizationCode.findByIdAndUpdate(id, { used: true });
  }
}
