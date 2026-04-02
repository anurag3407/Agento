"""
Reporter Agent
==============
Compiles daily intelligence briefings and sends email digests.
Summarizes agent activity and provides actionable insights.
"""

import os
from datetime import datetime, timedelta
from typing import Any
import structlog
import google.generativeai as genai

from state.schemas import (
    AgentState,
    AgentType,
    AgentEventStatus,
    JobListing,
    ResumeVariant,
)

logger = structlog.get_logger()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))


# ============================================
# Email Templates
# ============================================

DAILY_DIGEST_HTML = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }}
        .header h1 {{ margin: 0 0 8px 0; font-size: 24px; }}
        .header p {{ margin: 0; opacity: 0.9; }}
        .card {{ background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 16px; }}
        .card h2 {{ margin: 0 0 12px 0; font-size: 16px; color: #667eea; }}
        .job-item {{ background: white; border-radius: 6px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #667eea; }}
        .job-title {{ font-weight: 600; color: #333; margin: 0; }}
        .job-company {{ color: #666; font-size: 14px; }}
        .job-score {{ display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }}
        .stat-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }}
        .stat {{ text-align: center; background: white; padding: 16px; border-radius: 6px; }}
        .stat-value {{ font-size: 28px; font-weight: 700; color: #667eea; }}
        .stat-label {{ font-size: 12px; color: #666; text-transform: uppercase; }}
        .tip {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; }}
        .cta {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }}
        .footer {{ text-align: center; color: #999; font-size: 12px; margin-top: 32px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Your Daily CareerPilot Briefing</h1>
        <p>{date}</p>
    </div>
    
    <div class="card">
        <h2>📊 Today's Numbers</h2>
        <div class="stat-grid">
            <div class="stat">
                <div class="stat-value">{jobs_found}</div>
                <div class="stat-label">Jobs Found</div>
            </div>
            <div class="stat">
                <div class="stat-value">{high_matches}</div>
                <div class="stat-label">High Matches</div>
            </div>
            <div class="stat">
                <div class="stat-value">{fresh_jobs}</div>
                <div class="stat-label">Fresh (< 24h)</div>
            </div>
            <div class="stat">
                <div class="stat-value">{resumes_ready}</div>
                <div class="stat-label">Resumes Ready</div>
            </div>
        </div>
    </div>
    
    <div class="card">
        <h2>🏆 Top Matches</h2>
        {top_jobs_html}
    </div>
    
    {whats_working_html}
    
    <div class="tip">
        <strong>💡 Today's Tip:</strong> {daily_tip}
    </div>
    
    <center>
        <a href="{dashboard_url}" class="cta">View Full Dashboard →</a>
    </center>
    
    <div class="footer">
        <p>CareerPilot — Your AI Job Hunting Team</p>
        <p>You're receiving this because you signed up for daily digests.</p>
    </div>
</body>
</html>
"""


# ============================================
# Prompts
# ============================================

DAILY_TIP_PROMPT = """You are a career coach giving a brief, actionable daily tip.

CONTEXT:
- User has {job_count} new job matches
- Their top match is at {top_company} for {top_role}
- Resume strategy performing best: {best_strategy}

Generate ONE specific, actionable tip for today. Keep it under 50 words.
Focus on something they can do TODAY to improve their job search.

Respond with ONLY the tip text, no formatting."""


INSIGHT_GENERATION_PROMPT = """You are analyzing a job seeker's progress to generate insights.

DATA:
- Jobs found this session: {jobs_found}
- High matches (80%+): {high_matches}
- Top companies: {top_companies}
- Skills most in demand: {top_skills}
- Resume variants performance: {resume_performance}

Generate 2-3 brief, data-driven insights. Each should be:
1. Specific to their data
2. Actionable
3. Under 20 words each

Return as a JSON array of strings:
["Insight 1", "Insight 2", "Insight 3"]

Respond with ONLY the JSON array."""


# ============================================
# Helper Functions
# ============================================

def format_job_for_email(job: JobListing) -> str:
    """Format a job listing for the email digest."""
    score = job.scores.composite if job.scores else 0
    fresh_badge = "🔥 " if job.is_fresh else ""
    
    return f"""
    <div class="job-item">
        <p class="job-title">{fresh_badge}{job.title}</p>
        <p class="job-company">{job.company} • {job.location}</p>
        <span class="job-score">{score}% match</span>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
            {job.ai_reasoning[:150] if job.ai_reasoning else ''}...
        </p>
    </div>
    """


def format_whats_working(resumes: list[ResumeVariant]) -> str:
    """Format the what's working section."""
    if not resumes:
        return ""
    
    # Sort by callback rate
    sorted_resumes = sorted(
        [r for r in resumes if r.total_sent > 0],
        key=lambda r: r.callback_rate,
        reverse=True
    )
    
    if not sorted_resumes:
        return ""
    
    items = []
    for resume in sorted_resumes[:3]:
        emoji = "✅" if resume.callback_rate >= 25 else "⚠️"
        items.append(
            f'<p>{emoji} <strong>{resume.framing_strategy}</strong>: '
            f'{resume.callback_rate:.0f}% callback rate ({resume.total_sent} sent)</p>'
        )
    
    return f"""
    <div class="card">
        <h2>📈 What's Working</h2>
        {''.join(items)}
    </div>
    """


async def generate_daily_tip(
    job_count: int,
    top_company: str,
    top_role: str,
    best_strategy: str,
) -> str:
    """Generate a personalized daily tip using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = DAILY_TIP_PROMPT.format(
            job_count=job_count,
            top_company=top_company,
            top_role=top_role,
            best_strategy=best_strategy,
        )
        
        response = await model.generate_content_async(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error("daily_tip_generation_failed", error=str(e))
        return "Apply to your top matches within 24 hours — early applications get 3x more responses."


async def generate_insights(state: AgentState) -> list[str]:
    """Generate data-driven insights from the session."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Calculate stats
        high_matches = [j for j in state.scored_jobs if j.scores and j.scores.composite >= 80]
        top_companies = [j.company for j in state.scored_jobs[:5]]
        
        # Count skills across jobs
        skill_counts: dict[str, int] = {}
        for job in state.scored_jobs:
            for skill in job.extracted_skills:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
        top_skills = sorted(skill_counts.keys(), key=lambda s: skill_counts[s], reverse=True)[:5]
        
        # Resume performance
        resume_perf = [
            f"{r.framing_strategy}: {r.callback_rate}%"
            for r in state.generated_resumes[:3]
        ]
        
        prompt = INSIGHT_GENERATION_PROMPT.format(
            jobs_found=len(state.scored_jobs),
            high_matches=len(high_matches),
            top_companies=", ".join(top_companies),
            top_skills=", ".join(top_skills),
            resume_performance=", ".join(resume_perf) or "No data yet",
        )
        
        response = await model.generate_content_async(prompt)
        
        import json
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        
        return json.loads(text)
        
    except Exception as e:
        logger.error("insights_generation_failed", error=str(e))
        return ["Keep applying to fresh job postings for best results."]


# ============================================
# Email Sending
# ============================================

async def send_digest_email(
    to_email: str,
    subject: str,
    html_content: str,
) -> bool:
    """Send email digest via SMTP."""
    try:
        from tools.email import email_client
        
        return await email_client.send_email(
            to=to_email,
            subject=subject,
            html_body=html_content,
        )
        
    except Exception as e:
        logger.error("email_send_failed", error=str(e), to=to_email)
        return False


# ============================================
# Reporter Agent
# ============================================

async def reporter_agent(state: AgentState) -> AgentState:
    """
    Reporter Agent: Compiles and delivers daily intelligence briefings.
    
    Responsibilities:
    1. Summarize discovered and scored jobs
    2. Generate personalized insights
    3. Compile daily digest email
    4. Track and report on resume performance
    
    Args:
        state: Current AgentState with all agent results
    
    Returns:
        Updated AgentState with daily_digest populated
    """
    logger.info("reporter_agent_started", user_id=state.user_id)
    
    state.current_agent = AgentType.REPORTER
    state.add_event(
        AgentType.REPORTER,
        "Compiling your daily briefing...",
        AgentEventStatus.RUNNING
    )
    
    # Calculate statistics
    total_jobs = len(state.scored_jobs)
    high_matches = [j for j in state.scored_jobs if j.scores and j.scores.composite >= 80]
    fresh_jobs = [j for j in state.scored_jobs if j.is_fresh]
    resumes_ready = len(state.generated_resumes)
    
    # Get top 3 jobs
    top_jobs = state.scored_jobs[:3]
    
    # Generate personalized content
    top_job = top_jobs[0] if top_jobs else None
    best_strategy = state.generated_resumes[0].framing_strategy if state.generated_resumes else "General"
    
    state.add_event(
        AgentType.REPORTER,
        "Generating personalized insights...",
        AgentEventStatus.RUNNING
    )
    
    daily_tip = await generate_daily_tip(
        job_count=total_jobs,
        top_company=top_job.company if top_job else "Target Company",
        top_role=top_job.title if top_job else "Software Engineer",
        best_strategy=best_strategy,
    )
    
    insights = await generate_insights(state)
    
    # Format email content
    top_jobs_html = "".join([format_job_for_email(j) for j in top_jobs])
    whats_working_html = format_whats_working(state.generated_resumes)
    
    today = datetime.utcnow().strftime("%A, %B %d, %Y")
    
    html_content = DAILY_DIGEST_HTML.format(
        date=today,
        jobs_found=total_jobs,
        high_matches=len(high_matches),
        fresh_jobs=len(fresh_jobs),
        resumes_ready=resumes_ready,
        top_jobs_html=top_jobs_html or "<p>No jobs matched your criteria today.</p>",
        whats_working_html=whats_working_html,
        daily_tip=daily_tip,
        dashboard_url="https://careerpilot.app/dashboard",
    )
    
    # Store digest data
    state.daily_digest = {
        "date": today,
        "stats": {
            "jobs_found": total_jobs,
            "high_matches": len(high_matches),
            "fresh_jobs": len(fresh_jobs),
            "resumes_ready": resumes_ready,
        },
        "top_jobs": [
            {
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "score": j.scores.composite if j.scores else 0,
            }
            for j in top_jobs
        ],
        "insights": insights,
        "daily_tip": daily_tip,
        "html_content": html_content,
    }
    
    # Send email if user has email
    if state.user_profile and state.user_profile.email:
        state.add_event(
            AgentType.REPORTER,
            "Sending daily digest email...",
            AgentEventStatus.RUNNING
        )
        
        email_sent = await send_digest_email(
            to_email=state.user_profile.email,
            subject=f"🚀 CareerPilot: {len(high_matches)} great matches found today",
            html_content=html_content,
        )
        
        state.daily_digest["email_sent"] = email_sent
    
    # Final summary
    state.add_event(
        AgentType.REPORTER,
        f"Daily briefing ready: {total_jobs} jobs, {len(high_matches)} excellent matches",
        AgentEventStatus.COMPLETED
    )
    
    logger.info(
        "reporter_agent_completed",
        user_id=state.user_id,
        jobs=total_jobs,
        high_matches=len(high_matches),
    )
    
    return state
