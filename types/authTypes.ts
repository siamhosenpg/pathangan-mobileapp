export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  username?: string;
  termsAccepted: boolean; // ✅ নতুন
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  profileImage?: string;
  email: string;
  badges?: string[];
  greenmarkVerified?: boolean;
  termsUpToDate?: boolean; // ✅ নতুন
}

export interface AuthResponse {
  token: string; // ← এটা add করো
  user: AuthUser;
  message: string;
}

export interface GetMeResponse {
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
