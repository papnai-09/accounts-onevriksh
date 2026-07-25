import { User, IUser } from "../models/User.js";

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select("+passwordHash +totpSecret");
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username: username.toLowerCase() });
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }

  async updateById(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updates, { new: true });
  }

  async incrementFailedAttempts(user: IUser): Promise<void> {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    user.lastFailedLogin = new Date();
    if (user.failedLoginAttempts >= 5) {
      user.status = "BLOCKED";
      user.isBlocked = true;
    }
    await user.save();
  }

  async resetFailedAttempts(user: IUser): Promise<void> {
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();
  }
}
