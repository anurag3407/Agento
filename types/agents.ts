/**
 * CareerPilot Agent API Types
 * ===========================
 * TypeScript types for the agent system.
 */

// ============================================
// Enums
// ============================================

export type WorkMode = "remote" | "hybrid" | "onsite" | "any";
export type CompanySize = "startup" | "mid" | "large" | "any";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type ApplicationStatus = "discovered" | "applied" | "screening" | "interviewing" | "offered" | "rejected" | "withdrawn";
export type AgentType = "scout" | "analyzer" | "writer" | "coach" | "reporter";
export type AgentEventStatus = "running" | "completed" | "failed";
export type InterviewMode = "oa" | "code" | "behavioral";

// ============================================
// User Profile
// ============================================

export interface Skill {
  name: string;
  level: SkillLevel;
  yearsExperience?: number;
}

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  skillsUsed: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
}

export interface JobPreferences {
  targetRoles: string[];
  workMode: WorkMode;
  locations: string[];
  salaryMin?: number;
  salaryMax?: number;
  companySize: CompanySize;
  industriesInclude: string[];
  industriesExclude: string[];
  visaSponsorshipNeeded: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  location?: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  careerGoal3yr?: string;
  preferences: JobPreferences;
  linkedinUrl?: string;
  githubUsername?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Job Listings
// ============================================

export interface JobScores {
  skills: number;
  culture: number;
  trajectory: number;
  composite: number;
}

export interface HiddenRequirement {
  requirement: string;
  confidence: number;
  reasoning: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  workMode?: WorkMode;
  source: string;
  sourceUrl: string;
  postedAt?: string;
  discoveredAt: string;
  rawDescription: string;
  extractedSkills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  scores?: JobScores;
  hiddenRequirements: HiddenRequirement[];
  aiReasoning?: string;
  isFresh: boolean;
  isDismissed: boolean;
}

// ============================================
// Applications
// ============================================

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  resumeVariantId?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt?: string;
  lastUpdated: string;
  rejectionReason?: string;
}

// ============================================
// Resumes
// ============================================

export interface ResumeContent {
  header: {
    name: string;
    title: string;
    email: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    primary: string[];
    secondary: string[];
  };
  experience: Array<{
    company: string;
    title: string;
    dates: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech: string[];
    link?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
}

export interface ResumeVariant {
  id: string;
  userId: string;
  variantTag: string;
  framingStrategy: string;
  content: ResumeContent;
  callbackCount: number;
  totalSent: number;
  callbackRate: number;
  createdAt: string;
}

// ============================================
// Interview
// ============================================

export interface InterviewSession {
  id: string;
  userId: string;
  jobId?: string;
  mode: InterviewMode;
  companyName?: string;
  scores: Record<string, number | string | boolean>;
  weaknessTags: string[];
  transcript: Array<{
    type: string;
    content: unknown;
    timestamp: string;
  }>;
  improvementNotes?: string;
  completedAt?: string;
}

export interface OAProblem {
  title: string;
  difficulty: string;
  category: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  hints: string[];
  optimalApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface BehavioralQuestion {
  question: string;
  whatItTests: string;
  goodAnswerElements: string[];
  redFlags: string[];
}

export interface BehavioralEvaluation {
  starScores: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  totalScore: number;
  letterGrade: string;
  communicationGrade: string;
  confidenceLevel: string;
  hedgingPhrasesFound: string[];
  strengths: string[];
  improvements: string[];
  rewrittenAnswer: string;
  feedback: string;
}

// ============================================
// Agent Events
// ============================================

export interface AgentEvent {
  id: string;
  agent: AgentType;
  message: string;
  status: AgentEventStatus;
  timestamp: string;
  metadata: Record<string, unknown>;
}

// ============================================
// API Requests/Responses
// ============================================

export interface RunAgentsRequest {
  userId: string;
  userProfile?: UserProfile;
}

export interface AgentStatusResponse {
  runId: string;
  status: "running" | "completed" | "failed";
  message: string;
  events: AgentEvent[];
  result?: {
    jobsFound: number;
    jobsScored: number;
    resumesGenerated: number;
    errors: string[];
  };
}

export interface InterviewPrepRequest {
  userId: string;
  jobId?: string;
  companyName?: string;
  mode: InterviewMode;
}

export interface InterviewPrepResponse {
  sessionId: string;
  status: string;
  mode: InterviewMode;
  company?: string;
  session?: InterviewSession;
}

export interface DailyDigest {
  date: string;
  stats: {
    jobsFound: number;
    highMatches: number;
    freshJobs: number;
    resumesReady: number;
  };
  topJobs: Array<{
    id: string;
    title: string;
    company: string;
    score: number;
  }>;
  insights: string[];
  dailyTip: string;
}
