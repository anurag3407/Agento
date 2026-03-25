// Database query stubs — replace with real Supabase queries

import type { DbSchema } from "./schema";

/**
 * Fetch all jobs for the current user.
 * Stub — replace with: supabase.from('jobs').select('*').eq('user_id', userId)
 */
export async function getJobs(_userId: string): Promise<DbSchema["jobs"][]> {
  return []; // TODO: implement with Supabase client
}

/**
 * Fetch all applications for the current user.
 * Stub — replace with real Supabase query.
 */
export async function getApplications(
  _userId: string
): Promise<DbSchema["applications"][]> {
  return [];
}

/**
 * Fetch all resume variants for the current user.
 */
export async function getResumeVariants(
  _userId: string
): Promise<DbSchema["resume_variants"][]> {
  return [];
}

/**
 * Fetch all interview sessions for the current user.
 */
export async function getInterviewSessions(
  _userId: string
): Promise<DbSchema["interview_sessions"][]> {
  return [];
}
