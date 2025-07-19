from fastapi import APIRouter

from routes.handlers import vote_handlers as handlers
from routes.routes import VOTE_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Vote routes
vote_routes: dict = VOTE_ROUTES

router.add_api_route(
    **vote_routes["VOTE_ON_POST"],
    endpoint=handlers.vote_post
)
router.add_api_route(
    **vote_routes["REMOVE_POST_VOTE"],
    endpoint=handlers.remove_post_vote
)
router.add_api_route(
    **vote_routes["VOTE_ON_COMMENT"],
    endpoint=handlers.vote_comment
)
router.add_api_route(
    **vote_routes["REMOVE_COMMENT_VOTE"],
    endpoint=handlers.remove_comment_vote
)