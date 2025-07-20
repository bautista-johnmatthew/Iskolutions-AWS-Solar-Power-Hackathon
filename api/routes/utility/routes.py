from fastapi import Depends

from routes.utility import handlers
from services.aws_clients import get_aws_clients

# =============================
# |      UTILITY ROUTES       |
# =============================
UTILITY_ROUTES: dict = {
    "GET_HEALTH_CHECK": {
        "methods": ["GET"],
        "path": "/health",
        "endpoint": handlers.health_check
    },
    "SEARCH_POSTS": {
        "methods": ["GET"],
        "path": "/search",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.search_posts
    },
    "GET_TRENDING": {
        "methods": ["GET"],
        "path": "/trending",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_trending
    },
    "GET_RECENT_POSTS": {
        "methods": ["GET"],
        "path": "/recent",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_recent_posts
    },
}