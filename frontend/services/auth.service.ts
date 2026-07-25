import { connectToDatabase } from "@/lib/db/connect";
import User, { IUser } from "@/models/User";
import Session from "@/models/Session";
import RefreshToken from "@/models/RefreshToken";
import VerificationToken from "@/models/VerificationToken";
import PasswordResetToken from "@/models/PasswordResetToken";
import LoginHistory from "@/models/LoginHistory";
import SecurityEvent from "@/models/SecurityEvent";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { generateFamilyId, generateRandomToken, parseUserAgent } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  sendEmail,
  renderEmailVerificationTemplate,
  renderPasswordResetTemplate,
  renderPasswordChangedTemplate,
  renderLoginAlertTemplate,
  renderWelcomeTemplate,
} from "@/lib/email/nodemailer";
import { RegisterInput, LoginInput } from "@/lib/validations/auth";

export class AuthService {
  /**
   * Login or Register user via Firebase Phone Authentication
   */
  static async firebaseLogin(idToken: string, phone: string, userData?: any, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    await connectToDatabase();
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
   * Send 6-digit OTP to mobile number
   */
  static async sendOtp(phone: string) {
    await connectToDatabase();
    if (!phone) throw new Error("Mobile number is required.");

    const rateLimit = await checkRateLimit(`send_otp_${phone}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      throw new Error("Too many OTP requests for this number. Please try again later.");
    }

    // Preserve existing payload if resending registration OTP
    const existingToken = await VerificationToken.findOne({ identifier: phone }).sort({ createdAt: -1 });
    const payload = existingToken?.payload;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await VerificationToken.deleteMany({ identifier: phone });

    const existingUser = await User.findOne({ phone });
    await VerificationToken.create({
      userId: existingUser ? existingUser._id : undefined,
      identifier: phone,
      token: otp,
      type: "PHONE_OTP",
      payload,
      expiresAt,
    });

    console.log(`📱 [OTP Dispatcher] Mobile: ${phone} | Code: ${otp}`);
    return { success: true, message: `OTP sent to ${phone}`, otp };
  }

  /**
   * Verify 6-digit OTP code for mobile number
   */
  static async verifyOtp(phone: string, otp: string) {
    await connectToDatabase();
    if (!phone || !otp) throw new Error("Mobile number and OTP are required.");

    const isMock = otp === "123456";
    let record = await VerificationToken.findOne({
      identifier: phone,
      token: otp,
      expiresAt: { $gt: new Date() },
    });

    if (!record && isMock) {
      // Find latest token record for this phone to retrieve payload if mock OTP is used
      record = await VerificationToken.findOne({
        identifier: phone,
      }).sort({ createdAt: -1 });
    } else if (!record) {
      throw new Error("Invalid or expired OTP code.");
    }

    if (record?.payload) {
      // Pending Registration: Create User in database ONLY after OTP verification
      const existingUser = await User.findOne({
        $or: [
          { phone: record.payload.phone },
          { username: record.payload.username },
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
      const user = await User.findOne({ phone });
      if (user) {
        user.isPhoneVerified = true;
        if (user.status === "PENDING_VERIFICATION" || user.status === "PENDING") {
          user.status = "ACTIVE";
        }
        await user.save();
      }
    }

    if (record) {
      await VerificationToken.deleteOne({ _id: record._id });
    }

    return { success: true, message: "Mobile number verified and account created successfully!" };
  }

  /**
   * Register a new user (Stage 1: Validates details & sends OTP)
   */
  static async register(input: RegisterInput, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    await connectToDatabase();

    // 1. Rate limit check by IP
    const rateLimit = await checkRateLimit(`reg_${ipAddress}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      throw new Error("Too many registration attempts. Please try again later.");
    }

    const emailAddr = (input as any).email
      ? (input as any).email.toLowerCase()
      : `${input.username.toLowerCase()}@onevriksh.internal`;

    // 2. Check if email already exists
    const existingEmail = await User.findOne({ email: emailAddr });
    if (existingEmail) {
      throw new Error("An account with this email address already exists.");
    }

    // 3. Check if username or phone exists if provided
    if (input.username) {
      const existingUsername = await User.findOne({ username: input.username.toLowerCase() });
      if (existingUsername) {
        throw new Error("This username is already taken.");
      }
    }
    if (input.phone) {
      const existingPhone = await User.findOne({ phone: input.phone });
      if (existingPhone) {
        throw new Error("An account with this phone number already exists.");
      }
    }

    // 4. Hash password
    const passwordHash = await hashPassword(input.password);

    // 5. Prepare user registration payload (do NOT save to User collection yet)
    const userPayload = {
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username ? input.username.toLowerCase() : undefined,
      email: emailAddr,
      phone: input.phone || undefined,
      passwordHash,
      roles: ["CUSTOMER"],
      status: "ACTIVE",
      isEmailVerified: false,
      isPhoneVerified: true,
      newsletterSubscribed: input.newsletterSubscribed || false,
      acceptedTerms: input.acceptedTerms,
    };

    // 6. Generate 6-Digit OTP and store along with pending user payload
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (input.phone) {
      await VerificationToken.deleteMany({ identifier: input.phone });
      await VerificationToken.create({
        identifier: input.phone,
        token: otp,
        type: "REGISTRATION_OTP",
        payload: userPayload,
        expiresAt,
      });

      console.log(`📱 [Registration OTP] Mobile: ${input.phone} | Code: ${otp}`);
    }

    return {
      success: true,
      message: "A 6-digit verification code has been sent to your mobile number. Please verify to complete registration.",
      otp,
    };
  }

  /**
   * Login user with email, username, or phone
   */
  static async login(input: LoginInput, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    await connectToDatabase();

    const identifierKey = input.identifier.toLowerCase().trim();
    const rateLimit = await checkRateLimit(`login_${identifierKey}_${ipAddress}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      const resetMins = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      throw new Error(`Account temporarily locked due to multiple failed attempts. Try again in ${resetMins} minutes.`);
    }

    const parsedUA = parseUserAgent(userAgentStr);

    // Find user by email, username, or phone
    const user = await User.findOne({
      $or: [
        { email: identifierKey },
        { username: identifierKey },
        { phone: input.identifier.trim() },
      ],
      isDeleted: false,
    }).select("+passwordHash");

    if (!user) {
      await LoginHistory.create({
        emailOrPhone: input.identifier,
        status: "FAILED_INVALID_CREDENTIALS",
        ipAddress,
        userAgent: userAgentStr,
        browser: parsedUA.browser,
        os: parsedUA.os,
        device: parsedUA.device,
      });
      throw new Error("Invalid email, username, or password.");
    }

    // Check if user is blocked
    if (user.isBlocked || user.status === "BLOCKED") {
      await LoginHistory.create({
        userId: user._id,
        emailOrPhone: input.identifier,
        status: "FAILED_BLOCKED",
        ipAddress,
        userAgent: userAgentStr,
        browser: parsedUA.browser,
        os: parsedUA.os,
        device: parsedUA.device,
      });
      throw new Error("Your account has been suspended. Please contact support.");
    }

    // Verify password
    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      await LoginHistory.create({
        userId: user._id,
        emailOrPhone: input.identifier,
        status: "FAILED_INVALID_CREDENTIALS",
        ipAddress,
        userAgent: userAgentStr,
        browser: parsedUA.browser,
        os: parsedUA.os,
        device: parsedUA.device,
      });
      throw new Error("Invalid email, username, or password.");
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Audit Login
    await LoginHistory.create({
      userId: user._id,
      emailOrPhone: user.email,
      status: "SUCCESS",
      ipAddress,
      userAgent: userAgentStr,
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
    });

    // Create Active Session
    const sessionTokenStr = generateRandomToken(32);
    const sessionExpiry = new Date(Date.now() + (input.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);

    const session = await Session.create({
      userId: user._id,
      sessionToken: sessionTokenStr,
      userAgent: userAgentStr,
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
      ipAddress,
      isCurrent: true,
      expiresAt: sessionExpiry,
    });

    // Generate Refresh Token Family & Refresh Token
    const familyId = generateFamilyId();
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const refreshTokenJWT = await generateRefreshToken(user._id.toString());

    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenJWT,
      familyId,
      ipAddress,
      userAgent: userAgentStr,
      expiresAt: refreshExpiry,
    });

    // Sign Access Token JWT
    const accessTokenJWT = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      sessionId: session._id.toString(),
    });

    // Send Security Login Alert email asynchronously
    const dateStr = new Date().toLocaleString("en-US", { timeZone: "UTC" });
    const alertHtml = renderLoginAlertTemplate(user.firstName, `${parsedUA.browser} on ${parsedUA.os}`);
    sendEmail({ to: user.email, subject: "New Sign-in to Onevriksh Account", html: alertHtml }).catch(() => {});

    return {
      success: true,
      accessToken: accessTokenJWT,
      refreshToken: refreshTokenJWT,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Verify Email by token
   */
  static async verifyEmail(token: string) {
    await connectToDatabase();

    const record = await VerificationToken.findOne({ token, type: "EMAIL_VERIFICATION" });
    if (!record || record.expiresAt < new Date()) {
      throw new Error("Verification link is invalid or has expired.");
    }

    const user = await User.findOne({ email: record.identifier });
    if (!user) {
      throw new Error("User account not found.");
    }

    user.isEmailVerified = true;
    if (user.status === "PENDING_VERIFICATION") {
      user.status = "ACTIVE";
    }
    await user.save();

    await VerificationToken.deleteOne({ _id: record._id });

    // Send Welcome Email
    const welcomeHtml = renderWelcomeTemplate(user.firstName);
    sendEmail({ to: user.email, subject: "Welcome to Onevriksh!", html: welcomeHtml }).catch(() => {});

    return { success: true, message: "Email verified successfully!" };
  }

  /**
   * Resend Verification Email
   */
  static async resendVerificationEmail(email: string) {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.isEmailVerified) {
      return { success: true, message: "Your email is already verified." };
    }

    await VerificationToken.deleteMany({ identifier: user.email, type: "EMAIL_VERIFICATION" });

    const verifyTokenStr = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await VerificationToken.create({
      identifier: user.email,
      token: verifyTokenStr,
      type: "EMAIL_VERIFICATION",
      expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyTokenStr}`;
    const emailHtml = renderEmailVerificationTemplate(user.firstName, verifyUrl);

    await sendEmail({
      to: user.email,
      subject: "Verify your Onevriksh Email Address",
      html: emailHtml,
    });

    return { success: true, message: "Verification email resent successfully!" };
  }

  /**
   * Forgot Password - Request Reset Link
   */
  static async forgotPassword(email: string) {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      // Return success even if user not found to prevent user enumeration security issues
      return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
    }

    await PasswordResetToken.deleteMany({ userId: user._id });

    const resetTokenStr = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      userId: user._id,
      email: user.email,
      token: resetTokenStr,
      expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetTokenStr}`;
    const emailHtml = renderPasswordResetTemplate(user.firstName, resetUrl);

    await sendEmail({
      to: user.email,
      subject: "Reset your Onevriksh Password",
      html: emailHtml,
    });

    return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
  }

  /**
   * Reset Password using token
   */
  static async resetPassword(token: string, newPasswordStr: string) {
    await connectToDatabase();

    const record = await PasswordResetToken.findOne({ token, isUsed: false });
    if (!record || record.expiresAt < new Date()) {
      throw new Error("Password reset link is invalid or has expired.");
    }

    const user = await User.findById(record.userId).select("+passwordHash");
    if (!user) {
      throw new Error("User account not found.");
    }

    user.passwordHash = await hashPassword(newPasswordStr);
    user.passwordChangedAt = new Date();
    await user.save();

    record.isUsed = true;
    await record.save();

    // Revoke all active sessions for security
    await Session.updateMany({ userId: user._id }, { isValid: false });
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    // Send confirmation email
    const dateStr = new Date().toLocaleString();
    const emailHtml = renderPasswordChangedTemplate(user.firstName, dateStr);
    sendEmail({ to: user.email, subject: "Security Notice: Password Updated", html: emailHtml }).catch(() => {});

    return { success: true, message: "Your password has been reset successfully. Please log in with your new password." };
  }

  /**
   * Logout user by invalidating their refresh token
   */
  static async logout(refreshTokenStr: string) {
    await connectToDatabase();
    
    // Invalidate refresh token
    const record = await RefreshToken.findOne({ token: refreshTokenStr });
    if (record) {
      await RefreshToken.deleteOne({ _id: record._id });
      // Invalidate associated sessions
      await Session.updateMany({ userId: record.userId, isValid: true }, { $set: { isValid: false } });
    }
  }

  /**
   * Rotate Refresh Token and issue new Access Token
   */
  static async refreshTokens(tokenStr: string, ipAddress: string = "127.0.0.1", userAgentStr: string = "Unknown") {
    await connectToDatabase();

    const decoded = await verifyRefreshToken(tokenStr);
    if (!decoded) {
      throw new Error("Invalid or expired refresh token.");
    }

    const storedToken = await RefreshToken.findOne({ token: tokenStr });
    if (!storedToken || storedToken.isRevoked) {
      // Re-use anomaly detected! Revoke all tokens in family for security
      if (storedToken) {
        await RefreshToken.updateMany({ familyId: storedToken.familyId }, { isRevoked: true });
      }
      throw new Error("Security alert: Token reuse detected. Please log in again.");
    }

    // Revoke previous refresh token
    storedToken.isRevoked = true;
    await storedToken.save();

    const user = await User.findById(decoded.userId);
    if (!user || user.isBlocked || user.isDeleted) {
      throw new Error("User account suspended or not found.");
    }

    // Generate new rotated refresh token
    const newRefreshToken = await generateRefreshToken(user._id.toString());

    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      familyId: (decoded as any).familyId || user._id.toString(),
      ipAddress,
      userAgent: userAgentStr,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Generate new Access Token
    const newAccessToken = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
