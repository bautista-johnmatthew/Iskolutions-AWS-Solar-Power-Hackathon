from fastapi import Depends
from typing import Dict, List
from routes.utility import handlers
from services.aws_clients import get_aws_clients
from schemas.forum_schemas import PostSchema

UTILITY_ROUTES: dict = {
    "GET_HEALTH_CHECK": {
        "methods": ["GET"],
        "path": "/health",
        "endpoint": handlers.health_check,
        "tags": ["Utility"],
        "summary": "Check API Health",
        "description": "Returns a simple health check message.",
        "response_model": Dict[str, str]
    },
    "SEARCH_POSTS": {
        "methods": ["GET"],
        "path": "/search",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.search_posts,
        "tags": ["Utility"],
        "summary": "Search posts",
        "description": "Search posts by title or content with query `q`.",
        "response_model": List[PostSchema]
    },
    "GET_TRENDING": {
        "methods": ["GET"],
        "path": "/trending",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_trending,
        "tags": ["Utility"],
        "summary": "Get trending posts",
        "description": "Returns trending posts sorted by engagement.",
        "response_model": List[PostSchema]
    },
    "GET_RECENT_POSTS": {
        "methods": ["GET"],
        "path": "/recent",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_recent_posts,
        "tags": ["Utility"],
        "summary": "Get recent posts",
        "description": "Returns the most recent posts.",
        "response_model": List[PostSchema]
    },
}
