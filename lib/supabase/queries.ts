/**
 * Supabase Queries
 * ================
 * Real CRUD operations for all CareerPilot tables.
 * Each function takes a SupabaseClient so it works server-side and client-side.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================
// Profiles
// ============================================

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) console.error("getProfile error:", error.message);
  return data;
}

export async function upsertProfile(supabase: SupabaseClient, userId: string, profile: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) console.error("upsertProfile error:", error.message);
  return data;
}

// ============================================
// Jobs
// ============================================

export async function getJobs(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("discovered_at", { ascending: false });
  if (error) console.error("getJobs error:", error.message);
  return data || [];
}

export async function upsertJobs(supabase: SupabaseClient, userId: string, jobs: Record<string, unknown>[]) {
  const rows = jobs.map((job) => ({
    ...job,
    user_id: userId,
  }));
  const { data, error } = await supabase
    .from("jobs")
    .upsert(rows, { onConflict: "id" })
    .select();
  if (error) console.error("upsertJobs error:", error.message);
  return data || [];
}

// ============================================
// Applications
// ============================================

export async function getApplications(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, jobs(*)")
    .eq("user_id", userId)
    .order("last_updated", { ascending: false });
  if (error) console.error("getApplications error:", error.message);
  return data || [];
}

export async function createApplication(supabase: SupabaseClient, userId: string, app: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("applications")
    .insert({ ...app, user_id: userId })
    .select()
    .single();
  if (error) console.error("createApplication error:", error.message);
  return data;
}

export async function updateApplicationStatus(
  supabase: SupabaseClient,
  appId: string,
  status: string,
  extra?: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("applications")
    .update({ status, last_updated: new Date().toISOString(), ...extra })
    .eq("id", appId)
    .select()
    .single();
  if (error) console.error("updateApplicationStatus error:", error.message);
  return data;
}

// ============================================
// Resume Variants
// ============================================

export async function getResumes(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("resume_variants")
    .select("*, jobs(title, company)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) console.error("getResumes error:", error.message);
  return data || [];
}

export async function upsertResume(supabase: SupabaseClient, userId: string, resume: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("resume_variants")
    .upsert({ ...resume, user_id: userId })
    .select()
    .single();
  if (error) console.error("upsertResume error:", error.message);
  return data;
}

// ============================================
// Interview Sessions
// ============================================

export async function getInterviewSessions(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });
  if (error) console.error("getInterviewSessions error:", error.message);
  return data || [];
}

export async function upsertInterviewSession(supabase: SupabaseClient, userId: string, session: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("interview_sessions")
    .upsert({ ...session, user_id: userId })
    .select()
    .single();
  if (error) console.error("upsertInterviewSession error:", error.message);
  return data;
}

// ============================================
// Outcomes (Evolution)
// ============================================

export async function getOutcomes(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("outcomes")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false });
  if (error) console.error("getOutcomes error:", error.message);
  return data || [];
}

export async function upsertOutcome(supabase: SupabaseClient, userId: string, outcome: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("outcomes")
    .insert({ ...outcome, user_id: userId })
    .select()
    .single();
  if (error) console.error("upsertOutcome error:", error.message);
  return data;
}

// ============================================
// Briefings
// ============================================

export async function getLatestBriefing(supabase: SupabaseClient, userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("briefings")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) console.error("getLatestBriefing error:", error.message);
  return data;
}

export async function upsertBriefing(supabase: SupabaseClient, userId: string, briefing: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("briefings")
    .insert({ ...briefing, user_id: userId, date: new Date().toISOString().split("T")[0] })
    .select()
    .single();
  if (error) console.error("upsertBriefing error:", error.message);
  return data;
}

// ============================================
// Agent Runs
// ============================================

export async function createAgentRun(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("agent_runs")
    .insert({ user_id: userId, status: "running" })
    .select()
    .single();
  if (error) console.error("createAgentRun error:", error.message);
  return data;
}

export async function completeAgentRun(supabase: SupabaseClient, runId: string, result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("agent_runs")
    .update({ ...result, status: "completed", completed_at: new Date().toISOString() })
    .eq("id", runId)
    .select()
    .single();
  if (error) console.error("completeAgentRun error:", error.message);
  return data;
}
