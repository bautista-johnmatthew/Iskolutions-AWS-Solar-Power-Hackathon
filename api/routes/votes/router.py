from fastapi import APIRouter

from routes.votes import handlers
from routes.votes.routes import VOTE_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Vote routes
router.add_api_route(
    **VOTE_ROUTES["VOTE_ON_POST"],
    endpoint=handlers.vote_post
)
router.add_api_route(
    **VOTE_ROUTES["REMOVE_POST_VOTE"],
    endpoint=handlers.remove_post_vote
)
router.add_api_route(
    **VOTE_ROUTES["VOTE_ON_COMMENT"],
    endpoint=handlers.vote_comment
)
router.add_api_route(
    **VOTE_ROUTES["REMOVE_COMMENT_VOTE"],
    endpoint=handlers.remove_comment_vote
)