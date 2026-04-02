"""
Company Research Tools
======================
Tools for gathering company information and news.
Used to personalize cover letters and interview prep.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Any
import httpx
import structlog

logger = structlog.get_logger()


async def fetch_company_info(company_name: str) -> dict:
    """
    Fetch basic company information.
    Uses free APIs and public data.
    
    Returns company details including size, industry, description.
    """
    info = {
        "name": company_name,
        "description": None,
        "size": None,
        "industry": None,
        "founded": None,
        "headquarters": None,
        "website": None,
        "linkedin": None,
        "glassdoor_rating": None,
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Try to get basic info from Clearbit (free tier)
            # Note: Clearbit has been acquired, may need alternative
            
            # Wikipedia API for company description
            wiki_response = await client.get(
                "https://en.wikipedia.org/api/rest_v1/page/summary/" + company_name.replace(" ", "_")
            )
            
            if wiki_response.status_code == 200:
                wiki_data = wiki_response.json()
                info["description"] = wiki_data.get("extract", "")[:500]
                
    except Exception as e:
        logger.warning("company_info_fetch_failed", company=company_name, error=str(e))
    
    return info


async def fetch_company_news(company_name: str, days: int = 30) -> list[dict]:
    """
    Fetch recent news about a company.
    Used for cover letter personalization.
    
    Returns list of news articles with title, source, date, summary.
    """
    news = []
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Use free news API (NewsAPI has free tier)
            # Note: Would need API key in production
            
            # Alternative: Use Google News RSS
            rss_url = f"https://news.google.com/rss/search?q={company_name}+company&hl=en-US"
            
            response = await client.get(rss_url)
            
            if response.status_code == 200:
                # Parse RSS (simplified - would use feedparser in production)
                from xml.etree import ElementTree
                
                try:
                    root = ElementTree.fromstring(response.text)
                    channel = root.find("channel")
                    
                    if channel:
                        for item in channel.findall("item")[:5]:  # Top 5 news
                            title = item.find("title")
                            link = item.find("link")
                            pub_date = item.find("pubDate")
                            
                            news.append({
                                "title": title.text if title is not None else "",
                                "url": link.text if link is not None else "",
                                "date": pub_date.text if pub_date is not None else "",
                                "source": "Google News",
                            })
                            
                except Exception as parse_error:
                    logger.warning("news_rss_parse_failed", error=str(parse_error))
                    
    except Exception as e:
        logger.warning("company_news_fetch_failed", company=company_name, error=str(e))
    
    logger.info("company_news_fetched", company=company_name, articles=len(news))
    return news


async def fetch_glassdoor_reviews(company_name: str) -> dict:
    """
    Fetch Glassdoor review summary.
    Note: Glassdoor doesn't have a public API, so this would need scraping
    or use of a third-party service in production.
    
    Returns rating summary and culture insights.
    """
    # Placeholder - would implement scraping or use API service
    return {
        "overall_rating": None,
        "work_life_balance": None,
        "culture": None,
        "career_growth": None,
        "management": None,
        "pros": [],
        "cons": [],
    }


async def fetch_tech_stack(company_name: str) -> list[str]:
    """
    Try to determine a company's tech stack.
    Uses StackShare, GitHub, and job postings.
    """
    tech_stack = []
    
    try:
        # Check BuiltWith or similar (would need API)
        # Check company's GitHub org (if public)
        # Analyze job postings for common technologies
        
        pass  # Placeholder
        
    except Exception as e:
        logger.warning("tech_stack_fetch_failed", company=company_name, error=str(e))
    
    return tech_stack


async def get_company_context(company_name: str) -> dict:
    """
    Aggregate all company research into a context object.
    Used by Writer agent for cover letter personalization.
    """
    # Run all research in parallel
    info, news = await asyncio.gather(
        fetch_company_info(company_name),
        fetch_company_news(company_name),
    )
    
    return {
        "info": info,
        "news": news,
        "recent_highlights": [n["title"] for n in news[:3]] if news else [],
    }
