"""
Email Utility
=============
SMTP-based email sending using aiosmtplib (like Nodemailer).
"""

import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import structlog

logger = structlog.get_logger()


class EmailClient:
    """Async email client using SMTP."""
    
    def __init__(self):
        self.host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.port = int(os.getenv("SMTP_PORT", "587"))
        self.user = os.getenv("SMTP_USER", "")
        self.password = os.getenv("SMTP_PASS", "")
        self.from_email = os.getenv("EMAIL_FROM", "CareerPilot <noreply@careerpilot.app>")
        self.enabled = bool(self.user and self.password)
    
    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        text_body: str | None = None
    ) -> bool:
        """
        Send an email via SMTP.
        
        Args:
            to: Recipient email address
            subject: Email subject
            html_body: HTML content
            text_body: Plain text content (optional)
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.enabled:
            logger.warning("email_not_configured", to=to, subject=subject)
            return False
        
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to
            
            # Add text and HTML parts
            if text_body:
                msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))
            
            # Send via SMTP
            await aiosmtplib.send(
                msg,
                hostname=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                start_tls=True,
            )
            
            logger.info("email_sent", to=to, subject=subject)
            return True
            
        except Exception as e:
            logger.error("email_send_failed", error=str(e), to=to)
            return False
    
    async def send_daily_digest(
        self,
        to: str,
        digest_html: str,
        new_jobs_count: int,
        top_match_score: int
    ) -> bool:
        """Send the daily job digest email."""
        subject = f"🎯 CareerPilot: {new_jobs_count} new jobs found (Top match: {top_match_score}%)"
        
        text_body = f"""
CareerPilot Daily Digest

{new_jobs_count} new jobs discovered today.
Top match score: {top_match_score}%

Visit your dashboard to see all matches.
"""
        
        return await self.send_email(to, subject, digest_html, text_body)


# Singleton instance
email_client = EmailClient()
