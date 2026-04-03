-- ============================================
-- CareerPilot — Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  title text,
  skills jsonb default '[]'::jsonb,
  career_goal text,
  preferences jsonb default '{}'::jsonb,
  education jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs (discovered/scored)
create table if not exists public.jobs (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  company text not null,
  location text,
  salary text,
  description text,
  url text,
  source text,
  posted_at timestamptz,
  is_fresh boolean default false,
  is_remote boolean default false,
  extracted_skills jsonb default '[]'::jsonb,
  scores jsonb,
  hidden_requirements jsonb default '[]'::jsonb,
  ai_reasoning text,
  discovered_at timestamptz default now()
);

-- Applications (pipeline tracking)
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id text references public.jobs(id) on delete cascade not null,
  status text default 'discovered' check (status in ('discovered','applied','screening','interviewing','offered','rejected','withdrawn')),
  resume_variant_id uuid,
  rejection_reason text,
  notes text,
  applied_at timestamptz,
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

-- Resume Variants
create table if not exists public.resume_variants (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id text references public.jobs(id) on delete set null,
  framing_strategy text,
  content text,
  cover_letter text,
  status text default 'draft' check (status in ('draft','ready','applied')),
  callback_count integer default 0,
  total_sent integer default 0,
  created_at timestamptz default now()
);

-- Interview Sessions
create table if not exists public.interview_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company text not null,
  role text,
  session_type text check (session_type in ('oa','code','behavioral')),
  questions jsonb default '[]'::jsonb,
  answers jsonb default '[]'::jsonb,
  scores jsonb,
  improvement_notes text,
  completed_at timestamptz default now()
);

-- Outcomes (Phase 5 evolution)
create table if not exists public.outcomes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade,
  job_title text,
  job_company text,
  job_scores jsonb,
  outcome text check (outcome in ('offer','rejected','ghosted','withdrawn')),
  rejection_reason text,
  reached_stage text,
  days_in_pipeline integer default 0,
  notes text,
  recorded_at timestamptz default now()
);

-- Briefings
create table if not exists public.briefings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date,
  summary text,
  top_matches jsonb default '[]'::jsonb,
  market_insights jsonb default '[]'::jsonb,
  action_items jsonb default '[]'::jsonb,
  encouragement text,
  generated_at timestamptz default now()
);

-- Agent Runs (history)
create table if not exists public.agent_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  jobs_found integer default 0,
  high_matches integer default 0,
  resumes_generated integer default 0,
  events jsonb default '[]'::jsonb,
  status text default 'running',
  error text,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.resume_variants enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.outcomes enable row level security;
alter table public.briefings enable row level security;
alter table public.agent_runs enable row level security;

-- Profiles: users can only access their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Jobs: users can only access their own
create policy "Users can view own jobs" on public.jobs for select using (auth.uid() = user_id);
create policy "Users can insert own jobs" on public.jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own jobs" on public.jobs for update using (auth.uid() = user_id);
create policy "Users can delete own jobs" on public.jobs for delete using (auth.uid() = user_id);

-- Applications: users can only access their own
create policy "Users can view own apps" on public.applications for select using (auth.uid() = user_id);
create policy "Users can insert own apps" on public.applications for insert with check (auth.uid() = user_id);
create policy "Users can update own apps" on public.applications for update using (auth.uid() = user_id);
create policy "Users can delete own apps" on public.applications for delete using (auth.uid() = user_id);

-- Resume Variants: users can only access their own
create policy "Users can view own resumes" on public.resume_variants for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resume_variants for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes" on public.resume_variants for update using (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resume_variants for delete using (auth.uid() = user_id);

-- Interview Sessions: users can only access their own
create policy "Users can view own sessions" on public.interview_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.interview_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.interview_sessions for update using (auth.uid() = user_id);

-- Outcomes: users can only access their own
create policy "Users can view own outcomes" on public.outcomes for select using (auth.uid() = user_id);
create policy "Users can insert own outcomes" on public.outcomes for insert with check (auth.uid() = user_id);
create policy "Users can update own outcomes" on public.outcomes for update using (auth.uid() = user_id);

-- Briefings: users can only access their own
create policy "Users can view own briefings" on public.briefings for select using (auth.uid() = user_id);
create policy "Users can insert own briefings" on public.briefings for insert with check (auth.uid() = user_id);

-- Agent Runs: users can only access their own
create policy "Users can view own runs" on public.agent_runs for select using (auth.uid() = user_id);
create policy "Users can insert own runs" on public.agent_runs for insert with check (auth.uid() = user_id);
create policy "Users can update own runs" on public.agent_runs for update using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_jobs_scores on public.jobs using gin(scores);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_resume_variants_user_id on public.resume_variants(user_id);
create index if not exists idx_interview_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_outcomes_user_id on public.outcomes(user_id);
create index if not exists idx_briefings_user_date on public.briefings(user_id, date);
