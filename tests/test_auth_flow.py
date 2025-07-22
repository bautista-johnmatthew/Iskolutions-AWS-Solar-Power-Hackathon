#!/usr/bin/env python3
"""
Test script for Supabase authentication with email confirmation flow
Move this file beside the main.py file in the api directory to test
"""

import os
from dotenv import load_dotenv
from services.aws_clients import AWSClients
from services.auth_service import AuthService
from models.forum_models import UserRole

load_dotenv()

def test_registration_flow():
    """Test the complete registration and email confirmation flow"""
    
    print("🚀 Testing Supabase Authentication Flow")
    print("=" * 50)
    
    # Initialize services
    try:
        aws_clients = AWSClients()
        auth_service = AuthService(aws_clients)
        print("✅ AuthService initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize AuthService: {e}")
        return
    
    # Test user data
    test_email = "test@email"
    test_username = "testuser1"
    test_password = "SecurePassword123!"
    
    print(f"\n📧 Testing registration for: {test_email}")
    
    try:
        # Step 1: Register user
        print("\n1️⃣ Attempting user registration...")
        registration_result = auth_service.register(
            username=test_username,
            email=test_email,
            password=test_password,
            role=UserRole.STUDENT,
            student_id="2021-00001"
        )
        
        print(f"✅ Registration successful!")
        print(f"📝 Result: {registration_result}")
        
        if registration_result.get("requires_confirmation"):
            print(f"\n📬 {registration_result.get('message')}")
            print("📋 Next steps:")
            print("   1. Check your email for confirmation link")
            print("   2. Click the confirmation link")
            print("   3. Or use the confirm_email method with the token")
    except Exception as e:
        print(f"❌ Registration failed: {e}")
        if "already registered" in str(e).lower():
            print("📋 User already exists, testing login instead...")
            try:
                login_result = auth_service.login(test_email, test_password)
                print(f"✅ Login successful: {login_result}")
            except Exception as login_error:
                print(f"❌ Login also failed: {login_error}")

def test_email_confirmation(token, email):
    """Test email confirmation with a token (you'd get this from email)"""
    
    print("\n🔑 Testing Email Confirmation")
    print("=" * 30)
    
    # You would get this token from the email confirmation link
    # This is just an example - replace with actual token from email
    
    try:
        aws_clients = AWSClients()
        auth_service = AuthService(aws_clients)
        
        confirmation_result = auth_service.confirm_email(token, email)
        print(f"✅ Email confirmation result: {confirmation_result}")
        
    except Exception as e:
        print(f"❌ Email confirmation failed: {e}")
        print("📋 Note: You need a valid OTP token from your email")


if __name__ == "__main__":
    # check_supabase_settings()
    test_registration_flow()
    
    print("\n" + "=" * 60)
    print("🔍 Manual Testing Instructions:")
    print("=" * 60)
    print("1. Run this script to register a user")
    print("2. Check your email for confirmation link")
    print("3. Extract the token from the email URL")
    print("4. Use test_email_confirmation() with the real token")
    print("5. Try logging in after confirmation")
    
    # Uncomment and provide real token to test confirmation

    test_token = input("Enter the confirmation token from your email: ")
    test_email = "test@email"
    test_email_confirmation(test_token, test_email)
