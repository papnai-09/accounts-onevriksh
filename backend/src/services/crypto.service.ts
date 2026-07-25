import bcrypt from "bcryptjs";

export class CryptoService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashSecret(secret: string): Promise<string> {
    return bcrypt.hash(secret, 10);
  }

  async compareSecret(secret: string, hash: string): Promise<boolean> {
    return bcrypt.compare(secret, hash);
  }
}
