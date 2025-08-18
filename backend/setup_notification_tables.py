import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def setup_notification_tables():
    """Set up notification-related tables in Supabase"""
    
    print("Setting up notification tables...")
    
    # SQL commands to create the tables
    sql_commands = [
        """
        -- Create notification_preferences table
        CREATE TABLE IF NOT EXISTS notification_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            email TEXT NOT NULL,
            new_testimonial_notifications BOOLEAN DEFAULT true,
            weekly_summary BOOLEAN DEFAULT true,
            pending_reminders BOOLEAN DEFAULT true,
            pending_reminder_threshold INTEGER DEFAULT 3,
            reminder_frequency TEXT DEFAULT 'daily',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        """
        -- Create notification_logs table
        CREATE TABLE IF NOT EXISTS notification_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            notification_type TEXT NOT NULL,
            status TEXT NOT NULL,
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        """
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
        ON notification_preferences(user_id);
        
        CREATE INDEX IF NOT EXISTS idx_notification_preferences_email 
        ON notification_preferences(email);
        
        CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id 
        ON notification_logs(user_id);
        
        CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at 
        ON notification_logs(created_at DESC);
        """
    ]
    
    try:
        # Execute each SQL command
        for i, sql in enumerate(sql_commands, 1):
            print(f"Executing command {i}...")
            result = supabase.rpc('exec_sql', {'sql': sql}).execute()
            print(f"Command {i} completed successfully")
            
        print("✅ All notification tables created successfully!")
        
        # Test the tables by inserting sample data
        print("\nTesting tables with sample data...")
        
        # Insert sample notification preferences
        sample_preferences = {
            "user_id": "9cc8bdcb-b65a-4bf2-a248-2da5d5cd1556",  # Your user ID
            "email": "test@example.com",
            "new_testimonial_notifications": True,
            "weekly_summary": True,
            "pending_reminders": True,
            "pending_reminder_threshold": 3,
            "reminder_frequency": "daily"
        }
        
        result = supabase.table('notification_preferences').insert(sample_preferences).execute()
        print("✅ Sample notification preferences inserted")
        
        # Insert sample notification logs
        sample_logs = [
            {
                "user_id": "9cc8bdcb-b65a-4bf2-a248-2da5d5cd1556",
                "notification_type": "new_testimonial",
                "status": "sent",
                "data": {"name": "John Doe", "text": "Great service!"}
            },
            {
                "user_id": "9cc8bdcb-b65a-4bf2-a248-2da5d5cd1556",
                "notification_type": "weekly_summary",
                "status": "sent",
                "data": {"total_testimonials": 5, "new_testimonials": 2}
            }
        ]
        
        for log in sample_logs:
            supabase.table('notification_logs').insert(log).execute()
        print("✅ Sample notification logs inserted")
        
        print("\n🎉 Notification system setup complete!")
        
    except Exception as e:
        print(f"❌ Error setting up tables: {str(e)}")
        print("\nNote: If you're getting permission errors, you may need to:")
        print("1. Use the Supabase dashboard to create these tables manually")
        print("2. Or ensure your service role key has the necessary permissions")

if __name__ == "__main__":
    setup_notification_tables()
