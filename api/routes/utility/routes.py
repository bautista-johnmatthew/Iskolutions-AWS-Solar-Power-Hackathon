from fastapi import Depends
from services.aws_clients import get_aws_clients

# =============================
# |      UTILITY ROUTES       |
# =============================
UTILITY_ROUTES: dict = {
    "GET_HEALTH_CHECK": {
        "methods": ["GET"],
        "path": "/health",
    },
    "SEARCH_POSTS": {
        "methods": ["GET"],
        "path": "/search",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_TRENDING": {
        "methods": ["GET"],
        "path": "/trending",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_RECENT_POSTS": {
        "methods": ["GET"],
        "path": "/recent",
        "dependencies": [Depends(get_aws_clients)],
    },
}