"""
Writer Agent
============
Generates tailored resumes and cover letters for job applications.
Implements A/B testing of different framing strategies.
"""

import os
import uuid
from datetime import datetime
import structlog
import google.generativeai as genai

from state.schemas import (
    AgentState,
    AgentType,
    AgentEventStatus,
    JobListing,
    ResumeVariant,
    UserProfile,
)

logger = structlog.get_logger()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))


# ============================================
# Framing Strategies
# ============================================

FRAMING_STRATEGIES = {
    "backend-heavy": {
        "description": "Emphasize backend systems, APIs, databases, and infrastructure",
        "keywords": ["backend", "api", "database", "server", "infrastructure", "distributed"],
    },
    "fullstack": {
        "description": "Balance frontend and backend skills equally",
        "keywords": ["fullstack", "full-stack", "react", "node", "frontend", "backend"],
    },
    "impact-first": {
        "description": "Lead with measurable business impact and outcomes",
        "keywords": ["growth", "scale", "revenue", "users", "performance", "optimization"],
    },
    "leadership": {
        "description": "Highlight leadership, mentorship, and team collaboration",
        "keywords": ["lead", "mentor", "team", "architect", "senior", "principal"],
    },
    "tech-stack": {
        "description": "Align resume structure around the specific tech stack mentioned",
        "keywords": [],  # Dynamic based on job
    },
}


def determine_best_framing(job: JobListing) -> str:
    """
    Determine the best framing strategy based on job description.
    """
    description = job.raw_description.lower()
    title = job.title.lower()
    
    # Check for leadership signals
    if any(kw in title for kw in ["lead", "senior", "principal", "staff", "architect"]):
        if any(kw in description for kw in ["mentor", "team", "guide", "ownership"]):
            return "leadership"
    
    # Check for backend emphasis
    backend_keywords = ["backend", "api", "microservice", "database", "infrastructure", "distributed"]
    backend_count = sum(1 for kw in backend_keywords if kw in description)
    
    # Check for frontend emphasis
    frontend_keywords = ["frontend", "react", "vue", "angular", "ui", "ux", "css"]
    frontend_count = sum(1 for kw in frontend_keywords if kw in description)
    
    if backend_count > frontend_count + 2:
        return "backend-heavy"
    elif frontend_count > backend_count + 2:
        return "fullstack"  # We emphasize fullstack if they want frontend
    
    # Check for impact language
    impact_keywords = ["scale", "growth", "revenue", "users", "performance", "optimization"]
    if sum(1 for kw in impact_keywords if kw in description) >= 3:
        return "impact-first"
    
    # Default to fullstack
    return "fullstack"


# ============================================
# Resume Generation Prompts
# ============================================

RESUME_GENERATION_PROMPT = """You are an expert resume writer specializing in tech roles. Generate a tailored resume for this job application.

CANDIDATE PROFILE:
{profile_data}

TARGET JOB:
Title: {job_title}
Company: {company}
Key Requirements:
{requirements}

FRAMING STRATEGY: {framing_strategy}
{framing_description}

INSTRUCTIONS:
1. Reorder and emphasize experiences that match the job requirements
2. Use metrics and quantifiable achievements where possible
3. Match the language and keywords from the job description
4. Keep it to 1 page equivalent (concise bullet points)
5. Use the {framing_strategy} framing to structure content

Return a JSON object with this structure:
{{
    "header": {{
        "name": "...",
        "title": "...",
        "email": "...",
        "location": "...",
        "linkedin": "...",
        "github": "...",
        "portfolio": "..."
    }},
    "summary": "2-3 sentence professional summary tailored to this role",
    "skills": {{
        "primary": ["skill1", "skill2"],
        "secondary": ["skill3", "skill4"]
    }},
    "experience": [
        {{
            "company": "...",
            "title": "...",
            "dates": "...",
            "bullets": ["Achievement 1 with metrics", "Achievement 2"]
        }}
    ],
    "projects": [
        {{
            "name": "...",
            "description": "...",
            "tech": ["tech1", "tech2"],
            "link": "..."
        }}
    ],
    "education": [
        {{
            "institution": "...",
            "degree": "...",
            "year": "..."
        }}
    ]
}}

Respond with ONLY the JSON, no other text."""


COVER_LETTER_PROMPT = """You are an expert cover letter writer. Write a compelling, personalized cover letter.

CANDIDATE:
{profile_summary}

JOB:
Title: {job_title}
Company: {company}
Description: {job_description}

COMPANY CONTEXT (if available):
{company_context}

INSTRUCTIONS:
1. Open with a hook that references something specific about the company
2. Connect your experience directly to their needs
3. Show enthusiasm without being generic
4. Keep it to 3-4 paragraphs, under 300 words
5. End with a clear call to action

Write the cover letter in a professional but personable tone. Do NOT use placeholder text like [Company Name] - use actual names.

Return ONLY the cover letter text, no JSON or formatting."""


# ============================================
# Helper Functions
# ============================================

def format_profile_for_resume(profile: UserProfile) -> str:
    """Format user profile for the resume generation prompt."""
    sections = []
    
    # Basic info
    sections.append(f"Name: {profile.name}")
    sections.append(f"Email: {profile.email}")
    if profile.location:
        sections.append(f"Location: {profile.location}")
    if profile.linkedin_url:
        sections.append(f"LinkedIn: {profile.linkedin_url}")
    if profile.github_username:
        sections.append(f"GitHub: github.com/{profile.github_username}")
    
    # Skills
    if profile.skills:
        skills_by_level = {}
        for skill in profile.skills:
            level = skill.level.value
            if level not in skills_by_level:
                skills_by_level[level] = []
            skills_by_level[level].append(skill.name)
        
        sections.append("\nSKILLS:")
        for level in ["expert", "advanced", "intermediate", "beginner"]:
            if level in skills_by_level:
                sections.append(f"  {level.title()}: {', '.join(skills_by_level[level])}")
    
    # Experience
    if profile.experience:
        sections.append("\nEXPERIENCE:")
        for exp in profile.experience:
            end = exp.end_date or "Present"
            sections.append(f"  {exp.title} at {exp.company} ({exp.start_date} - {end})")
            sections.append(f"    {exp.description[:200]}")
    
    # Education
    if profile.education:
        sections.append("\nEDUCATION:")
        for edu in profile.education:
            sections.append(f"  {edu.degree} in {edu.field_of_study} from {edu.institution} ({edu.graduation_year})")
    
    return "\n".join(sections)


def extract_requirements(job: JobListing) -> str:
    """Extract key requirements from job listing."""
    requirements = []
    
    if job.required_skills:
        requirements.append(f"Required Skills: {', '.join(job.required_skills[:10])}")
    
    if job.preferred_skills:
        requirements.append(f"Preferred Skills: {', '.join(job.preferred_skills[:10])}")
    
    if job.extracted_skills:
        requirements.append(f"Mentioned Technologies: {', '.join(job.extracted_skills[:10])}")
    
    # Extract from description (simplified)
    desc = job.raw_description[:500]
    requirements.append(f"\nJob Description Excerpt:\n{desc}")
    
    return "\n".join(requirements)


async def fetch_company_context(company: str) -> str:
    """
    Fetch recent company news/context for cover letter personalization.
    This is a simplified version - in production would use news APIs.
    """
    # Placeholder - would integrate with news API
    return f"Context about {company} would be fetched here."


# ============================================
# Generation Functions
# ============================================

async def generate_resume(
    job: JobListing,
    profile: UserProfile,
    framing_strategy: str,
) -> dict:
    """Generate a tailored resume using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        strategy_info = FRAMING_STRATEGIES.get(framing_strategy, FRAMING_STRATEGIES["fullstack"])
        
        prompt = RESUME_GENERATION_PROMPT.format(
            profile_data=format_profile_for_resume(profile),
            job_title=job.title,
            company=job.company,
            requirements=extract_requirements(job),
            framing_strategy=framing_strategy,
            framing_description=strategy_info["description"],
        )
        
        response = await model.generate_content_async(prompt)
        
        import json
        text = response.text.strip()
        
        # Clean up markdown if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        
        return json.loads(text)
        
    except Exception as e:
        logger.error("resume_generation_failed", error=str(e), job_id=job.id)
        raise


async def generate_cover_letter(
    job: JobListing,
    profile: UserProfile,
) -> str:
    """Generate a tailored cover letter using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Get company context
        company_context = await fetch_company_context(job.company)
        
        # Create profile summary
        skills_text = ", ".join([s.name for s in profile.skills[:10]])
        current_role = profile.experience[0] if profile.experience else None
        
        profile_summary = f"""
Name: {profile.name}
Current Role: {current_role.title if current_role else 'N/A'} at {current_role.company if current_role else 'N/A'}
Key Skills: {skills_text}
Career Goal: {profile.career_goal_3yr or 'Not specified'}
"""
        
        prompt = COVER_LETTER_PROMPT.format(
            profile_summary=profile_summary,
            job_title=job.title,
            company=job.company,
            job_description=job.raw_description[:2000],
            company_context=company_context,
        )
        
        response = await model.generate_content_async(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error("cover_letter_generation_failed", error=str(e), job_id=job.id)
        raise


# ============================================
# Writer Agent
# ============================================

async def writer_agent(state: AgentState) -> AgentState:
    """
    Writer Agent: Generates tailored resumes and cover letters.
    
    Responsibilities:
    1. Determine best framing strategy for each high-match job
    2. Generate tailored resume with that framing
    3. Generate personalized cover letter
    4. Track variants for A/B testing
    
    Args:
        state: Current AgentState with scored_jobs
    
    Returns:
        Updated AgentState with generated materials
    """
    logger.info("writer_agent_started", user_id=state.user_id)
    
    state.current_agent = AgentType.WRITER
    state.add_event(
        AgentType.WRITER,
        "Generating tailored application materials...",
        AgentEventStatus.RUNNING
    )
    
    if not state.user_profile:
        state.errors.append("User profile not available for resume generation")
        state.add_event(
            AgentType.WRITER,
            "Error: User profile not available",
            AgentEventStatus.FAILED
        )
        return state
    
    profile = state.user_profile
    
    # Filter to high-match jobs (composite >= 75)
    high_match_jobs = [
        j for j in state.scored_jobs
        if j.scores and j.scores.composite >= 75
    ][:5]  # Limit to top 5
    
    if not high_match_jobs:
        state.add_event(
            AgentType.WRITER,
            "No high-match jobs found for material generation",
            AgentEventStatus.COMPLETED
        )
        return state
    
    state.add_event(
        AgentType.WRITER,
        f"Creating materials for {len(high_match_jobs)} top matches...",
        AgentEventStatus.RUNNING
    )
    
    generated_resumes = []
    cover_letters = {}
    
    for job in high_match_jobs:
        try:
            # Determine framing strategy
            framing = determine_best_framing(job)
            
            state.add_event(
                AgentType.WRITER,
                f"Crafting {framing} resume for {job.company}...",
                AgentEventStatus.RUNNING
            )
            
            # Generate resume
            resume_content = await generate_resume(job, profile, framing)
            
            # Create variant for tracking
            variant_tag = f"{framing}-v1"
            variant = ResumeVariant(
                id=str(uuid.uuid4()),
                user_id=state.user_id,
                variant_tag=variant_tag,
                framing_strategy=framing.replace("-", " ").title(),
                content=resume_content,
            )
            generated_resumes.append(variant)
            
            # Generate cover letter
            state.add_event(
                AgentType.WRITER,
                f"Drafting cover letter for {job.company}...",
                AgentEventStatus.RUNNING
            )
            
            cover_letter = await generate_cover_letter(job, profile)
            cover_letters[job.id] = cover_letter
            
            logger.info(
                "materials_generated",
                job_id=job.id,
                company=job.company,
                framing=framing,
            )
            
        except Exception as e:
            logger.error("material_generation_failed", job_id=job.id, error=str(e))
            state.errors.append(f"Failed to generate materials for {job.company}: {str(e)}")
    
    # Update state
    state.generated_resumes = generated_resumes
    state.generated_cover_letters = cover_letters
    
    state.add_event(
        AgentType.WRITER,
        f"Generated {len(generated_resumes)} resumes and {len(cover_letters)} cover letters",
        AgentEventStatus.COMPLETED
    )
    
    logger.info(
        "writer_agent_completed",
        user_id=state.user_id,
        resumes=len(generated_resumes),
        cover_letters=len(cover_letters),
    )
    
    return state
