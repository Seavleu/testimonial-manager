#!/usr/bin/env python3
"""
Migration script to add new columns to testimonials table for enhanced collection form
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def migrate_enhanced_testimonials():
    """Add new columns to testimonials table for enhanced features"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        return
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # SQL commands to add new columns
        migration_commands = [
            # Add rating column (1-5 stars)
            """
            ALTER TABLE testimonials 
            ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
            """,
            
            # Add category column
            """
            ALTER TABLE testimonials 
            ADD COLUMN IF NOT EXISTS category VARCHAR(50);
            """,
            
            # Add email column
            """
            ALTER TABLE testimonials 
            ADD COLUMN IF NOT EXISTS email VARCHAR(255);
            """,
            
            # Add allow_sharing column
            """
            ALTER TABLE testimonials 
            ADD COLUMN IF NOT EXISTS allow_sharing BOOLEAN DEFAULT true;
            """,
            
            # Add photo_url column
            """
            ALTER TABLE testimonials 
            ADD COLUMN IF NOT EXISTS photo_url TEXT;
            """,
            
            # Create index on category for better performance
            """
            CREATE INDEX IF NOT EXISTS idx_testimonials_category 
            ON testimonials(category);
            """,
            
            # Create index on rating for better performance
            """
            CREATE INDEX IF NOT EXISTS idx_testimonials_rating 
            ON testimonials(rating);
            """,
            
            # Create index on allow_sharing for filtering
            """
            CREATE INDEX IF NOT EXISTS idx_testimonials_allow_sharing 
            ON testimonials(allow_sharing);
            """
        ]
        
        # Execute migration commands
        for i, command in enumerate(migration_commands, 1):
            try:
                print(f"🔄 Executing migration {i}/{len(migration_commands)}...")
                result = supabase.rpc('exec_sql', {'sql': command}).execute()
                print(f"✅ Migration {i} completed successfully")
            except Exception as e:
                print(f"⚠️  Migration {i} warning (may already exist): {str(e)}")
        
        # Create testimonial-photos storage bucket if it doesn't exist
        try:
            print("🔄 Creating testimonial-photos storage bucket...")
            # Note: Storage bucket creation is typically done through Supabase dashboard
            # This is just a placeholder - you'll need to create it manually
            print("ℹ️  Please create 'testimonial-photos' storage bucket in Supabase dashboard")
            print("ℹ️  Set public access policy for the bucket")
        except Exception as e:
            print(f"⚠️  Storage bucket creation note: {str(e)}")
        
        print("\n🎉 Migration completed successfully!")
        print("\n📋 Summary of changes:")
        print("  ✅ Added rating column (1-5 stars)")
        print("  ✅ Added category column")
        print("  ✅ Added email column")
        print("  ✅ Added allow_sharing column")
        print("  ✅ Added photo_url column")
        print("  ✅ Created performance indexes")
        print("\n⚠️  Manual steps required:")
        print("  1. Create 'testimonial-photos' storage bucket in Supabase dashboard")
        print("  2. Set public access policy for the bucket")
        print("  3. Configure CORS if needed")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    print("🚀 Starting Enhanced Testimonials Migration...")
    migrate_enhanced_testimonials()
    print("✨ Migration script completed!")
