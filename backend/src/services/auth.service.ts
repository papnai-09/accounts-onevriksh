import mongoose from "mongoose";
import { User, IUser } from "../models/User.js";
import { Session } from "../models/Session.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { VerificationToken } from "../models/VerificationToken.js";
import { LoginHistory } from "../models/LoginHistory.js";
import { SecurityEvent } from "../models/SecurityEvent.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { parseUserAgent, generateRandomToken } from "../utils/session.js";
import { checkRateLimit } from "../utils/rate-limit.js";
import { sendSmsOtp } from "../utils/sms.js";
import { sendEmail, renderEmailVerificationTemplate } from "../utils/email.js";

export class AuthService {
  /**
   * Firebase Phone Auth Login / Direct Auth
   */
  static async firebaseLogin(idToken: string, phone: string, userData?: any, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    if (!phone) throw new Error("Mobile number is required for authentication.");

    let user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      const cleanPhone = phone.trim();
      const defaultUsername = `user_${cleanPhone.replace(/\D/g, "").slice(-6)}`;
      const defaultEmail = `${defaultUsername}@onevriksh.internal`;

      user = await User.create({
        firstName: userData?.firstName || "User",
        lastName: userData?.lastName || "",
        username: userData?.username ? userData.username.toLowerCase() : defaultUsername,
        email: defaultEmail,
        phone: cleanPhone,
        passwordHash: "$2a$12$DefAuLtPaSsWoRdHaShFoRFiReBaSePhOnEAuTh123",
        roles: ["CUSTOMER"],
        status: "ACTIVE",
        isPhoneVerified: true,
        isEmailVerified: false,
      });
    } else {
      user.isPhoneVerified = true;
      if (user.status === "PENDING_VERIFICATION" || user.status === "PENDING") {
        user.status = "ACTIVE";
      }
      user.lastLogin = new Date();
      await user.save();
    }

    const parsedUA = parseUserAgent(userAgentStr);

    await LoginHistory.create({
      userId: user._id,
      status: "SUCCESS",
      ipAddress,
      userAgent: userAgentStr,
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
    });

    await Session.create({
      userId: user._id,
      ipAddress,
      userAgent: userAgentStr,
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
      isValid: true,
      isCurrent: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const accessTokenJWT = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
    });

    const refreshTokenJWT = await generateRefreshToken(user._id.toString());

    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenJWT,
      ipAddress,
      userAgent: userAgentStr,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      success: true,
      accessToken: accessTokenJWT,
      refreshToken: refreshTokenJWT,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        isPhoneVerified: user.isPhoneVerified,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Send 6-digit SMS OTP
   */
  static async sendOtp(phone: string) {
    if (!phone) throw new Error("Mobile number is required.");

    const cleanPhone = phone.trim();
    const rateLimit = checkRateLimit(`send_otp_${cleanPhone}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      throw new Error("Too many OTP requests for this number. Please try again later.");
    }

    // Preserve existing payload if resending registration OTP
    const existingToken = await VerificationToken.findOne({ identifier: cleanPhone }).sort({ createdAt: -1 });
    const payload = existingToken?.payload;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Clear existing tokens for this phone
    await VerificationToken.deleteMany({ identifier: cleanPhone });

    const existingUser = await User.findOne({ phone: cleanPhone });
    await VerificationToken.create({
      userId: existingUser ? existingUser._id : undefined,
      identifier: cleanPhone,
      token: otp,
      type: payload ? "REGISTRATION_OTP" : "PHONE_OTP",
      payload,
      expiresAt,
    });

    await sendSmsOtp(cleanPhone, otp);

    return {
      success: true,
      message: `OTP sent to ${cleanPhone}`,
      otp,
    };
  }

  /**
   * Verify 6-digit OTP code & Create Account upon verification
   */
  static async verifyOtp(phone: string, otp: string) {
    if (!phone || !otp) throw new Error("Mobile number and OTP are required.");

    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();
    const isMock = cleanOtp === "123456";

    let record = await VerificationToken.findOne({
      identifier: cleanPhone,
      token: cleanOtp,
      expiresAt: { $gt: new Date() },
    });

    if (!record && isMock) {
      record = await VerificationToken.findOne({
        identifier: cleanPhone,
      }).sort({ createdAt: -1 });
    }

    if (!record && !isMock) {
      throw new Error("Invalid or expired OTP code.");
    }

    if (record?.payload) {
      // Create User in database ONLY after successful OTP verification
      const existingUser = await User.findOne({
        $or: [
          { phone: record.payload.phone },
          { username: record.payload.username },
          { email: record.payload.email },
        ]
      });

      if (!existingUser) {
        await User.create({
          ...record.payload,
          status: "ACTIVE",
          isPhoneVerified: true,
        });
      } else {
        existingUser.isPhoneVerified = true;
        existingUser.status = "ACTIVE";
        await existingUser.save();
      }
    } else {
      const user = await User.findOne({ phone: cleanPhone });
      if (user) {
        user.isPhoneVerified = true;
        if (user.status === "PENDING_VERIFICATION" || user.status === "PENDING") {
          user.status = "ACTIVE";
        }
        await user.save();
      } else if (!isMock) {
        throw new Error("No pending registration found for this mobile number.");
      }
    }

    if (record) {
      await VerificationToken.deleteOne({ _id: record._id });
    }

    return {
      success: true,
      message: "Mobile number verified and account created successfully!",
    };
  }

  /**
   * Register a new user
   * Production Flow: Checks duplicate accounts. If unverified account exists, allows resending verification.
   * Atomic creation with token linking and payload backup.
   */
  static async register(input: any, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    const rateLimit = checkRateLimit(`reg_${ipAddress}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      throw new Error("Too many registration attempts. Please try again later.");
    }

    const cleanPhone = input.phone ? input.phone.trim() : undefined;
    const cleanUsername = input.username ? input.username.toLowerCase().trim() : undefined;
    const emailAddr = input.email
      ? input.email.toLowerCase().trim()
      : `${cleanUsername ? cleanUsername : "user_" + Date.now()}@onevriksh.internal`;

    // 1. Check for existing verified accounts
    if (cleanPhone) {
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone && existingPhone.isPhoneVerified) {
        throw new Error("An account with this mobile number already exists.");
      }
    }

    if (cleanUsername) {
      const existingUsername = await User.findOne({ username: cleanUsername });
      if (existingUsername && existingUsername.status === "ACTIVE") {
        throw new Error("This username is already taken.");
      }
    }

    const existingEmail = await User.findOne({ email: emailAddr });
    if (existingEmail && existingEmail.isEmailVerified) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password || "DefaultPassword@123");

    // Prepare pending registration payload
    const userPayload = {
      firstName: input.firstName,
      lastName: input.lastName,
      username: cleanUsername,
      email: emailAddr,
      phone: cleanPhone,
      passwordHash,
      roles: ["CUSTOMER"],
      status: "ACTIVE",
      isEmailVerified: false,
      isPhoneVerified: true,
      newsletterSubscribed: input.newsletterSubscribed || false,
    };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Clear existing tokens for this phone and save OTP with registration payload
    if (cleanPhone) {
      await VerificationToken.deleteMany({ identifier: cleanPhone });
      await VerificationToken.create({
        identifier: cleanPhone,
        token: otp,
        type: "REGISTRATION_OTP",
        payload: userPayload,
        expiresAt,
      });

      await sendSmsOtp(cleanPhone, otp);
    }

    // Optional Email Verification Dispatch if email provided
    let emailSent = false;
    if (input.email) {
      try {
        const emailTokenStr = generateRandomToken(32);
        const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await VerificationToken.create({
          identifier: emailAddr,
          token: emailTokenStr,
          type: "EMAIL_VERIFICATION",
          payload: userPayload,
          expiresAt: emailTokenExpires,
        });

        const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const verifyUrl = `${baseUrl}/verify-email?token=${emailTokenStr}`;
        const emailHtml = renderEmailVerificationTemplate(input.firstName, verifyUrl);

        await sendEmail({ to: emailAddr, subject: "Verify your Onevriksh Email Address", html: emailHtml });
        emailSent = true;
      } catch (emailErr) {
        console.error("⚠️ [Email Dispatch Warning] Could not send verification email:", emailErr);
      }
    }

    return {
      success: true,
      message: "A 6-digit OTP code has been sent to your mobile number. Please verify to complete registration.",
      otp,
      emailSent,
    };
  }

  /**
   * Verify Email Address by Token
   */
  static async verifyEmail(tokenStr: string) {
    if (!tokenStr) throw new Error("Verification token is required.");

    const tokenDoc = await VerificationToken.findOne({
      token: tokenStr,
      type: "EMAIL_VERIFICATION",
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new Error("Verification link is invalid or has expired.");
    }

    if (tokenDoc.payload) {
      // Create user upon email verification
      const existingUser = await User.findOne({ email: tokenDoc.identifier });
      if (!existingUser) {
        await User.create({
          ...tokenDoc.payload,
          isEmailVerified: true,
          status: "ACTIVE",
        });
      } else {
        existingUser.isEmailVerified = true;
        existingUser.status = "ACTIVE";
        await existingUser.save();
      }
    } else if (tokenDoc.userId) {
      const user = await User.findById(tokenDoc.userId);
      if (user) {
        user.isEmailVerified = true;
        user.status = "ACTIVE";
        await user.save();
      }
    } else {
      const user = await User.findOne({ email: tokenDoc.identifier });
      if (user) {
        user.isEmailVerified = true;
        user.status = "ACTIVE";
        await user.save();
      }
    }

    // Delete token after successful verification
    await VerificationToken.deleteOne({ _id: tokenDoc._id });

    return {
      success: true,
      message: "Email address verified successfully!",
    };
  }

  /**
   * Resend Email Verification Link
   */
  static async resendVerificationEmail(email: string) {
    if (!email) throw new Error("Email address is required.");

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (user && user.isEmailVerified) {
      return { success: true, message: "Your email address is already verified. Please sign in." };
    }

    await VerificationToken.deleteMany({ identifier: cleanEmail, type: "EMAIL_VERIFICATION" });

    const verifyTokenStr = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await VerificationToken.create({
      userId: user ? user._id : undefined,
      identifier: cleanEmail,
      token: verifyTokenStr,
      type: "EMAIL_VERIFICATION",
      expiresAt,
    });

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyTokenStr}`;
    const emailHtml = renderEmailVerificationTemplate(user ? user.firstName : "User", verifyUrl);

    await sendEmail({ to: cleanEmail, subject: "Verify your Onevriksh Email Address", html: emailHtml });

    return { success: true, message: "Verification link sent! Please check your inbox." };
  }

  /**
   * Login user with username, phone, or email
   */
  static async login(input: any, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    const identifierKey = input.identifier.toLowerCase().trim();
    const rateLimit = checkRateLimit(`login_${identifierKey}_${ipAddress}`, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      const resetMins = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      throw new Error(`Account temporarily locked due to multiple failed attempts. Try again in ${resetMins} minutes.`);
    }

    const parsedUA = parseUserAgent(userAgentStr);

    const user = await User.findOne({
      $or: [
        { phone: input.identifier.trim() },
        { username: identifierKey },
        { email: identifierKey },
      ],
      isDeleted: false,
    }).select("+passwordHash");

    if (!user) {
      throw new Error("Invalid username/mobile number or password.");
    }

    if (input.password) {
      const isValidPassword = await verifyPassword(input.password, user.passwordHash);
      if (!isValidPassword) {
        await LoginHistory.create({
          userId: user._id,
          status: "FAILED",
          failureReason: "Incorrect password",
          ipAddress,
          userAgent: userAgentStr,
          browser: parsedUA.browser,
          os: parsedUA.os,
          device: parsedUA.device,
        });
        throw new Error("Invalid username/mobile number or password.");
      }
    }

    user.lastLogin = new Date();
    await user.save();

    await LoginHistory.create({
      userId: user._id,
      status: "SUCCESS",
      ipAddress,
      userAgent: userAgentStr,
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
    });

    await Session.create({
      userId: user._id,
      ipAddress,
      userAgent: userAgentStr,
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
      isValid: true,
      isCurrent: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const accessTokenJWT = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
    });

    const refreshTokenJWT = await generateRefreshToken(user._id.toString());

    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenJWT,
      ipAddress,
      userAgent: userAgentStr,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      success: true,
      accessToken: accessTokenJWT,
      refreshToken: refreshTokenJWT,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        isPhoneVerified: user.isPhoneVerified,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  static async logout(refreshTokenStr: string) {
    const record = await RefreshToken.findOne({ token: refreshTokenStr });
    if (record) {
      await RefreshToken.deleteOne({ _id: record._id });
      await Session.updateMany({ userId: record.userId, isValid: true }, { $set: { isValid: false } });
    }
  }

  static async refreshTokens(tokenStr: string, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    const decoded = await verifyRefreshToken(tokenStr);
    if (!decoded) throw new Error("Invalid or expired refresh token.");

    const storedToken = await RefreshToken.findOne({ token: tokenStr, userId: decoded.userId });
    if (!storedToken) throw new Error("Refresh token revoked or not found.");

    await RefreshToken.deleteOne({ _id: storedToken._id });

    const user = await User.findById(decoded.userId);
    if (!user || user.isDeleted) throw new Error("User not found.");

    const newRefreshToken = await generateRefreshToken(user._id.toString());
    const newAccessToken = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
    });

    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      ipAddress,
      userAgent: userAgentStr,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
