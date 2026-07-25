import { RefreshToken, IRefreshToken } from "../models/RefreshToken.js";
import { AccessToken, IAccessToken } from "../models/AccessToken.js";

export class TokenRepository {
  // Refresh Token operations
  async createRefreshToken(data: Partial<IRefreshToken>): Promise<IRefreshToken> {
    return RefreshToken.create(data);
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({ tokenHash });
  }

  async revokeRefreshToken(id: string, replacedByHash?: string): Promise<void> {
    await RefreshToken.findByIdAndUpdate(id, {
      revoked: true,
      replacedByTokenHash: replacedByHash,
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await RefreshToken.updateMany({ familyId }, { revoked: true });
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await RefreshToken.updateMany({ userId }, { revoked: true });
  }

  // Access Token operations
  async createAccessToken(data: Partial<IAccessToken>): Promise<IAccessToken> {
    return AccessToken.create(data);
  }

  async findAccessTokenByJti(jti: string): Promise<IAccessToken | null> {
    return AccessToken.findOne({ jti });
  }

  async revokeAccessToken(jti: string): Promise<void> {
    await AccessToken.findOneAndUpdate({ jti }, { revoked: true });
  }
}
