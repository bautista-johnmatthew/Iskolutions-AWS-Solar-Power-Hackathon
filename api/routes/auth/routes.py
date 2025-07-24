from fastapi import Depends

from routes.auth import handlers
from services.aws_clients import get_aws_clients

# =============================
# |       AUTH ROUTES         |
# =============================
AUTH_ROUTES: dict = {
    "REGISTER": {
        "methods": ["POST"],
        "path": "/auth/register",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.register
    },
    "LOGIN": {
        "methods": ["POST"],
        "path": "/auth/login",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.login
    },
    "RESEND_CONFIRMATION": {
        "methods": ["POST"],
        "path": "/auth/resend-confirmation",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.resend_confirmation
    },
    "RESET_PASSWORD": {
        "methods": ["POST"],
        "path": "/auth/reset-password",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.reset_password
    },
    "LOGOUT": {
        "methods": ["POST"],
        "path": "/auth/logout",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.logout
    },
    "VERIFY_TOKEN": {
        "methods": ["POST"],
        "path": "/auth/verify-token",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.verify_token
    },
}
