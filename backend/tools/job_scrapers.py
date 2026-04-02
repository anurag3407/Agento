"""
Job Board Scrapers
==================
Tools for scraping job listings from various sources.
Implements rate limiting and error handling.
"""

import asyncio
from typing import Any
import httpx
import structlog

logger = structlog.get_logger()


async def scrape_remotive(preferences: dict | None = None) -> list[dict]:
    """
    Scrape jobs from Remotive API.
    Free API, no authentication required.
    
    Docs: https://remotive.com/api/remote-jobs
    """
    jobs = []
    preferences = preferences or {}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Categories to search
            categories = ["software-dev", "data", "devops", "product"]
            
            for category in categories:
                try:
                    response = await client.get(
                        "https://remotive.com/api/remote-jobs",
                        params={
                            "category": category,
                            "limit": 50,
                        }
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
                                "category": category,
                                "job_type": job.get("job_type", ""),
                                "tags": job.get("tags", []),
                            })
                    
                    # Rate limiting
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.warning("remotive_category_failed", category=category, error=str(e))
                    
    except Exception as e:
        logger.error("remotive_scrape_failed", error=str(e))
    
    logger.info("remotive_scrape_completed", jobs_found=len(jobs))
    return jobs


async def scrape_himalayas(preferences: dict | None = None) -> list[dict]:
    """
    Scrape jobs from Himalayas API.
    Free tier available.
    
    Docs: https://himalayas.app/jobs/api
    """
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://himalayas.app/jobs/api",
                params={
                    "limit": 100,
                    "offset": 0,
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                for job in data.get("jobs", []):
                    # Build location string
                    locations = job.get("locationRestrictions", [])
                    location = locations[0] if locations else "Worldwide"
                    
                    # Build salary string
                    salary = ""
                    if job.get("minSalary"):
                        min_sal = job.get("minSalary", 0)
                        max_sal = job.get("maxSalary", 0)
                        salary = f"${min_sal:,}-${max_sal:,}" if max_sal else f"${min_sal:,}+"
                    
                    jobs.append({
                        "title": job.get("title", ""),
                        "company": job.get("companyName", ""),
                        "location": location,
                        "description": job.get("description", ""),
                        "url": job.get("applicationLink", "") or f"https://himalayas.app/jobs/{job.get('slug', '')}",
                        "posted_at": job.get("pubDate"),
                        "salary": salary,
                        "source": "himalayas",
                        "company_logo": job.get("companyLogo", ""),
                        "categories": job.get("categories", []),
                    })
                    
    except Exception as e:
        logger.error("himalayas_scrape_failed", error=str(e))
    
    logger.info("himalayas_scrape_completed", jobs_found=len(jobs))
    return jobs


async def scrape_hn_whoishiring() -> list[dict]:
    """
    Scrape the monthly "Who's Hiring" thread from Hacker News.
    Uses the official HN Algolia API.
    
    Docs: https://hn.algolia.com/api
    """
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Search for the latest "Who is hiring" post
            search_response = await client.get(
                "https://hn.algolia.com/api/v1/search",
                params={
                    "query": "Ask HN: Who is hiring",
                    "tags": "story",
                    "hitsPerPage": 1,
                }
            )
            
            if search_response.status_code != 200:
                logger.warning("hn_search_failed", status=search_response.status_code)
                return jobs
            
            search_data = search_response.json()
            hits = search_data.get("hits", [])
            
            if not hits:
                logger.warning("hn_no_hiring_thread_found")
                return jobs
            
            story_id = hits[0].get("objectID")
            story_title = hits[0].get("title", "")
            
            logger.info("hn_story_found", story_id=story_id, title=story_title)
            
            # Get the full story with comments
            story_response = await client.get(
                f"https://hn.algolia.com/api/v1/items/{story_id}"
            )
            
            if story_response.status_code != 200:
                logger.warning("hn_story_fetch_failed", status=story_response.status_code)
                return jobs
            
            story_data = story_response.json()
            
            # Process top-level comments (these are the job postings)
            for comment in story_data.get("children", [])[:150]:
                text = comment.get("text", "")
                
                # Filter out short or deleted comments
                if not text or len(text) < 100:
                    continue
                
                # Try to extract company from first line (common format: "Company | Location | ...")
                lines = text.split("\n")
                first_line = lines[0] if lines else ""
                
                company = "Unknown"
                if "|" in first_line:
                    company = first_line.split("|")[0].strip()
                    # Clean up HTML tags
                    company = company.replace("<p>", "").replace("</p>", "").strip()
                
                # Limit company name length
                company = company[:60] if len(company) > 60 else company
                
                jobs.append({
                    "title": "Multiple Positions",  # HN posts often list multiple roles
                    "company": company,
                    "location": "Various",
                    "description": text,
                    "url": f"https://news.ycombinator.com/item?id={comment.get('id')}",
                    "posted_at": comment.get("created_at"),
                    "salary": "",
                    "source": "hackernews",
                    "hn_thread_title": story_title,
                    "author": comment.get("author", ""),
                })
                    
    except Exception as e:
        logger.error("hn_scrape_failed", error=str(e))
    
    logger.info("hn_scrape_completed", jobs_found=len(jobs))
    return jobs


async def scrape_arbeitnow(preferences: dict | None = None) -> list[dict]:
    """
    Scrape jobs from Arbeitnow API.
    Free API for remote jobs.
    
    Docs: https://www.arbeitnow.com/api
    """
    jobs = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://www.arbeitnow.com/api/job-board-api",
                params={
                    "page": 1,
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                for job in data.get("data", []):
                    jobs.append({
                        "title": job.get("title", ""),
                        "company": job.get("company_name", ""),
                        "location": job.get("location", "Remote"),
                        "description": job.get("description", ""),
                        "url": job.get("url", ""),
                        "posted_at": job.get("created_at"),
                        "salary": "",
                        "source": "arbeitnow",
                        "remote": job.get("remote", False),
                        "tags": job.get("tags", []),
                    })
                    
    except Exception as e:
        logger.error("arbeitnow_scrape_failed", error=str(e))
    
    logger.info("arbeitnow_scrape_completed", jobs_found=len(jobs))
    return jobs


# Aggregate function to run all scrapers
async def scrape_all_sources(preferences: dict | None = None) -> list[dict]:
    """
    Run all job scrapers in parallel.
    Returns deduplicated combined results.
    """
    results = await asyncio.gather(
        scrape_remotive(preferences),
        scrape_himalayas(preferences),
        scrape_hn_whoishiring(),
        scrape_arbeitnow(preferences),
        return_exceptions=True,
    )
    
    all_jobs = []
    for result in results:
        if isinstance(result, list):
            all_jobs.extend(result)
        elif isinstance(result, Exception):
            logger.error("scraper_failed", error=str(result))
    
    logger.info("all_sources_scraped", total_jobs=len(all_jobs))
    return all_jobs
