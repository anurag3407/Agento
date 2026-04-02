"""
CareerPilot State Schemas
=========================
Defines all state types used by LangGraph agents.
These schemas define the contract between agents.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


# ============================================
# Enums
# ============================================

class WorkMode(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"
    ANY = "any"


class CompanySize(str, Enum):
    STARTUP = "startup"  # < 50
    MID = "mid"  # 50-500
    LARGE = "large"  # 500+
    ANY = "any"


class SkillLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class ApplicationStatus(str, Enum):
    DISCOVERED = "discovered"
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEWING = "interviewing"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class AgentType(str, Enum):
    SCOUT = "scout"
    ANALYZER = "analyzer"
    WRITER = "writer"
    COACH = "coach"
    REPORTER = "reporter"


class AgentEventStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================
# User Profile Models
# ============================================

class Skill(BaseModel):
    """A skill with proficiency level."""
    name: str
    level: SkillLevel
    years_experience: Optional[float] = None


class Experience(BaseModel):
    """Work experience entry."""
    company: str
    title: str
    start_date: str
    end_date: Optional[str] = None  # None = current
    description: str
    skills_used: list[str] = Field(default_factory=list)


class Education(BaseModel):
    """Education entry."""
    institution: str
    degree: str
    field_of_study: str
    graduation_year: int


class JobPreferences(BaseModel):
    """User's job search preferences."""
    target_roles: list[str] = Field(default_factory=list)
    work_mode: WorkMode = WorkMode.ANY
    locations: list[str] = Field(default_factory=list)
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    company_size: CompanySize = CompanySize.ANY
    industries_include: list[str] = Field(default_factory=list)
    industries_exclude: list[str] = Field(default_factory=list)
    visa_sponsorship_needed: bool = False


class UserProfile(BaseModel):
    """Complete user profile for job matching."""
    id: str
    email: str
    name: str
    location: Optional[str] = None
    
    # Resume data
    skills: list[Skill] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    
    # Goals and preferences
    career_goal_3yr: Optional[str] = None
    preferences: JobPreferences = Field(default_factory=JobPreferences)
    
    # External profiles
    linkedin_url: Optional[str] = None
    github_username: Optional[str] = None
    portfolio_url: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================
# Job Models
# ============================================

class JobScores(BaseModel):
    """Three-dimensional job scoring."""
    skills: int = Field(ge=0, le=100, description="Skills match score")
    culture: int = Field(ge=0, le=100, description="Culture fit score")
    trajectory: int = Field(ge=0, le=100, description="Career trajectory score")
    composite: int = Field(ge=0, le=100, description="Weighted composite score")


class HiddenRequirement(BaseModel):
    """An inferred requirement not explicitly stated."""
    requirement: str
    confidence: float = Field(ge=0, le=1)
    reasoning: str


class JobListing(BaseModel):
    """A discovered job listing with analysis."""
    id: str
    
    # Basic info
    title: str
    company: str
    location: str
    salary_range: Optional[str] = None
    work_mode: Optional[WorkMode] = None
    
    # Source info
    source: str  # e.g., "linkedin", "wellfound", "remotive"
    source_url: str
    posted_at: Optional[datetime] = None
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Raw data
    raw_description: str
    
    # Extracted data (from Analyzer)
    extracted_skills: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    
    # Scoring (from Analyzer)
    scores: Optional[JobScores] = None
    hidden_requirements: list[HiddenRequirement] = Field(default_factory=list)
    ai_reasoning: Optional[str] = None
    
    # Flags
    is_fresh: bool = False  # Posted < 24 hours
    is_dismissed: bool = False


# ============================================
# Application Models
# ============================================

class Application(BaseModel):
    """A job application with tracking."""
    id: str
    user_id: str
    job_id: str
    resume_variant_id: Optional[str] = None
    
    status: ApplicationStatus = ApplicationStatus.DISCOVERED
    
    # Generated materials
    cover_letter: Optional[str] = None
    
    # Tracking
    applied_at: Optional[datetime] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    # Feedback (for learning loop)
    rejection_reason: Optional[str] = None  # User-provided cause


# ============================================
# Resume Models
# ============================================

class ResumeVariant(BaseModel):
    """A generated resume variant for A/B testing."""
    id: str
    user_id: str
    
    # Strategy
    variant_tag: str  # e.g., "backend-heavy-v3"
    framing_strategy: str  # e.g., "Backend-Heavy", "Full-Stack", "Impact-First"
    
    # Content
    content: dict  # Structured resume data
    
    # Performance
    callback_count: int = 0
    total_sent: int = 0
    callback_rate: float = 0.0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================
# Interview Models
# ============================================

class InterviewMode(str, Enum):
    OA = "oa"  # Online Assessment
    CODE = "code"  # Live Coding
    BEHAVIORAL = "behavioral"


class InterviewSession(BaseModel):
    """An interview practice session."""
    id: str
    user_id: str
    job_id: Optional[str] = None
    
    mode: InterviewMode
    company_name: Optional[str] = None
    
    # Scores (A-F or 0-100)
    scores: dict = Field(default_factory=dict)
    
    # Tracking
    weakness_tags: list[str] = Field(default_factory=list)
    transcript: list[dict] = Field(default_factory=list)
    improvement_notes: Optional[str] = None
    
    completed_at: Optional[datetime] = None


# ============================================
# Agent Event Models
# ============================================

class AgentEvent(BaseModel):
    """Real-time agent activity event for dashboard."""
    id: str
    agent: AgentType
    message: str
    status: AgentEventStatus = AgentEventStatus.RUNNING
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = Field(default_factory=dict)


# ============================================
# LangGraph State
# ============================================

class AgentState(BaseModel):
    """
    Main state object passed between LangGraph agents.
    This is the shared context for the entire workflow.
    """
    # Current user context
    user_id: str
    user_profile: Optional[UserProfile] = None
    
    # Scout agent outputs
    discovered_jobs: list[JobListing] = Field(default_factory=list)
    
    # Analyzer agent outputs
    scored_jobs: list[JobListing] = Field(default_factory=list)
    
    # Writer agent outputs
    generated_resumes: list[ResumeVariant] = Field(default_factory=list)
    generated_cover_letters: dict[str, str] = Field(default_factory=dict)  # job_id -> cover letter
    
    # Coach agent outputs
    interview_sessions: list[InterviewSession] = Field(default_factory=list)
    
    # Reporter agent outputs
    daily_digest: Optional[dict] = None
    
    # Agent activity log
    events: list[AgentEvent] = Field(default_factory=list)
    
    # Error handling
    errors: list[str] = Field(default_factory=list)
    
    # Workflow control
    current_agent: Optional[AgentType] = None
    should_stop: bool = False
    
    def add_event(self, agent: AgentType, message: str, status: AgentEventStatus = AgentEventStatus.RUNNING) -> None:
        """Add an agent activity event."""
        import uuid
        event = AgentEvent(
            id=str(uuid.uuid4()),
            agent=agent,
            message=message,
            status=status,
        )
        self.events.append(event)
