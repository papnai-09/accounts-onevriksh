import type { UserProfile } from './user';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

export interface LoginResponse extends AuthResponse {
  requiresVerification?: boolean;
}

export interface RegisterResponse extends AuthResponse {
  message?: string;
}
