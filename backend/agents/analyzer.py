"""
Analyzer Agent
==============
Scores and ranks job listings using AI analysis.
Implements the three-dimensional scoring system.
"""

import os
import uuid
import structlog
import google.generativeai as genai
from typing import Any

from state.schemas import (
    AgentState,
    AgentType,
    AgentEventStatus,
    JobListing,
    JobScores,
    HiddenRequirement,
    UserProfile,
)

logger = structlog.get_logger()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))


# ============================================
# Prompts
# ============================================

SKILLS_SCORING_PROMPT = """You are an expert job matching analyst. Score how well this candidate's skills match the job requirements.

CANDIDATE PROFILE:
{profile_summary}

JOB LISTING:
Title: {job_title}
Company: {company}
Description:
{job_description}

SCORING CRITERIA:
- Extract all required and preferred skills from the job description
- Compare against candidate's skills and proficiency levels
- Weight "required" skills 2x more than "nice to have"
- Consider years of experience with each skill

Return a JSON object with:
{{
    "score": <0-100>,
    "matched_skills": ["skill1", "skill2"],
    "missing_required": ["skill1"],
    "missing_preferred": ["skill1"],
    "reasoning": "Brief explanation"
}}

Respond with ONLY the JSON, no other text."""

CULTURE_SCORING_PROMPT = """You are an expert culture fit analyst. Score how well this candidate would fit the company culture.

CANDIDATE PROFILE:
{profile_summary}

JOB LISTING:
Title: {job_title}
Company: {company}
Description:
{job_description}

SCORING CRITERIA:
- Analyze language and tone in job description for culture signals
- Consider company size preferences
- Look for work-life balance indicators
- Identify values alignment signals
- Note any red flags (high turnover language, crunch culture, etc.)

Return a JSON object with:
{{
    "score": <0-100>,
    "positive_signals": ["signal1", "signal2"],
    "red_flags": ["flag1"],
    "reasoning": "Brief explanation"
}}

Respond with ONLY the JSON, no other text."""

TRAJECTORY_SCORING_PROMPT = """You are an expert career advisor. Score how well this job aligns with the candidate's career trajectory.

CANDIDATE PROFILE:
Career Goal (3 years): {career_goal}
Current Experience Level: {experience_level}
Target Roles: {target_roles}

JOB LISTING:
Title: {job_title}
Company: {company}
Description:
{job_description}

SCORING CRITERIA:
- Does this role build skills the candidate wants to develop?
- Is the title/level appropriate for their career stage?
- Does it move them toward their 3-year goal?
- Are there growth opportunities mentioned?
- Does the company's trajectory align with career goals?

Return a JSON object with:
{{
    "score": <0-100>,
    "alignment_factors": ["factor1", "factor2"],
    "concerns": ["concern1"],
    "reasoning": "Brief explanation"
}}

Respond with ONLY the JSON, no other text."""

HIDDEN_REQUIREMENTS_PROMPT = """You are an expert job description analyst. Identify hidden or implied requirements in this job posting.

JOB LISTING:
Title: {job_title}
Company: {company}
Description:
{job_description}

ANALYZE FOR:
1. Implied experience levels ("fast-paced" often means senior autonomy expected)
2. Unlisted technical skills (e.g., "microservices" implies Docker/K8s knowledge)
3. Culture expectations not explicitly stated
4. Salary red flags ("competitive" with no range = often below market)
5. Work expectations (overtime, on-call, travel)
6. Team dynamics hints

Return a JSON array of hidden requirements:
[
    {{
        "requirement": "Description of hidden requirement",
        "confidence": <0.0-1.0>,
        "reasoning": "Why you inferred this"
    }}
]

Return at most 5 hidden requirements. Respond with ONLY the JSON array, no other text."""

AI_REASONING_PROMPT = """You are explaining to a job seeker why a job was ranked highly for them.

CANDIDATE PROFILE:
{profile_summary}

JOB DETAILS:
Title: {job_title}
Company: {company}
Skills Match: {skills_score}/100
Culture Fit: {culture_score}/100
Career Trajectory: {trajectory_score}/100
Overall: {composite_score}/100

Write 2-3 sentences explaining why this job is a good match. Be specific and reference actual skills/goals. Keep it conversational and actionable.

Respond with ONLY the explanation text, no JSON or formatting."""


# ============================================
# Scoring Functions
# ============================================

def get_profile_summary(profile: UserProfile | None) -> str:
    """Create a text summary of the user profile for prompts."""
    if not profile:
        return "No profile available"
    
    skills_text = ", ".join([f"{s.name} ({s.level.value})" for s in profile.skills[:15]])
    
    experience_text = ""
    if profile.experience:
        exp = profile.experience[0]  # Most recent
        experience_text = f"Currently: {exp.title} at {exp.company}"
    
    return f"""
Name: {profile.name}
Location: {profile.location or 'Not specified'}
Skills: {skills_text}
{experience_text}
Career Goal: {profile.career_goal_3yr or 'Not specified'}
Preferred Work Mode: {profile.preferences.work_mode.value if profile.preferences else 'Any'}
"""


async def score_skills(job: JobListing, profile: UserProfile | None) -> dict:
    """Score skills match using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = SKILLS_SCORING_PROMPT.format(
            profile_summary=get_profile_summary(profile),
            job_title=job.title,
            company=job.company,
            job_description=job.raw_description[:3000],  # Limit length
        )
        
        response = await model.generate_content_async(prompt)
        
        # Parse JSON response
        import json
        text = response.text.strip()
        # Clean up potential markdown
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        
        return json.loads(text)
        
    except Exception as e:
        logger.error("skills_scoring_failed", error=str(e), job_id=job.id)
        return {"score": 50, "reasoning": "Unable to analyze"}


async def score_culture(job: JobListing, profile: UserProfile | None) -> dict:
    """Score culture fit using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = CULTURE_SCORING_PROMPT.format(
            profile_summary=get_profile_summary(profile),
            job_title=job.title,
            company=job.company,
            job_description=job.raw_description[:3000],
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
        logger.error("culture_scoring_failed", error=str(e), job_id=job.id)
        return {"score": 50, "reasoning": "Unable to analyze"}


async def score_trajectory(job: JobListing, profile: UserProfile | None) -> dict:
    """Score career trajectory alignment using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Calculate experience level
        years = sum(
            1 for exp in (profile.experience if profile else [])
        )  # Simplified
        exp_level = "entry" if years < 2 else "mid" if years < 5 else "senior"
        
        prompt = TRAJECTORY_SCORING_PROMPT.format(
            career_goal=profile.career_goal_3yr if profile else "Not specified",
            experience_level=exp_level,
            target_roles=", ".join(profile.preferences.target_roles) if profile and profile.preferences else "Not specified",
            job_title=job.title,
            company=job.company,
            job_description=job.raw_description[:3000],
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
        logger.error("trajectory_scoring_failed", error=str(e), job_id=job.id)
        return {"score": 50, "reasoning": "Unable to analyze"}


async def detect_hidden_requirements(job: JobListing) -> list[HiddenRequirement]:
    """Detect hidden requirements using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = HIDDEN_REQUIREMENTS_PROMPT.format(
            job_title=job.title,
            company=job.company,
            job_description=job.raw_description[:3000],
        )
        
        response = await model.generate_content_async(prompt)
        
        import json
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        
        raw_reqs = json.loads(text)
        
        return [
            HiddenRequirement(
                requirement=req.get("requirement", ""),
                confidence=req.get("confidence", 0.5),
                reasoning=req.get("reasoning", ""),
            )
            for req in raw_reqs[:5]
        ]
        
    except Exception as e:
        logger.error("hidden_requirements_failed", error=str(e), job_id=job.id)
        return []


async def generate_ai_reasoning(job: JobListing, profile: UserProfile | None) -> str:
    """Generate human-readable explanation for the ranking."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = AI_REASONING_PROMPT.format(
            profile_summary=get_profile_summary(profile),
            job_title=job.title,
            company=job.company,
            skills_score=job.scores.skills if job.scores else 0,
            culture_score=job.scores.culture if job.scores else 0,
            trajectory_score=job.scores.trajectory if job.scores else 0,
            composite_score=job.scores.composite if job.scores else 0,
        )
        
        response = await model.generate_content_async(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error("ai_reasoning_failed", error=str(e), job_id=job.id)
        return "This job matches several of your skills and preferences."


# ============================================
# Analyzer Agent
# ============================================

async def analyzer_agent(state: AgentState) -> AgentState:
    """
    Analyzer Agent: Scores and ranks discovered jobs.
    
    Responsibilities:
    1. Score each job on three dimensions (skills, culture, trajectory)
    2. Calculate composite score
    3. Detect hidden requirements
    4. Generate AI reasoning for rankings
    5. Sort jobs by composite score
    
    Args:
        state: Current AgentState with discovered_jobs
    
    Returns:
        Updated AgentState with scored_jobs populated
    """
    import asyncio
    
    logger.info("analyzer_agent_started", user_id=state.user_id, job_count=len(state.discovered_jobs))
    
    state.current_agent = AgentType.ANALYZER
    state.add_event(
        AgentType.ANALYZER,
        f"Analyzing {len(state.discovered_jobs)} jobs...",
        AgentEventStatus.RUNNING
    )
    
    profile = state.user_profile
    scored_jobs = []
    
    # Process jobs (limit to avoid API rate limits)
    jobs_to_analyze = state.discovered_jobs[:30]  # Analyze top 30
    
    for i, job in enumerate(jobs_to_analyze):
        try:
            state.add_event(
                AgentType.ANALYZER,
                f"Scoring '{job.title}' at {job.company}... ({i+1}/{len(jobs_to_analyze)})",
                AgentEventStatus.RUNNING
            )
            
            # Run all scoring in parallel
            skills_result, culture_result, trajectory_result = await asyncio.gather(
                score_skills(job, profile),
                score_culture(job, profile),
                score_trajectory(job, profile),
            )
            
            # Extract scores
            skills_score = skills_result.get("score", 50)
            culture_score = culture_result.get("score", 50)
            trajectory_score = trajectory_result.get("score", 50)
            
            # Calculate composite (weighted average)
            # Skills weighted highest, then trajectory, then culture
            composite = int(
                skills_score * 0.45 +
                trajectory_score * 0.35 +
                culture_score * 0.20
            )
            
            job.scores = JobScores(
                skills=skills_score,
                culture=culture_score,
                trajectory=trajectory_score,
                composite=composite,
            )
            
            # Extract skills from analysis
            job.required_skills = skills_result.get("missing_required", [])
            job.preferred_skills = skills_result.get("missing_preferred", [])
            job.extracted_skills = skills_result.get("matched_skills", [])
            
            # Detect hidden requirements
            job.hidden_requirements = await detect_hidden_requirements(job)
            
            # Generate AI reasoning
            job.ai_reasoning = await generate_ai_reasoning(job, profile)
            
            scored_jobs.append(job)
            
            # Small delay to avoid rate limits
            await asyncio.sleep(0.5)
            
        except Exception as e:
            logger.error("job_analysis_failed", job_id=job.id, error=str(e))
            state.errors.append(f"Failed to analyze job {job.id}: {str(e)}")
    
    # Sort by composite score (highest first)
    scored_jobs.sort(key=lambda j: j.scores.composite if j.scores else 0, reverse=True)
    
    # Update state
    state.scored_jobs = scored_jobs
    
    # Calculate stats
    high_match = sum(1 for j in scored_jobs if j.scores and j.scores.composite >= 80)
    medium_match = sum(1 for j in scored_jobs if j.scores and 60 <= j.scores.composite < 80)
    
    state.add_event(
        AgentType.ANALYZER,
        f"Analysis complete: {high_match} excellent matches, {medium_match} good matches",
        AgentEventStatus.COMPLETED
    )
    
    logger.info(
        "analyzer_agent_completed",
        user_id=state.user_id,
        jobs_analyzed=len(scored_jobs),
        high_match=high_match,
        medium_match=medium_match,
    )
    
    return state
