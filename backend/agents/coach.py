"""
Coach Agent
===========
Prepares users for interviews with company-specific simulations.
Tracks weaknesses and generates personalized study plans.
"""

import os
import uuid
from datetime import datetime
from typing import Literal
import structlog
import google.generativeai as genai

from state.schemas import (
    AgentState,
    AgentType,
    AgentEventStatus,
    InterviewSession,
    InterviewMode,
    UserProfile,
    JobListing,
)

logger = structlog.get_logger()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))


# ============================================
# Interview Question Prompts
# ============================================

OA_PROBLEM_PROMPT = """You are a technical interview question generator. Create an Online Assessment (OA) coding problem appropriate for this company and role.

COMPANY: {company}
ROLE: {role}
DIFFICULTY: {difficulty}  # easy, medium, hard

Generate a coding problem with:
1. A clear problem statement
2. Input/output format
3. 2-3 examples
4. Constraints
5. Hints (hidden by default)

The problem should test data structures and algorithms relevant to the role.

Return a JSON object:
{{
    "title": "Problem title",
    "difficulty": "{difficulty}",
    "category": "arrays/strings/trees/graphs/dp/etc",
    "problem_statement": "Full problem description",
    "input_format": "Description of input",
    "output_format": "Description of output",
    "examples": [
        {{
            "input": "example input",
            "output": "expected output",
            "explanation": "optional explanation"
        }}
    ],
    "constraints": ["constraint 1", "constraint 2"],
    "hints": [
        "Hint 1: conceptual nudge",
        "Hint 2: approach suggestion",
        "Hint 3: partial solution direction"
    ],
    "optimal_approach": "Brief description of optimal solution",
    "time_complexity": "Expected time complexity",
    "space_complexity": "Expected space complexity"
}}

Respond with ONLY the JSON."""


CODE_ROUND_PROMPT = """You are an experienced technical interviewer at {company}. You're conducting a live coding interview.

ROLE: {role}
CANDIDATE BACKGROUND:
{candidate_background}

CURRENT PROBLEM:
{problem}

CANDIDATE'S CURRENT CODE:
{code}

INTERVIEWER BEHAVIOR:
- Ask clarifying questions about the approach
- Provide hints if stuck (but not too easily)
- Point out potential issues or edge cases
- Be encouraging but realistic
- Ask follow-up questions about complexity

Based on the candidate's progress, respond as the interviewer would. This could be:
- A clarifying question
- A hint
- Pointing out an edge case
- Asking about the approach
- A follow-up question

Return a JSON object:
{{
    "interviewer_response": "What you say to the candidate",
    "response_type": "question/hint/feedback/follow_up",
    "evaluation_notes": "Private notes on candidate performance so far"
}}

Respond with ONLY the JSON."""


BEHAVIORAL_QUESTION_PROMPT = """You are preparing behavioral interview questions for a candidate applying to {company} for the role of {role}.

COMPANY CULTURE NOTES:
{culture_notes}

CANDIDATE'S EXPERIENCE:
{experience_summary}

Generate 5 behavioral interview questions that:
1. Are relevant to this specific company's values
2. Can be answered using the STAR method
3. Probe for specific examples from their background
4. Range from standard to challenging

Return a JSON array:
[
    {{
        "question": "The behavioral question",
        "what_it_tests": "What skill/trait this evaluates",
        "good_answer_elements": ["element 1", "element 2"],
        "red_flags": ["thing to avoid 1"]
    }}
]

Respond with ONLY the JSON array."""


BEHAVIORAL_EVALUATION_PROMPT = """You are evaluating a candidate's behavioral interview answer using the STAR framework.

QUESTION: {question}

CANDIDATE'S ANSWER:
{answer}

Evaluate the answer on:
1. **Situation**: Did they clearly set the context? (0-25 points)
2. **Task**: Did they explain their specific responsibility? (0-25 points)
3. **Action**: Did they describe concrete actions they took? (0-25 points)
4. **Result**: Did they share measurable outcomes? (0-25 points)

Also evaluate:
- Communication clarity (A-F)
- Confidence (detected hedging language: "I think", "maybe", etc.)
- Specificity (vague vs concrete examples)

Return a JSON object:
{{
    "star_scores": {{
        "situation": <0-25>,
        "task": <0-25>,
        "action": <0-25>,
        "result": <0-25>
    }},
    "total_score": <0-100>,
    "letter_grade": "A/B/C/D/F",
    "communication_grade": "A/B/C/D/F",
    "confidence_level": "high/medium/low",
    "hedging_phrases_found": ["phrase1", "phrase2"],
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["area 1", "area 2"],
    "rewritten_answer": "A gold-standard version of their answer",
    "feedback": "Specific, actionable feedback"
}}

Respond with ONLY the JSON."""


STUDY_PLAN_PROMPT = """You are a technical interview coach. Based on the candidate's weakness patterns, create a focused study plan.

WEAKNESS AREAS (from recent practice sessions):
{weakness_areas}

UPCOMING INTERVIEW:
Company: {company}
Role: {role}
Interview Types: {interview_types}

Create a 7-day study plan with:
1. Specific topics to focus on each day
2. Resources (free when possible)
3. Practice problems or exercises
4. Time estimates

Return a JSON object:
{{
    "summary": "One sentence overview",
    "focus_areas": ["area 1", "area 2"],
    "daily_plan": [
        {{
            "day": 1,
            "topic": "Topic name",
            "activities": [
                {{
                    "type": "read/watch/practice",
                    "resource": "Resource name or link",
                    "duration_minutes": 30,
                    "notes": "Why this helps"
                }}
            ]
        }}
    ],
    "practice_problems": [
        {{
            "topic": "Topic",
            "problems": ["problem 1", "problem 2"],
            "difficulty": "easy/medium/hard"
        }}
    ],
    "success_metrics": ["metric 1", "metric 2"]
}}

Respond with ONLY the JSON."""


# ============================================
# Helper Functions
# ============================================

def get_company_difficulty(company: str) -> Literal["easy", "medium", "hard"]:
    """Estimate typical interview difficulty for a company."""
    hard_companies = ["google", "meta", "facebook", "apple", "amazon", "netflix", "microsoft", "stripe", "airbnb"]
    medium_companies = ["uber", "lyft", "dropbox", "linkedin", "twitter", "snap", "pinterest"]
    
    company_lower = company.lower()
    
    if any(c in company_lower for c in hard_companies):
        return "hard"
    elif any(c in company_lower for c in medium_companies):
        return "medium"
    else:
        return "medium"  # Default to medium


def get_experience_summary(profile: UserProfile | None) -> str:
    """Create a brief experience summary for context."""
    if not profile:
        return "No profile available"
    
    parts = []
    
    if profile.experience:
        exp = profile.experience[0]
        parts.append(f"Current: {exp.title} at {exp.company}")
        parts.append(f"Experience: {exp.description[:200]}")
    
    if profile.skills:
        top_skills = [s.name for s in profile.skills if s.level.value in ["expert", "advanced"]][:5]
        parts.append(f"Top skills: {', '.join(top_skills)}")
    
    return "\n".join(parts)


# ============================================
# Interview Functions
# ============================================

async def generate_oa_problem(
    company: str,
    role: str,
    difficulty: str = "medium",
) -> dict:
    """Generate an OA-style coding problem."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = OA_PROBLEM_PROMPT.format(
            company=company,
            role=role,
            difficulty=difficulty,
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
        logger.error("oa_generation_failed", error=str(e))
        raise


async def generate_behavioral_questions(
    company: str,
    role: str,
    profile: UserProfile | None,
    culture_notes: str = "",
) -> list[dict]:
    """Generate company-specific behavioral questions."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = BEHAVIORAL_QUESTION_PROMPT.format(
            company=company,
            role=role,
            culture_notes=culture_notes or f"Standard tech company culture at {company}",
            experience_summary=get_experience_summary(profile),
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
        logger.error("behavioral_questions_failed", error=str(e))
        raise


async def evaluate_behavioral_answer(
    question: str,
    answer: str,
) -> dict:
    """Evaluate a behavioral answer using STAR framework."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = BEHAVIORAL_EVALUATION_PROMPT.format(
            question=question,
            answer=answer,
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
        logger.error("behavioral_evaluation_failed", error=str(e))
        raise


async def generate_study_plan(
    weakness_areas: list[str],
    company: str,
    role: str,
    interview_types: list[str],
) -> dict:
    """Generate a personalized study plan."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = STUDY_PLAN_PROMPT.format(
            weakness_areas="\n".join(f"- {w}" for w in weakness_areas),
            company=company,
            role=role,
            interview_types=", ".join(interview_types),
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
        logger.error("study_plan_generation_failed", error=str(e))
        raise


# ============================================
# Coach Agent
# ============================================

async def coach_agent(state: AgentState) -> AgentState:
    """
    Coach Agent: Prepares users for interviews.
    
    Responsibilities:
    1. Generate company-specific interview questions
    2. Run mock interview simulations
    3. Evaluate answers and track weaknesses
    4. Generate personalized study plans
    
    Args:
        state: Current AgentState with interview session context
    
    Returns:
        Updated AgentState with interview session results
    """
    logger.info("coach_agent_started", user_id=state.user_id)
    
    state.current_agent = AgentType.COACH
    state.add_event(
        AgentType.COACH,
        "Preparing interview practice session...",
        AgentEventStatus.RUNNING
    )
    
    if not state.interview_sessions:
        state.add_event(
            AgentType.COACH,
            "No interview session configured",
            AgentEventStatus.FAILED
        )
        return state
    
    session = state.interview_sessions[-1]  # Most recent session
    profile = state.user_profile
    
    company = session.company_name or "Tech Company"
    role = "Software Engineer"  # Default
    
    # Find matching job if available
    if session.job_id and state.scored_jobs:
        matching_job = next(
            (j for j in state.scored_jobs if j.id == session.job_id),
            None
        )
        if matching_job:
            company = matching_job.company
            role = matching_job.title
    
    difficulty = get_company_difficulty(company)
    
    state.add_event(
        AgentType.COACH,
        f"Preparing {session.mode.value} practice for {company}...",
        AgentEventStatus.RUNNING
    )
    
    try:
        if session.mode == InterviewMode.OA:
            # Generate OA problem
            problem = await generate_oa_problem(company, role, difficulty)
            
            session.transcript.append({
                "type": "problem",
                "content": problem,
                "timestamp": datetime.utcnow().isoformat(),
            })
            
            session.scores = {
                "problem_generated": True,
                "difficulty": difficulty,
                "category": problem.get("category", "unknown"),
            }
            
            state.add_event(
                AgentType.COACH,
                f"Generated {difficulty} {problem.get('category', '')} problem",
                AgentEventStatus.COMPLETED
            )
            
        elif session.mode == InterviewMode.BEHAVIORAL:
            # Generate behavioral questions
            questions = await generate_behavioral_questions(
                company, role, profile
            )
            
            session.transcript.append({
                "type": "questions",
                "content": questions,
                "timestamp": datetime.utcnow().isoformat(),
            })
            
            session.scores = {
                "questions_generated": len(questions),
                "company": company,
            }
            
            state.add_event(
                AgentType.COACH,
                f"Generated {len(questions)} behavioral questions for {company}",
                AgentEventStatus.COMPLETED
            )
            
        elif session.mode == InterviewMode.CODE:
            # Generate coding problem for live coding
            problem = await generate_oa_problem(company, role, difficulty)
            
            session.transcript.append({
                "type": "live_coding_problem",
                "content": problem,
                "timestamp": datetime.utcnow().isoformat(),
            })
            
            session.scores = {
                "problem_generated": True,
                "difficulty": difficulty,
                "mode": "live_coding",
            }
            
            state.add_event(
                AgentType.COACH,
                f"Live coding session ready for {company}",
                AgentEventStatus.COMPLETED
            )
        
        session.completed_at = datetime.utcnow()
        
    except Exception as e:
        logger.error("coach_session_failed", error=str(e))
        state.errors.append(f"Interview prep failed: {str(e)}")
        state.add_event(
            AgentType.COACH,
            f"Error preparing interview: {str(e)}",
            AgentEventStatus.FAILED
        )
    
    logger.info(
        "coach_agent_completed",
        user_id=state.user_id,
        mode=session.mode.value,
        company=company,
    )
    
    return state
