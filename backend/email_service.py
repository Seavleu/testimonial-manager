from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration with environment variables
EMAIL_CONFIG = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "your-email@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "your-app-password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@testimonialflow.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailService:
    def __init__(self):
        self.fastmail = FastMail(EMAIL_CONFIG)
        self.from_email = EMAIL_CONFIG.MAIL_FROM
        self.delivery_logs = {}  # In-memory delivery tracking (in production, use database)
    
    async def send_new_testimonial_notification(
        self, 
        user_email: str, 
        testimonial_data: Dict[str, Any]
    ):
        """Send notification when a new testimonial is submitted"""
        subject = "New Testimonial Received - TestimonialFlow"
        
        html_content = self._create_new_testimonial_template(testimonial_data)
        
        message = MessageSchema(
            subject=subject,
            recipients=[user_email],
            body=html_content,
            subtype="html"
        )
        
        try:
            await self.fastmail.send_message(message)
            
            # Track delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "new_testimonial", "sent", testimonial_data)
            
            logger.info(f"New testimonial notification sent to {user_email}")
            return {"success": True, "message": "Email sent successfully", "delivery_id": delivery_id}
        except Exception as e:
            logger.error(f"Failed to send new testimonial email to {user_email}: {str(e)}")
            
            # Track failed delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "new_testimonial", "failed", {"error": str(e)})
            
            return {"success": False, "error": str(e), "delivery_id": delivery_id}
    
    async def send_weekly_summary(
        self, 
        user_email: str, 
        summary_data: Dict[str, Any]
    ):
        """Send weekly summary email"""
        subject = "Weekly Testimonial Summary - TestimonialFlow"
        
        html_content = self._create_weekly_summary_template(summary_data)
        
        message = MessageSchema(
            subject=subject,
            recipients=[user_email],
            body=html_content,
            subtype="html"
        )
        
        try:
            await self.fastmail.send_message(message)
            
            # Track delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "weekly_summary", "sent", summary_data)
            
            logger.info(f"Weekly summary sent to {user_email}")
            return {"success": True, "message": "Weekly summary sent successfully", "delivery_id": delivery_id}
        except Exception as e:
            logger.error(f"Failed to send weekly summary to {user_email}: {str(e)}")
            
            # Track failed delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "weekly_summary", "failed", {"error": str(e)})
            
            return {"success": False, "error": str(e), "delivery_id": delivery_id}
    
    async def send_pending_reminder(
        self, 
        user_email: str, 
        pending_count: int
    ):
        """Send reminder for pending testimonials"""
        subject = f"You have {pending_count} pending testimonials - TestimonialFlow"
        
        html_content = self._create_pending_reminder_template(pending_count)
        
        message = MessageSchema(
            subject=subject,
            recipients=[user_email],
            body=html_content,
            subtype="html"
        )
        
        try:
            await self.fastmail.send_message(message)
            
            # Track delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "pending_reminder", "sent", {"pending_count": pending_count})
            
            logger.info(f"Pending reminder sent to {user_email}")
            return {"success": True, "message": "Reminder sent successfully", "delivery_id": delivery_id}
        except Exception as e:
            logger.error(f"Failed to send pending reminder to {user_email}: {str(e)}")
            
            # Track failed delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "pending_reminder", "failed", {"error": str(e)})
            
            return {"success": False, "error": str(e), "delivery_id": delivery_id}
    
    async def send_welcome_email(self, user_email: str, user_name: str = None):
        """Send welcome email to new users"""
        subject = "Welcome to TestimonialFlow! 🎉"
        
        html_content = self._create_welcome_template(user_name or user_email)
        
        message = MessageSchema(
            subject=subject,
            recipients=[user_email],
            body=html_content,
            subtype="html"
        )
        
        try:
            await self.fastmail.send_message(message)
            
            # Track delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "welcome", "sent", {"user_name": user_name})
            
            logger.info(f"Welcome email sent to {user_email}")
            return {"success": True, "message": "Welcome email sent successfully", "delivery_id": delivery_id}
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
            
            # Track failed delivery
            delivery_id = str(uuid.uuid4())
            self._track_delivery(delivery_id, user_email, "welcome", "failed", {"error": str(e)})
            
            return {"success": False, "error": str(e), "delivery_id": delivery_id}
    
    def _track_delivery(self, delivery_id: str, email: str, email_type: str, status: str, data: Dict[str, Any]):
        """Track email delivery status"""
        self.delivery_logs[delivery_id] = {
            "delivery_id": delivery_id,
            "email": email,
            "email_type": email_type,
            "status": status,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_delivery_status(self, delivery_id: str) -> Optional[Dict[str, Any]]:
        """Get delivery status for a specific email"""
        return self.delivery_logs.get(delivery_id)
    
    def get_delivery_logs(self, email: str = None, email_type: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get delivery logs with optional filtering"""
        logs = list(self.delivery_logs.values())
        
        if email:
            logs = [log for log in logs if log["email"] == email]
        
        if email_type:
            logs = [log for log in logs if log["email_type"] == email_type]
        
        # Sort by timestamp (newest first) and limit
        logs.sort(key=lambda x: x["timestamp"], reverse=True)
        return logs[:limit]
    
    def _create_welcome_template(self, user_name: str) -> str:
        """Create HTML template for welcome email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to TestimonialFlow</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .features {{ display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }}
                .feature {{ background: white; padding: 15px; border-radius: 6px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to TestimonialFlow!</h1>
                </div>
                <div class="content">
                    <p>Hello {user_name}!</p>
                    <p>Welcome to TestimonialFlow - the platform that helps you collect, manage, and display customer testimonials effectively.</p>
                    
                    <div class="features">
                        <div class="feature">
                            <h3>📝 Easy Collection</h3>
                            <p>Collect testimonials from your customers with our simple forms</p>
                        </div>
                        <div class="feature">
                            <h3>🎨 Beautiful Widgets</h3>
                            <p>Display testimonials on your website with customizable widgets</p>
                        </div>
                        <div class="feature">
                            <h3>📊 Analytics</h3>
                            <p>Track your testimonial performance with detailed analytics</p>
                        </div>
                        <div class="feature">
                            <h3>⚡ Automation</h3>
                            <p>Automate testimonial management with smart rules</p>
                        </div>
                    </div>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="button">
                        Get Started
                    </a>
                    
                    <p>We're excited to help you build trust and credibility with authentic customer testimonials!</p>
                </div>
                <div class="footer">
                    <p>This email was sent from TestimonialFlow. You can manage your notification preferences in your account settings.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _create_new_testimonial_template(self, testimonial_data: Dict[str, Any]) -> str:
        """Create HTML template for new testimonial notification"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>New Testimonial Received</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                .testimonial {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; border-radius: 4px; }}
                .button {{ display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 New Testimonial Received!</h1>
                </div>
                <div class="content">
                    <p>Hello!</p>
                    <p>You've received a new testimonial from <strong>{testimonial_data.get('name', 'Anonymous')}</strong>.</p>
                    
                    <div class="testimonial">
                        <p><em>"{testimonial_data.get('text', '')}"</em></p>
                        <p><strong>- {testimonial_data.get('name', 'Anonymous')}</strong></p>
                    </div>
                    
                    <p>This testimonial is currently pending approval. You can review and manage it in your dashboard.</p>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="button">
                        View in Dashboard
                    </a>
                    
                    <p>Thank you for using TestimonialFlow!</p>
                </div>
                <div class="footer">
                    <p>This email was sent from TestimonialFlow. You can manage your notification preferences in your account settings.</p>
                    <p><a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/unsubscribe?email={{user_email}}">Unsubscribe</a></p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _create_weekly_summary_template(self, summary_data: Dict[str, Any]) -> str:
        """Create HTML template for weekly summary"""
        total_testimonials = summary_data.get('total_testimonials', 0)
        new_testimonials = summary_data.get('new_testimonials', 0)
        approved_testimonials = summary_data.get('approved_testimonials', 0)
        pending_testimonials = summary_data.get('pending_testimonials', 0)
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Weekly Testimonial Summary</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                .stats {{ display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }}
                .stat-card {{ background: white; padding: 15px; text-align: center; border-radius: 6px; }}
                .stat-number {{ font-size: 24px; font-weight: bold; color: #4F46E5; }}
                .button {{ display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Weekly Testimonial Summary</h1>
                </div>
                <div class="content">
                    <p>Hello!</p>
                    <p>Here's your weekly testimonial activity summary:</p>
                    
                    <div class="stats">
                        <div class="stat-card">
                            <div class="stat-number">{total_testimonials}</div>
                            <div>Total Testimonials</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">{new_testimonials}</div>
                            <div>New This Week</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">{approved_testimonials}</div>
                            <div>Approved</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">{pending_testimonials}</div>
                            <div>Pending Review</div>
                        </div>
                    </div>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="button">
                        View Full Dashboard
                    </a>
                    
                    <p>Keep up the great work with your testimonial collection!</p>
                </div>
                <div class="footer">
                    <p>This email was sent from TestimonialFlow. You can manage your notification preferences in your account settings.</p>
                    <p><a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/unsubscribe?email={{user_email}}">Unsubscribe</a></p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _create_pending_reminder_template(self, pending_count: int) -> str:
        """Create HTML template for pending testimonial reminder"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pending Testimonials Reminder</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                .highlight {{ background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 15px 0; }}
                .button {{ display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⏰ Pending Testimonials Reminder</h1>
                </div>
                <div class="content">
                    <p>Hello!</p>
                    <p>You have <strong>{pending_count} testimonial(s)</strong> waiting for your review.</p>
                    
                    <div class="highlight">
                        <p><strong>Quick Action Needed:</strong></p>
                        <p>Please review and approve/reject these testimonials to keep your testimonial flow active and engaging.</p>
                    </div>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="button">
                        Review Testimonials
                    </a>
                    
                    <p>Thank you for using TestimonialFlow!</p>
                </div>
                <div class="footer">
                    <p>This email was sent from TestimonialFlow. You can manage your notification preferences in your account settings.</p>
                    <p><a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/unsubscribe?email={{user_email}}">Unsubscribe</a></p>
                </div>
            </div>
        </body>
        </html>
        """

# Global email service instance
email_service = EmailService()
