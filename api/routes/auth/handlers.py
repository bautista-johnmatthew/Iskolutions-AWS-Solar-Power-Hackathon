from fastapi import Depends, HTTPException, Header
from services.aws_clients import AWSClients, get_aws_clients
from services.auth_service import AuthService
from typing import Dict, Any, Optional

# =========================
# |     AUTH HANDLERS     |
# =========================
async def register(data: Dict[str, Any], 
                  aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AuthService(aws_clients)
    try:
        result = service.register(
            username=data.get("username"),
            email=data.get("email"),
            password=data.get("password"),
            role=data.get("role", "STUDENT"),
            student_id=data.get("student_id")
        )
        # Return the user data directly (not wrapped in success/data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")

async def login(data: Dict[str, Any], 
               aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AuthService(aws_clients)
    try:
        result = service.login(data.get("email"), data.get("password"))
        # Return the user data directly (not wrapped in success/data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")

async def confirm_email(data: Dict[str, Any],
                       aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AuthService(aws_clients)
    try:
        result = service.confirm_email(data.get("token"), data.get("email"))
        # Return the user data directly (not wrapped in success/data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Email confirmation failed")

async def resend_confirmation(data: Dict[str, Any],
                             aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AuthService(aws_clients)
    try:
        result = service.resend_confirmation(data.get("email"))
        return {
            "success": True,
            "message": "Confirmation email sent successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to resend confirmation")

async def reset_password(data: Dict[str, Any],
                        aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AuthService(aws_clients)
    try:
        result = service.reset_password(data.get("email"))
        return {
            "success": True,
            "message": "Password reset email sent successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send password reset email")

async def logout(authorization: Optional[str] = Header(None),
                aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AuthService(aws_clients)
    try:
        # Extract token from Authorization header
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:]  # Remove "Bearer " prefix
        
        if token:
            result = service.logout(token)
        
        return {
            "success": True,
            "message": "Logged out successfully"
        }
    except Exception as e:
        return {
            "success": True,
            "message": "Logged out successfully"
        }  # Always return success for logout

async def verify_token(authorization: Optional[str] = Header(None),
                      aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AuthService(aws_clients)
    try:
        # Extract token from Authorization header
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:]  # Remove "Bearer " prefix
        
        if not token:
            raise HTTPException(status_code=401, detail="No token provided")
            
        result = service.verify_token_and_get_user(token)
        if result:
            return result
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token verification failed")
