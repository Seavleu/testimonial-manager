from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid
from supabase import Client
from email_service import email_service

class NotificationService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    async def create_notification_preferences(self, user_id: str, email: str) -> Dict[str, Any]:
        """Create default notification preferences for a user"""
        try:
            preferences = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "email": email,
                "new_testimonial_notifications": True,
                "weekly_summary": True,
                "pending_reminders": True,
                "pending_reminder_threshold": 3,  # Send reminder when 3+ pending
                "reminder_frequency": "daily",  # daily, weekly
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table('notification_preferences').insert(preferences).execute()
            
            if result.data:
                return {"success": True, "preferences": result.data[0]}
            else:
                return {"success": False, "error": "Failed to create preferences"}
                
        except Exception as e:
            print(f"Error creating notification preferences: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_notification_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get notification preferences for a user"""
        try:
            result = self.supabase.table('notification_preferences').select('*').eq('user_id', user_id).execute()
            
            if result.data:
                return {"success": True, "preferences": result.data[0]}
            else:
                return {"success": False, "error": "Preferences not found"}
                
        except Exception as e:
            print(f"Error getting notification preferences: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def update_notification_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Update notification preferences for a user"""
        try:
            preferences['updated_at'] = datetime.utcnow().isoformat()
            
            result = self.supabase.table('notification_preferences').update(preferences).eq('user_id', user_id).execute()
            
            if result.data:
                return {"success": True, "preferences": result.data[0]}
            else:
                return {"success": False, "error": "Failed to update preferences"}
                
        except Exception as e:
            print(f"Error updating notification preferences: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def trigger_new_testimonial_notification(self, user_id: str, testimonial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger notification when a new testimonial is submitted"""
        try:
            # Get user preferences
            prefs_result = await self.get_notification_preferences(user_id)
            if not prefs_result['success']:
                return {"success": False, "error": "Could not get notification preferences"}
            
            preferences = prefs_result['preferences']
            
            # Check if new testimonial notifications are enabled
            if not preferences.get('new_testimonial_notifications', True):
                return {"success": True, "message": "Notifications disabled for this user"}
            
            # Send email notification
            email_result = await email_service.send_new_testimonial_notification(
                preferences['email'], 
                testimonial_data
            )
            
            # Log the notification
            await self._log_notification(
                user_id=user_id,
                notification_type="new_testimonial",
                status="sent" if email_result['success'] else "failed",
                data=testimonial_data
            )
            
            return email_result
            
        except Exception as e:
            print(f"Error triggering new testimonial notification: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_weekly_summary(self, user_id: str) -> Dict[str, Any]:
        """Send weekly summary email to user"""
        try:
            # Get user preferences
            prefs_result = await self.get_notification_preferences(user_id)
            if not prefs_result['success']:
                return {"success": False, "error": "Could not get notification preferences"}
            
            preferences = prefs_result['preferences']
            
            # Check if weekly summary is enabled
            if not preferences.get('weekly_summary', True):
                return {"success": True, "message": "Weekly summary disabled for this user"}
            
            # Get weekly statistics
            summary_data = await self._get_weekly_summary_data(user_id)
            
            # Send email
            email_result = await email_service.send_weekly_summary(
                preferences['email'], 
                summary_data
            )
            
            # Log the notification
            await self._log_notification(
                user_id=user_id,
                notification_type="weekly_summary",
                status="sent" if email_result['success'] else "failed",
                data=summary_data
            )
            
            return email_result
            
        except Exception as e:
            print(f"Error sending weekly summary: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_pending_reminder(self, user_id: str) -> Dict[str, Any]:
        """Send reminder for pending testimonials"""
        try:
            # Get user preferences
            prefs_result = await self.get_notification_preferences(user_id)
            if not prefs_result['success']:
                return {"success": False, "error": "Could not get notification preferences"}
            
            preferences = prefs_result['preferences']
            
            # Check if pending reminders are enabled
            if not preferences.get('pending_reminders', True):
                return {"success": True, "message": "Pending reminders disabled for this user"}
            
            # Get pending testimonials count
            pending_count = await self._get_pending_testimonials_count(user_id)
            threshold = preferences.get('pending_reminder_threshold', 3)
            
            # Only send if above threshold
            if pending_count < threshold:
                return {"success": True, "message": f"Only {pending_count} pending testimonials, below threshold of {threshold}"}
            
            # Send email
            email_result = await email_service.send_pending_reminder(
                preferences['email'], 
                pending_count
            )
            
            # Log the notification
            await self._log_notification(
                user_id=user_id,
                notification_type="pending_reminder",
                status="sent" if email_result['success'] else "failed",
                data={"pending_count": pending_count}
            )
            
            return email_result
            
        except Exception as e:
            print(f"Error sending pending reminder: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_weekly_summary_data(self, user_id: str) -> Dict[str, Any]:
        """Get weekly summary data for a user"""
        try:
            # Calculate date range for this week
            now = datetime.utcnow()
            week_start = now - timedelta(days=now.weekday())
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Get testimonials for this week
            result = self.supabase.table('testimonials').select('*').eq('user_id', user_id).gte('created_at', week_start.isoformat()).execute()
            
            testimonials = result.data if result.data else []
            
            # Calculate statistics
            total_testimonials = len(testimonials)
            new_testimonials = total_testimonials  # All testimonials in this week are new
            approved_testimonials = len([t for t in testimonials if t.get('status') == 'approved'])
            pending_testimonials = len([t for t in testimonials if t.get('status') == 'pending'])
            
            return {
                "total_testimonials": total_testimonials,
                "new_testimonials": new_testimonials,
                "approved_testimonials": approved_testimonials,
                "pending_testimonials": pending_testimonials,
                "week_start": week_start.isoformat(),
                "week_end": now.isoformat()
            }
            
        except Exception as e:
            print(f"Error getting weekly summary data: {str(e)}")
            return {
                "total_testimonials": 0,
                "new_testimonials": 0,
                "approved_testimonials": 0,
                "pending_testimonials": 0
            }
    
    async def _get_pending_testimonials_count(self, user_id: str) -> int:
        """Get count of pending testimonials for a user"""
        try:
            result = self.supabase.table('testimonials').select('id').eq('user_id', user_id).eq('status', 'pending').execute()
            return len(result.data) if result.data else 0
        except Exception as e:
            print(f"Error getting pending testimonials count: {str(e)}")
            return 0
    
    async def _log_notification(self, user_id: str, notification_type: str, status: str, data: Dict[str, Any]) -> None:
        """Log notification activity"""
        try:
            log_entry = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "notification_type": notification_type,
                "status": status,
                "data": data,
                "created_at": datetime.utcnow().isoformat()
            }
            
            self.supabase.table('notification_logs').insert(log_entry).execute()
            
        except Exception as e:
            print(f"Error logging notification: {str(e)}")
    
    async def get_notification_logs(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get notification logs for a user"""
        try:
            result = self.supabase.table('notification_logs').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            
            return {"success": True, "logs": result.data if result.data else []}
            
        except Exception as e:
            print(f"Error getting notification logs: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def unsubscribe_user(self, email: str) -> Dict[str, Any]:
        """Unsubscribe user from all notifications"""
        try:
            # Update preferences to disable all notifications
            update_data = {
                "new_testimonial_notifications": False,
                "weekly_summary": False,
                "pending_reminders": False,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table('notification_preferences').update(update_data).eq('email', email).execute()
            
            if result.data:
                return {"success": True, "message": "Successfully unsubscribed"}
            else:
                return {"success": False, "error": "User not found"}
                
        except Exception as e:
            print(f"Error unsubscribing user: {str(e)}")
            return {"success": False, "error": str(e)}
