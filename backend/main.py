"""
CareerPilot Agent Backend
=========================
FastAPI service for the LangGraph agent orchestration system.
Provides REST API and SSE endpoints for the frontend.
"""

import os
import asyncio
from datetime import datetime
from typing import AsyncGenerator
from contextlib import asynccontextmanager
import uuid

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pydantic_settings import BaseSettings
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()


# ============================================
# Configuration
# ============================================

class Settings(BaseSettings):
    """Application settings loaded from environment."""
    
    google_api_key: str = ""
    supabase_url: str = ""
    supabase_service_key: str = ""
    
    # SMTP Email settings
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    email_from: str = "CareerPilot <noreply@careerpilot.app>"
    
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    port: int | None = None  # Heroku sets PORT env var
    debug: bool = False
    
    # CORS origins (comma-separated)
    cors_origins: str = "http://localhost:3000,https://careerpilot.app"
    
    # Agent configuration
    scout_interval_hours: int = 6
    daily_digest_hour: int = 8
    
    class Config:
        env_file = ".env"
    
    @property
    def effective_port(self) -> int:
        """Return PORT if set (Heroku), otherwise api_port."""
        return self.port if self.port else self.api_port


settings = Settings()


# ============================================
# Lifespan & App Initialization
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    logger.info("application_starting", debug=settings.debug)
    
    # Initialize Google Generative AI
    import google.generativeai as genai
    if settings.google_api_key:
        genai.configure(api_key=settings.google_api_key)
        logger.info("gemini_configured")
    else:
        logger.warning("gemini_api_key_not_set")
    
    yield
    
    logger.info("application_shutting_down")


app = FastAPI(
    title="CareerPilot Agent API",
    description="Backend API for the autonomous job finder agent system",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Request/Response Models
# ============================================

class UserProfile(BaseModel):
    """User profile for agent context."""
    id: str
    email: str
    name: str
    skills: list[dict] = []
    experience: list[dict] = []
    education: list[dict] = []
    career_goal_3yr: str | None = None
    preferences: dict = {}


class RunAgentsRequest(BaseModel):
    """Request to run the agent workflow."""
    user_id: str
    user_profile: UserProfile | None = None


class InterviewPrepRequest(BaseModel):
    """Request to start interview preparation."""
    user_id: str
    job_id: str | None = None
    company_name: str | None = None
    mode: str = "behavioral"  # oa, code, behavioral


class AgentStatusResponse(BaseModel):
    """Response with agent run status."""
    run_id: str
    status: str  # running, completed, failed
    message: str
    events: list[dict] = []


class JobListingResponse(BaseModel):
    """Job listing in API response format."""
    id: str
    title: str
    company: str
    location: str
    source: str
    source_url: str
    salary_range: str | None
    is_fresh: bool
    scores: dict | None
    ai_reasoning: str | None
    hidden_requirements: list[dict]


# ============================================
# In-Memory Storage (would use Redis/Supabase in production)
# ============================================

# Store for active agent runs
active_runs: dict[str, dict] = {}

# Event queues for SSE streaming
event_queues: dict[str, asyncio.Queue] = {}


# ============================================
# Background Task Runners
# ============================================

async def run_agent_workflow_task(
    run_id: str,
    user_id: str,
    user_profile: dict | None,
):
    """Background task to run the agent workflow."""
    from agents.orchestrator import run_agent_workflow
    from state.schemas import AgentState
    
    try:
        active_runs[run_id] = {
            "status": "running",
            "started_at": datetime.utcnow().isoformat(),
            "events": [],
        }
        
        # Create event queue for this run
        event_queues[run_id] = asyncio.Queue()
        
        logger.info("agent_workflow_starting", run_id=run_id, user_id=user_id)
        
        # Run the workflow
        final_state = await run_agent_workflow(
            user_id=user_id,
            user_profile=user_profile,
            thread_id=run_id,
        )
        
        # Update run status
        active_runs[run_id]["status"] = "completed"
        active_runs[run_id]["completed_at"] = datetime.utcnow().isoformat()
        active_runs[run_id]["result"] = {
            "jobs_found": len(final_state.discovered_jobs) if final_state else 0,
            "jobs_scored": len(final_state.scored_jobs) if final_state else 0,
            "resumes_generated": len(final_state.generated_resumes) if final_state else 0,
            "errors": final_state.errors if final_state else [],
        }
        active_runs[run_id]["events"] = [
            e.model_dump() for e in (final_state.events if final_state else [])
        ]
        
        # Notify completion
        await event_queues[run_id].put({"type": "completed", "data": active_runs[run_id]})
        
        logger.info("agent_workflow_completed", run_id=run_id)
        
    except Exception as e:
        logger.error("agent_workflow_failed", run_id=run_id, error=str(e))
        active_runs[run_id]["status"] = "failed"
        active_runs[run_id]["error"] = str(e)
        
        if run_id in event_queues:
            await event_queues[run_id].put({"type": "failed", "error": str(e)})


# ============================================
# API Endpoints
# ============================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "CareerPilot Agent API",
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.google_api_key),
        "supabase_configured": bool(settings.supabase_url),
        "active_runs": len(active_runs),
    }


# ============================================
# Agent Workflow Endpoints
# ============================================

@app.post("/api/agents/run", response_model=AgentStatusResponse)
async def run_agents(
    request: RunAgentsRequest,
    background_tasks: BackgroundTasks,
):
    """
    Trigger the main agent workflow.
    Runs Scout → Analyzer → Writer → Reporter.
    Returns immediately with a run_id for status tracking.
    """
    run_id = str(uuid.uuid4())
    
    # Convert profile to dict if provided
    profile_dict = request.user_profile.model_dump() if request.user_profile else None
    
    # Start background task
    background_tasks.add_task(
        run_agent_workflow_task,
        run_id,
        request.user_id,
        profile_dict,
    )
    
    return AgentStatusResponse(
        run_id=run_id,
        status="running",
        message="Agent workflow started",
        events=[],
    )


@app.get("/api/agents/status/{run_id}", response_model=AgentStatusResponse)
async def get_agent_status(run_id: str):
    """Get the status of an agent run."""
    if run_id not in active_runs:
        raise HTTPException(status_code=404, detail="Run not found")
    
    run = active_runs[run_id]
    
    return AgentStatusResponse(
        run_id=run_id,
        status=run.get("status", "unknown"),
        message=f"Agent run {run.get('status', 'unknown')}",
        events=run.get("events", []),
    )


@app.get("/api/agents/events/{run_id}")
async def stream_agent_events(run_id: str):
    """
    SSE endpoint to stream agent events in real-time.
    Use this for live dashboard updates.
    """
    if run_id not in event_queues:
        event_queues[run_id] = asyncio.Queue()
    
    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            while True:
                # Wait for events with timeout
                try:
                    event = await asyncio.wait_for(
                        event_queues[run_id].get(),
                        timeout=30.0
                    )
                    
                    import json
                    yield f"data: {json.dumps(event)}\n\n"
                    
                    # Stop if completed or failed
                    if event.get("type") in ["completed", "failed"]:
                        break
                        
                except asyncio.TimeoutError:
                    # Send keepalive
                    yield f"data: {{'type': 'keepalive'}}\n\n"
                    
        except asyncio.CancelledError:
            logger.info("sse_connection_closed", run_id=run_id)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


# ============================================
# Interview Prep Endpoints
# ============================================

@app.post("/api/interview/start")
async def start_interview_prep(
    request: InterviewPrepRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start an interview preparation session.
    Triggers the Coach agent.
    """
    from agents.orchestrator import run_interview_prep
    
    session_id = str(uuid.uuid4())
    
    try:
        # Run interview prep
        final_state = await run_interview_prep(
            user_id=request.user_id,
            job_id=request.job_id,
            company_name=request.company_name,
            mode=request.mode,
            thread_id=session_id,
        )
        
        # Extract session results
        session = final_state.interview_sessions[-1] if final_state and final_state.interview_sessions else None
        
        return {
            "session_id": session_id,
            "status": "completed",
            "mode": request.mode,
            "company": request.company_name,
            "session": session.model_dump() if session else None,
        }
        
    except Exception as e:
        logger.error("interview_prep_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/interview/{session_id}/evaluate")
async def evaluate_interview_answer(
    session_id: str,
    question: str,
    answer: str,
):
    """
    Evaluate a behavioral interview answer.
    Returns STAR analysis and improvement suggestions.
    """
    from agents.coach import evaluate_behavioral_answer
    
    try:
        evaluation = await evaluate_behavioral_answer(question, answer)
        return {
            "session_id": session_id,
            "evaluation": evaluation,
        }
    except Exception as e:
        logger.error("evaluation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Job Discovery Endpoints
# ============================================

@app.post("/api/jobs/quick-scan")
async def quick_scan_job(url: str, user_id: str):
    """
    Quick scan a single job URL.
    Extracts and analyzes the job without running full workflow.
    """
    # Placeholder - would implement URL scraping and analysis
    return {
        "status": "coming_soon",
        "message": "Quick scan feature is under development",
    }


# ============================================
# Run Server
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.effective_port,
        reload=settings.debug,
    )
