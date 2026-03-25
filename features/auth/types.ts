// Auth feature — session management types and helpers
// Stubs for future Supabase Auth integration

export interface AuthSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export type AuthProvider = "google" | "github" | "email";

/**
 * Check if user is authenticated.
 * Stub — replace with Supabase `getSession()` call.
 */
export function isAuthenticated(): boolean {
  return true; // mock: always authenticated
}
