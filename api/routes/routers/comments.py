from fastapi import APIRouter

from routes.handlers import comment_handlers as handlers
from routes.routes import COMMENT_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Comment routes
comment_routes: dict = COMMENT_ROUTES

router.add_api_route(
    **comment_routes["CREATE_COMMENT"],
    endpoint=handlers.create_comment
)
router.add_api_route(
    **comment_routes["GET_ALL_COMMENTS"],
    endpoint=handlers.get_comments
)
router.add_api_route(
    **comment_routes["GET_COMMENT_BY_ID"],
    endpoint=handlers.get_comment
)
router.add_api_route(
    **comment_routes["UPDATE_COMMENT"],
    endpoint=handlers.update_comment
)
router.add_api_route(
    **comment_routes["PATCH_COMMENT"],
    endpoint=handlers.patch_comment
)
router.add_api_route(
    **comment_routes["DELETE_COMMENT"],
    endpoint=handlers.delete_comment
)
router.add_api_route(
    **comment_routes["REPLY_TO_COMMENT"],
    endpoint=handlers.reply_to_comment
)