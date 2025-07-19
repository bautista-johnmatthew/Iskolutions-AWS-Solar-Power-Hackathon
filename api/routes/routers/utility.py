from fastapi import APIRouter

from routes.handlers import utility_handlers as handlers
from routes.routes import UTILITY_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Utility routes
router.add_api_route(
    **UTILITY_ROUTES["GET_HEALTH_CHECK"],
    endpoint=handlers.health_check
)
router.add_api_route(
    **UTILITY_ROUTES["SEARCH_POSTS"],
    endpoint=handlers.search_posts
)
router.add_api_route(
    **UTILITY_ROUTES["GET_TRENDING"],
    endpoint=handlers.get_trending
)
router.add_api_route(
    **UTILITY_ROUTES["GET_RECENT_POSTS"],
    endpoint=handlers.get_recent_posts
)