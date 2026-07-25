import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { LoginHistory } from "../models/LoginHistory.js";
import { SecurityEvent } from "../models/SecurityEvent.js";
import { UserPreference } from "../models/UserPreference.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export class UserService {
  static async getUserById(userId: string) {
    const user = (await User.findById(userId).lean()) as any;
    if (!user || user.isDeleted) return null;
    return user;
  }

  static async updateProfile(userId: string, input: any) {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) throw new Error("User not found.");

    if (input.firstName) user.firstName = input.firstName;
    if (input.lastName) user.lastName = input.lastName;
    if (input.username !== undefined) user.username = input.username ? input.username.toLowerCase() : undefined;
    if (input.bio !== undefined) user.bio = input.bio;
    if (input.country !== undefined) user.country = input.country;
    if (input.state !== undefined) user.state = input.state;
    if (input.city !== undefined) user.city = input.city;
    if (input.address !== undefined) user.address = input.address;
    if (input.dateOfBirth !== undefined) user.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : undefined;
    if (input.gender !== undefined) user.gender = input.gender;
    if (input.language !== undefined) user.language = input.language;
    if (input.timezone !== undefined) user.timezone = input.timezone;
    if (input.website !== undefined) user.website = input.website;
    if (input.occupation !== undefined) user.occupation = input.occupation;
    if (input.company !== undefined) user.company = input.company;

    if (input.socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...input.socialLinks,
      };
    }

    await user.save();
    return { success: true, message: "Profile updated successfully!", user };
  }

  static async changePassword(userId: string, input: any, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user || user.isDeleted) throw new Error("User not found.");

    const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!isValid) throw new Error("Current password is incorrect.");

    user.passwordHash = await hashPassword(input.newPassword);
    await user.save();

    await SecurityEvent.create({
      userId: user._id,
      eventType: "PASSWORD_CHANGE",
      description: "Password changed from account settings",
      ipAddress,
      userAgent: userAgentStr,
      severity: "INFO",
    });

    return { success: true, message: "Password updated successfully!" };
  }

  static async deactivateAccount(userId: string, currentPasswordStr: string) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) throw new Error("User not found.");

    const isValid = await verifyPassword(currentPasswordStr, user.passwordHash);
    if (!isValid) throw new Error("Incorrect password.");

    user.status = "INACTIVE";
    await user.save();

    await Session.updateMany({ userId: user._id }, { isValid: false });
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    return { success: true, message: "Your account has been deactivated." };
  }

  static async deleteAccount(userId: string, currentPasswordStr: string) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) throw new Error("User not found.");

    const isValid = await verifyPassword(currentPasswordStr, user.passwordHash);
    if (!isValid) throw new Error("Incorrect password.");

    user.isDeleted = true;
    user.status = "DELETED";
    user.deletedAt = new Date();
    await user.save();

    await Session.updateMany({ userId: user._id }, { isValid: false });
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    return { success: true, message: "Account deleted successfully." };
  }

  static async exportUserData(userId: string) {
    const user = (await User.findById(userId).lean()) as any;
    if (!user) throw new Error("User not found.");

    const loginHistory = await LoginHistory.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    const sessions = await Session.find({ userId, isValid: true }).lean();
    const securityEvents = await SecurityEvent.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    const preferences = await UserPreference.findOne({ userId }).lean();

    return {
      exportTimestamp: new Date().toISOString(),
      userProfile: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        country: user.country,
        state: user.state,
        city: user.city,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        roles: user.roles,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      preferences,
      activeSessions: (sessions as any[]).map((s) => ({
        browser: s.browser,
        os: s.os,
        device: s.device,
        ipAddress: s.ipAddress,
        lastActiveAt: s.lastActiveAt,
      })),
      recentLoginHistory: (loginHistory as any[]).map((h) => ({
        status: h.status,
        browser: h.browser,
        os: h.os,
        ipAddress: h.ipAddress,
        time: h.createdAt,
      })),
      securityAuditTrail: (securityEvents as any[]).map((e) => ({
        eventType: e.eventType,
        description: e.description,
        ipAddress: e.ipAddress,
        time: e.createdAt,
      })),
    };
  }
}
