import { UserRepository } from "../repositories/user.repository.js";
import { CryptoService } from "./crypto.service.js";
import { RegisterInput, LoginInput } from "../dtos/auth.dto.js";

export class AuthService {
  private userRepo = new UserRepository();
  private cryptoService = new CryptoService();

  async register(input: RegisterInput) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await this.cryptoService.hashPassword(input.password);
    const user = await this.userRepo.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      passwordHash,
      roles: ["USER"],
      status: "ACTIVE", // Auto-active for demonstration / simplified flow
      isEmailVerified: true,
      isBlocked: false,
    });

    return user;
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (user.isBlocked || user.status === "BLOCKED" || user.status === "BANNED") {
      throw new Error("ACCOUNT_BLOCKED");
    }

    const match = await this.cryptoService.comparePassword(input.password, user.passwordHash);
    if (!match) {
      await this.userRepo.incrementFailedAttempts(user);
      throw new Error("INVALID_CREDENTIALS");
    }

    await this.userRepo.resetFailedAttempts(user);
    return user;
  }

  async getUserById(userId: string) {
    return this.userRepo.findById(userId);
  }
}
