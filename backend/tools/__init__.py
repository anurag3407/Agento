# Tools module for CareerPilot agents
from .job_scrapers import (
    scrape_remotive,
    scrape_himalayas,
    scrape_hn_whoishiring,
)
from .company_research import (
    fetch_company_info,
    fetch_company_news,
)
from .email import email_client

__all__ = [
    "scrape_remotive",
    "scrape_himalayas",
    "scrape_hn_whoishiring",
    "fetch_company_info",
    "fetch_company_news",
    "email_client",
]
