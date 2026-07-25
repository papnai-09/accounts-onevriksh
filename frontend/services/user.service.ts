import { connectToDatabase } from "@/lib/db/connect";
import User, { IUser } from "@/models/User";
import Session from "@/models/Session";
import RefreshToken from "@/models/RefreshToken";
import LoginHistory from "@/models/LoginHistory";
import SecurityEvent from "@/models/SecurityEvent";
import UserPreference from "@/models/UserPreference";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { UpdateProfileInput, ChangePasswordInput } from "@/lib/validations/auth";
import { sendEmail, renderAccountDeletedTemplate, renderPasswordChangedTemplate } from "@/lib/email/nodemailer";

export class UserService {
  /**
   * Get User by ID
   */
  static async getUserById(userId: string) {
    await connectToDatabase();
    const user = (await User.findById(userId).lean()) as any;
    if (!user || user.isDeleted) return null;
    return user;
  }

  /**
   * Update Profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    await connectToDatabase();
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

  /**
   * Change Password from settings
   */
  static async changePassword(userId: string, input: ChangePasswordInput, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    await connectToDatabase();
    const user = await User.findById(userId).select("+passwordHash");
    if (!user || user.isDeleted) throw new Error("User not found.");

    const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!isValid) throw new Error("Current password is incorrect.");

    user.passwordHash = await hashPassword(input.newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    await SecurityEvent.create({
      userId: user._id,
      eventType: "PASSWORD_CHANGE",
      description: "Password changed from account settings",
      ipAddress,
      userAgent: userAgentStr,
      severity: "INFO",
    });

    const emailHtml = renderPasswordChangedTemplate(user.firstName, new Date().toLocaleString());
    sendEmail({ to: user.email, subject: "Security Notice: Password Updated", html: emailHtml }).catch(() => {});

    return { success: true, message: "Password updated successfully!" };
  }

  /**
   * Update Email Address
   */
  static async updateEmail(userId: string, newEmailStr: string, currentPasswordStr: string, ipAddress: string = "127.0.0.1") {
    await connectToDatabase();
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) throw new Error("User not found.");

    const isValid = await verifyPassword(currentPasswordStr, user.passwordHash);
    if (!isValid) throw new Error("Incorrect current password.");

    const existing = await User.findOne({ email: newEmailStr.toLowerCase() });
    if (existing && existing._id.toString() !== userId) {
      throw new Error("This email is already in use by another account.");
    }

    user.email = newEmailStr.toLowerCase();
    user.isEmailVerified = false;
    await user.save();

    await SecurityEvent.create({
      userId: user._id,
      eventType: "EMAIL_CHANGE",
      description: `Email updated to ${newEmailStr}`,
      ipAddress,
      userAgent: "Web Dashboard",
    });

    return { success: true, message: "Email updated successfully. Please verify your new email." };
  }

  /**
   * Update Mobile Number
   */
  static async updatePhone(userId: string, newPhoneStr: string, currentPasswordStr: string) {
    await connectToDatabase();
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) throw new Error("User not found.");

    const isValid = await verifyPassword(currentPasswordStr, user.passwordHash);
    if (!isValid) throw new Error("Incorrect current password.");

    user.phone = newPhoneStr;
    user.isPhoneVerified = false;
    await user.save();

    return { success: true, message: "Phone number updated successfully!" };
  }

  /**
   * Deactivate Account
   */
  static async deactivateAccount(userId: string, currentPasswordStr: string) {
    await connectToDatabase();
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) throw new Error("User not found.");

    const isValid = await verifyPassword(currentPasswordStr, user.passwordHash);
    if (!isValid) throw new Error("Incorrect password.");

    user.status = "INACTIVE";
    await user.save();

    // Revoke all sessions
    await Session.updateMany({ userId: user._id }, { isValid: false });
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    return { success: true, message: "Your account has been deactivated." };
  }

  /**
   * Delete Account
   */
  static async deleteAccount(userId: string, currentPasswordStr: string) {
    await connectToDatabase();
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

    const emailHtml = renderAccountDeletedTemplate(user.firstName);
    sendEmail({ to: user.email, subject: "Your Onevriksh Account has been Closed", html: emailHtml }).catch(() => {});

    return { success: true, message: "Account deleted successfully." };
  }

  /**
   * Download / Export Account Data in JSON format
   */
  static async exportUserData(userId: string) {
    await connectToDatabase();
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
      activeSessions: sessions.map((s) => ({
        browser: s.browser,
        os: s.os,
        device: s.device,
        ipAddress: s.ipAddress,
        lastActiveAt: s.lastActiveAt,
      })),
      recentLoginHistory: loginHistory.map((h) => ({
        status: h.status,
        browser: h.browser,
        os: h.os,
        ipAddress: h.ipAddress,
        time: h.createdAt,
      })),
      securityAuditTrail: securityEvents.map((e) => ({
        eventType: e.eventType,
        description: e.description,
        ipAddress: e.ipAddress,
        time: e.createdAt,
      })),
    };
  }
}
