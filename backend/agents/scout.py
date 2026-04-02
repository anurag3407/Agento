"""
Scout Agent
===========
Autonomously discovers job listings from multiple sources.
Deduplicates and filters based on user preferences.
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Any
import httpx
import structlog

from state.schemas import (
    AgentState,
    AgentType,
    AgentEventStatus,
    JobListing,
    WorkMode,
)

logger = structlog.get_logger()


# ============================================
# Job Source Scrapers
# ============================================

async def scrape_remotive(preferences: dict) -> list[dict]:
    """
    Scrape jobs from Remotive API (free, no auth required).
    https://remotive.com/api/remote-jobs
    """
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Remotive has category-based filtering
            categories = ["software-dev", "data", "devops"]
            
            for category in categories:
                response = await client.get(
                    f"https://remotive.com/api/remote-jobs?category={category}&limit=50"
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for job in data.get("jobs", []):
                        jobs.append({
                            "title": job.get("title", ""),
                            "company": job.get("company_name", ""),
                            "location": job.get("candidate_required_location", "Worldwide"),
                            "description": job.get("description", ""),
                            "url": job.get("url", ""),
                            "posted_at": job.get("publication_date"),
                            "salary": job.get("salary", ""),
                            "source": "remotive",
                        })
                
                # Rate limiting
                await asyncio.sleep(1)
                
    except Exception as e:
        logger.error("remotive_scrape_failed", error=str(e))
    
    return jobs


async def scrape_himalayas(preferences: dict) -> list[dict]:
    """
    Scrape jobs from Himalayas API (free tier available).
    https://himalayas.app/jobs/api
    """
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://himalayas.app/jobs/api",
                params={
                    "limit": 50,
                    "offset": 0,
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                for job in data.get("jobs", []):
                    jobs.append({
                        "title": job.get("title", ""),
                        "company": job.get("companyName", ""),
                        "location": job.get("locationRestrictions", ["Worldwide"])[0] if job.get("locationRestrictions") else "Worldwide",
                        "description": job.get("description", ""),
                        "url": job.get("applicationLink", "") or f"https://himalayas.app/jobs/{job.get('slug', '')}",
                        "posted_at": job.get("pubDate"),
                        "salary": f"${job.get('minSalary', '')}-${job.get('maxSalary', '')}" if job.get("minSalary") else "",
                        "source": "himalayas",
                    })
                    
    except Exception as e:
        logger.error("himalayas_scrape_failed", error=str(e))
    
    return jobs


async def scrape_hn_whoishiring() -> list[dict]:
    """
    Scrape the monthly "Who's Hiring" thread from Hacker News.
    Uses the HN Algolia API.
    """
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Search for the latest "Who is hiring" post
            response = await client.get(
                "https://hn.algolia.com/api/v1/search",
                params={
                    "query": "Ask HN: Who is hiring",
                    "tags": "story",
                    "hitsPerPage": 1,
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                hits = data.get("hits", [])
                
                if hits:
                    story_id = hits[0].get("objectID")
                    
                    # Get comments (job postings)
                    comments_response = await client.get(
                        f"https://hn.algolia.com/api/v1/items/{story_id}"
                    )
                    
                    if comments_response.status_code == 200:
                        story_data = comments_response.json()
                        
                        for comment in story_data.get("children", [])[:100]:  # Limit to first 100
                            text = comment.get("text", "")
                            if text and len(text) > 100:  # Filter out short comments
                                # Try to extract company from first line
                                first_line = text.split("\n")[0] if "\n" in text else text[:100]
                                company = first_line.split("|")[0].strip() if "|" in first_line else "Unknown"
                                
                                jobs.append({
                                    "title": "See posting",  # HN posts don't have structured titles
                                    "company": company[:50],  # Limit length
                                    "location": "Various",
                                    "description": text,
                                    "url": f"https://news.ycombinator.com/item?id={comment.get('id')}",
                                    "posted_at": comment.get("created_at"),
                                    "salary": "",
                                    "source": "hackernews",
                                })
                                
    except Exception as e:
        logger.error("hn_scrape_failed", error=str(e))
    
    return jobs


async def scrape_github_jobs() -> list[dict]:
    """
    Search GitHub for repositories with job postings.
    Many companies post jobs in their repos.
    """
    # GitHub Jobs API was deprecated, but we can search repos
    # This is a placeholder - would need GitHub API token
    return []


# ============================================
# Deduplication
# ============================================

def normalize_title(title: str) -> str:
    """Normalize job title for comparison."""
    title = title.lower().strip()
    # Remove common variations
    replacements = [
        ("sr.", "senior"),
        ("sr ", "senior "),
        ("jr.", "junior"),
        ("jr ", "junior "),
        ("swe", "software engineer"),
        ("sde", "software development engineer"),
    ]
    for old, new in replacements:
        title = title.replace(old, new)
    return title


def normalize_company(company: str) -> str:
    """Normalize company name for comparison."""
    company = company.lower().strip()
    # Remove common suffixes
    for suffix in [", inc.", ", inc", " inc.", " inc", ", llc", " llc", ", ltd", " ltd"]:
        company = company.replace(suffix, "")
    return company


def deduplicate_jobs(jobs: list[dict]) -> list[dict]:
    """
    Remove duplicate job listings across sources.
    Uses fuzzy matching on title + company + location.
    """
    seen = set()
    unique_jobs = []
    
    for job in jobs:
        # Create a dedup key
        key = (
            normalize_title(job.get("title", "")),
            normalize_company(job.get("company", "")),
            job.get("location", "").lower().strip(),
        )
        
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs


# ============================================
# Filtering
# ============================================

def filter_by_preferences(jobs: list[dict], preferences: dict) -> list[dict]:
    """
    Filter jobs based on user preferences.
    """
    filtered = []
    
    target_roles = [r.lower() for r in preferences.get("target_roles", [])]
    excluded_industries = [i.lower() for i in preferences.get("industries_exclude", [])]
    
    for job in jobs:
        title = job.get("title", "").lower()
        description = job.get("description", "").lower()
        
        # Check if title matches any target role (if specified)
        if target_roles:
            if not any(role in title for role in target_roles):
                continue
        
        # Check for excluded industries/keywords
        if excluded_industries:
            if any(industry in description for industry in excluded_industries):
                continue
        
        filtered.append(job)
    
    return filtered


def is_fresh_posting(posted_at: str | None) -> bool:
    """Check if a job was posted within the last 24 hours."""
    if not posted_at:
        return False
    
    try:
        # Try parsing various date formats
        from dateutil import parser
        posted_date = parser.parse(posted_at)
        
        # Make timezone-naive for comparison
        if posted_date.tzinfo:
            posted_date = posted_date.replace(tzinfo=None)
        
        return datetime.utcnow() - posted_date < timedelta(hours=24)
    except:
        return False


# ============================================
# Scout Agent
# ============================================

async def scout_agent(state: AgentState) -> AgentState:
    """
    Scout Agent: Discovers job listings from multiple sources.
    
    Responsibilities:
    1. Scrape multiple job boards in parallel
    2. Deduplicate listings across sources
    3. Filter based on user preferences
    4. Mark fresh postings (< 24 hours)
    5. Store discovered jobs in state
    
    Args:
        state: Current AgentState
    
    Returns:
        Updated AgentState with discovered_jobs populated
    """
    logger.info("scout_agent_started", user_id=state.user_id)
    
    # Update state with running event
    state.current_agent = AgentType.SCOUT
    state.add_event(
        AgentType.SCOUT,
        "Starting job discovery across multiple sources...",
        AgentEventStatus.RUNNING
    )
    
    # Get user preferences
    preferences = {}
    if state.user_profile and state.user_profile.preferences:
        preferences = state.user_profile.preferences.model_dump()
    
    # Scrape all sources in parallel
    state.add_event(
        AgentType.SCOUT,
        "Scanning Remotive, Himalayas, and Hacker News...",
        AgentEventStatus.RUNNING
    )
    
    results = await asyncio.gather(
        scrape_remotive(preferences),
        scrape_himalayas(preferences),
        scrape_hn_whoishiring(),
        return_exceptions=True,
    )
    
    # Collect all jobs
    all_jobs = []
    source_counts = {}
    
    for result in results:
        if isinstance(result, list):
            for job in result:
                source = job.get("source", "unknown")
                source_counts[source] = source_counts.get(source, 0) + 1
            all_jobs.extend(result)
        elif isinstance(result, Exception):
            logger.error("scrape_source_failed", error=str(result))
            state.errors.append(f"Scrape failed: {str(result)}")
    
    logger.info("raw_jobs_collected", count=len(all_jobs), sources=source_counts)
    
    # Deduplicate
    unique_jobs = deduplicate_jobs(all_jobs)
    logger.info("jobs_deduplicated", before=len(all_jobs), after=len(unique_jobs))
    
    # Filter by preferences
    filtered_jobs = filter_by_preferences(unique_jobs, preferences)
    logger.info("jobs_filtered", before=len(unique_jobs), after=len(filtered_jobs))
    
    # Convert to JobListing models
    job_listings = []
    for job in filtered_jobs:
        listing = JobListing(
            id=str(uuid.uuid4()),
            title=job.get("title", "Unknown Title"),
            company=job.get("company", "Unknown Company"),
            location=job.get("location", "Unknown"),
            salary_range=job.get("salary") or None,
            source=job.get("source", "unknown"),
            source_url=job.get("url", ""),
            posted_at=None,  # Would need proper parsing
            raw_description=job.get("description", ""),
            is_fresh=is_fresh_posting(job.get("posted_at")),
        )
        job_listings.append(listing)
    
    # Update state
    state.discovered_jobs = job_listings
    
    # Final event
    fresh_count = sum(1 for j in job_listings if j.is_fresh)
    state.add_event(
        AgentType.SCOUT,
        f"Found {len(job_listings)} jobs ({fresh_count} fresh) from {len(source_counts)} sources",
        AgentEventStatus.COMPLETED
    )
    
    logger.info(
        "scout_agent_completed",
        user_id=state.user_id,
        jobs_found=len(job_listings),
        fresh_jobs=fresh_count,
    )
    
    return state
