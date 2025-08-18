#!/usr/bin/env python3

import os
import sys
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_backend_connection():
    """Test if the backend server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running. Start it with: python main.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {str(e)}")
        return False

def test_analytics_endpoint(user_id):
    """Test the analytics endpoint with a specific user ID"""
    try:
        print(f"\n🔍 Testing analytics endpoint for user: {user_id}")
        
        # Test analytics stats endpoint
        response = requests.get(f"http://localhost:8000/analytics/{user_id}/stats", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Analytics endpoint working!")
            print(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Analytics endpoint failed with status {response.status_code}")
            print(f"Error response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to analytics endpoint")
        return False
    except Exception as e:
        print(f"❌ Error testing analytics endpoint: {str(e)}")
        return False

def test_testimonials_endpoint(user_id):
    """Test the testimonials endpoint to see if data exists"""
    try:
        print(f"\n🔍 Testing testimonials endpoint for user: {user_id}")
        
        response = requests.get(f"http://localhost:8000/testimonials/{user_id}", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            testimonials = data.get('testimonials', [])
            print(f"✅ Found {len(testimonials)} testimonials for user")
            
            if testimonials:
                print("Sample testimonial structure:")
                print(json.dumps(testimonials[0], indent=2))
            else:
                print("⚠️  No testimonials found for this user")
            
            return len(testimonials) > 0
        else:
            print(f"❌ Testimonials endpoint failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing testimonials endpoint: {str(e)}")
        return False

def find_existing_users():
    """Try to find existing user IDs in the database"""
    print("\n🔍 Looking for existing users...")
    
    # Common test user IDs to try
    test_user_ids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "test-user-123",
        "demo-user-456",
        "user-123",
        "admin"
    ]
    
    found_users = []
    
    for user_id in test_user_ids:
        try:
            response = requests.get(f"http://localhost:8000/testimonials/{user_id}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                testimonials = data.get('testimonials', [])
                if testimonials:
                    found_users.append((user_id, len(testimonials)))
                    print(f"✅ Found user {user_id} with {len(testimonials)} testimonials")
        except:
            continue
    
    if not found_users:
        print("❌ No existing users found with testimonials")
        print("💡 You may need to add test data first")
    
    return found_users

def main():
    """Main test function"""
    print("🚀 Analytics Debug Test Script")
    print("=" * 50)
    
    # Step 1: Test backend connection
    if not test_backend_connection():
        return
    
    # Step 2: Find existing users
    existing_users = find_existing_users()
    
    # Step 3: Test analytics with found users
    if existing_users:
        for user_id, count in existing_users:
            test_analytics_endpoint(user_id)
            break  # Test with first user found
    else:
        # Test with a default user ID
        print("\n🔍 Testing with default user ID...")
        test_analytics_endpoint("550e8400-e29b-41d4-a716-446655440000")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    main()
