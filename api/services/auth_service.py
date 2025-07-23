# api/services/auth_service.py
import supabase
from typing import Dict, Optional
from models.forum_models import user_pk, UserRole, get_timestamp
from services.aws_clients import AWSClients
import os

class AuthService:
    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table
        
        # Initialize Supabase client
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase = supabase.create_client(self.supabase_url, self.supabase_key)

    def _extract_user_data_from_supabase(self, supabase_user) -> Dict:
        """Extract user data from Supabase user object"""
        return {
            "user_id": supabase_user.user.id,
            "email": supabase_user.user.email,
            "username": supabase_user.user.user_metadata.get("username", supabase_user.user.email.split("@")[0]),
            "role": supabase_user.user.user_metadata.get("role", UserRole.STUDENT),
            "student_id": supabase_user.user.user_metadata.get("student_id"),
            "is_verified": supabase_user.user.email_confirmed_at is not None,
            "created_at": supabase_user.user.created_at,
            "updated_at": supabase_user.user.updated_at
        }

    def _format_user_session(self, user_data: Dict, access_token: str) -> Dict:
        """Format user data for frontend session as expected by session-manager-vanilla.js
        
        Returns the session object format:
        {
            "id": "user-123",
            "email": "user@pup.edu.ph", 
            "name": "John Doe",
            "token": "jwt-token-here"
        }
        """
        return {
            "id": user_data["user_id"],
            "email": user_data["email"],
            "name": user_data["username"],
            "token": access_token
        }

    def register(self, username: str, email: str, password: str, 
                 role: UserRole = UserRole.STUDENT, 
                 student_id: Optional[str] = None) -> Dict:
        """Register a new user using Supabase Auth"""
        try:
            # Sign up with Supabase
            auth_response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "username": username,
                        "role": role.value,
                        "student_id": student_id
                    }
                }
            })
            
            if auth_response.user is None:
                raise ValueError("Registration failed")
            
            # Extract user data
            user_data = self._extract_user_data_from_supabase(auth_response)
            
            # Store additional user data in DynamoDB
            user_id = auth_response.user.id
            timestamp = get_timestamp()
            
            user_item = {
                "PK": user_pk(user_id),
                "SK": "PROFILE",
                "user_id": user_id,
                "username": username,
                "email": email,
                "role": role,
                "student_id": student_id,
                "is_verified": auth_response.user.email_confirmed_at is not None,
                "created_at": timestamp,
                "updated_at": timestamp
            }
            
            # Store user profile in DynamoDB
            self.table.put_item(Item=user_item)
            
            # Handle session token based on email confirmation requirement
            if auth_response.session and auth_response.session.access_token:
                # User is automatically logged in (email confirmation disabled)
                access_token = auth_response.session.access_token
                return self._format_user_session(user_data, access_token)
            else:
                # Email confirmation required - return user info without session
                return {
                    "id": user_data["user_id"],
                    "email": user_data["email"],
                    "name": user_data["username"],
                    "token": None,
                    "message": "Please check your email and confirm your account before logging in.",
                    "requires_confirmation": True
                }
            
        except Exception as e:
            if "already registered" in str(e).lower() or "User already registered" in str(e):
                raise ValueError("User with this email already exists")
            raise ValueError(f"Registration failed: {str(e)}")

    def login(self, username: str, password: str) -> Dict:
        """Login user with username and password using Supabase Auth"""
        try:
            # First, get the user by username to find their email
            user_profile = self.get_user_by_username(username)
            if not user_profile:
                raise ValueError("Invalid username or password")
            
            email = user_profile["email"]
            
            # Sign in with Supabase using email (since Supabase uses email for auth)
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if auth_response.user is None:
                raise ValueError("Invalid username or password")
            
            # Check if session exists
            if auth_response.session is None or auth_response.session.access_token is None:
                raise ValueError("Login failed - no session created")
            
            # Extract user data
            user_data = self._extract_user_data_from_supabase(auth_response)
            
            # Update last login in DynamoDB
            user_id = auth_response.user.id
            try:
                self.table.update_item(
                    Key={"PK": user_pk(user_id), "SK": "PROFILE"},
                    UpdateExpression="SET last_login = :last_login, updated_at = :updated_at",
                    ExpressionAttributeValues={
                        ":last_login": get_timestamp(),
                        ":updated_at": get_timestamp()
                    }
                )
            except:
                # If user doesn't exist in DynamoDB, create profile
                self._sync_user_to_dynamodb(auth_response.user)
            
            # Return formatted session data
            return self._format_user_session(user_data, auth_response.session.access_token)
            
        except Exception as e:
            raise ValueError(f"Invalid username or password: {str(e)}")

    def logout(self, token: str) -> bool:
        """Logout user using Supabase Auth"""
        try:
            # Set the session token for the logout request
            self.supabase.auth.set_session(token, None)
            self.supabase.auth.sign_out()
            return True
        except Exception as e:
            # Even if logout fails, we can consider it successful from client perspective
            return True

    def _sync_user_to_dynamodb(self, supabase_user) -> None:
        """Sync user data from Supabase to DynamoDB"""
        timestamp = get_timestamp()
        user_item = {
            "PK": user_pk(supabase_user.id),
            "SK": "PROFILE",
            "user_id": supabase_user.id,
            "username": supabase_user.user_metadata.get("username", supabase_user.email.split("@")[0]),
            "email": supabase_user.email,
            "role": supabase_user.user_metadata.get("role", UserRole.STUDENT),
            "student_id": supabase_user.user_metadata.get("student_id"),
            "is_verified": supabase_user.email_confirmed_at is not None,
            "created_at": supabase_user.created_at,
            "updated_at": timestamp
        }
        self.table.put_item(Item=user_item)

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email address from DynamoDB"""
        response = self.table.scan(
            FilterExpression="email = :email AND SK = :sk",
            ExpressionAttributeValues={
                ":email": email,
                ":sk": "PROFILE"
            }
        )
        
        items = response.get("Items", [])
        return items[0] if items else None

    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username from DynamoDB"""
        response = self.table.scan(
            FilterExpression="username = :username AND SK = :sk",
            ExpressionAttributeValues={
                ":username": username,
                ":sk": "PROFILE"
            }
        )
        
        items = response.get("Items", [])
        return items[0] if items else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by user_id from DynamoDB"""
        response = self.table.get_item(
            Key={"PK": user_pk(user_id), "SK": "PROFILE"}
        )
        return response.get("Item")

    def verify_token_and_get_user(self, token: str) -> Optional[Dict]:
        """Verify Supabase token and return user data"""
        try:
            # Verify token with Supabase
            user_response = self.supabase.auth.get_user(token)
            
            if not user_response.user:
                return None
            
            # Get user data from DynamoDB
            user = self.get_user_by_id(user_response.user.id)
            if not user:
                # Sync user from Supabase if not in DynamoDB
                self._sync_user_to_dynamodb(user_response.user)
                user = self.get_user_by_id(user_response.user.id)
            
            if user:
                return self._format_user_session(user, token)
            
            return None
        except Exception as e:
            return None

    def update_user(self, user_id: str, fields: Dict) -> Optional[Dict]:
        """Update user fields in DynamoDB"""
        if not fields:
            return None

        # Remove sensitive fields that shouldn't be updated directly
        sensitive_fields = ["password_hash", "user_id", "PK", "SK", "email"]
        update_fields = {k: v for k, v in fields.items() if k not in sensitive_fields}
        
        if not update_fields:
            return None

        update_expr = "SET " + ", ".join([f"{k} = :{k}" for k in update_fields.keys()])
        values = {f":{k}": v for k, v in update_fields.items()}
        values[":updated_at"] = get_timestamp()
        update_expr += ", updated_at = :updated_at"

        response = self.table.update_item(
            Key={"PK": user_pk(user_id), "SK": "PROFILE"},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=values,
            ReturnValues="ALL_NEW"
        )
        return response.get("Attributes")

    def change_password(self, user_id: str, current_password: str, new_password: str) -> bool:
        """Change user password using Supabase Auth"""
        try:
            # Get current user session (would need to be passed from the API endpoint)
            # For now, we'll update the password directly
            update_response = self.supabase.auth.update_user({
                "password": new_password
            })
            
            if update_response.user:
                return True
            return False
        except Exception as e:
            raise ValueError(f"Password change failed: {str(e)}")

    def confirm_email(self, token: str, email: str) -> Dict:
        """Confirm email using Supabase OTP"""
        try:
            response = self.supabase.auth.verify_otp({
                "email": email,
                "token": token,
                "type": "signup"
            })
            
            if response.user is None:
                raise ValueError("Invalid confirmation token")
            
            # Update verification status in DynamoDB
            user_id = response.user.id
            self.table.update_item(
                Key={"PK": user_pk(user_id), "SK": "PROFILE"},
                UpdateExpression="SET is_verified = :verified, updated_at = :updated_at",
                ExpressionAttributeValues={
                    ":verified": True,
                    ":updated_at": get_timestamp()
                }
            )
            
            # Extract user data and return session
            user_data = self._extract_user_data_from_supabase(response)
            
            if response.session and response.session.access_token:
                return self._format_user_session(user_data, response.session.access_token)
            else:
                return {
                    "id": user_data["user_id"],
                    "email": user_data["email"],
                    "name": user_data["username"],
                    "token": None,
                    "message": "Email confirmed successfully. Please log in.",
                    "confirmed": True
                }
                
        except Exception as e:
            raise ValueError(f"Email confirmation failed: {str(e)}")

    def resend_confirmation(self, email: str) -> bool:
        """Resend email confirmation"""
        try:
            self.supabase.auth.resend({
                "type": "signup",
                "email": email
            })
            return True
        except Exception as e:
            raise ValueError(f"Failed to resend confirmation: {str(e)}")

    def reset_password(self, email: str) -> bool:
        """Send password reset email using Supabase"""
        try:
            self.supabase.auth.reset_password_for_email(email)
            return True
        except Exception as e:
            raise ValueError(f"Password reset failed: {str(e)}")
