// Database feature — Supabase schema types and query stubs
// Replace with real Supabase client when ready

/** Database table types matching Supabase schema */
export interface DbSchema {
  users: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  jobs: {
    id: string;
    title: string;
    company: string;
    raw_data: Record<string, unknown>;
    scores: Record<string, number>;
    discovered_at: string;
    user_id: string;
  };
  applications: {
    id: string;
    job_id: string;
    user_id: string;
    status: string;
    resume_variant_id: string;
    applied_at: string;
  };
  resume_variants: {
    id: string;
    user_id: string;
    variant_tag: string;
    content: Record<string, unknown>;
    callback_count: number;
    total_sent: number;
    created_at: string;
  };
  interview_sessions: {
    id: string;
    user_id: string;
    session_type: string;
    scores: Record<string, number>;
    completed_at: string;
  };
}
