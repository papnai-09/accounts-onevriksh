export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  timezone?: string;
  language?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionInfo {
  _id: string;
  userAgent: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  browser?: string;
  os?: string;
  device?: string;
}

export interface LoginHistoryEntry {
  _id: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  createdAt: string;
}
