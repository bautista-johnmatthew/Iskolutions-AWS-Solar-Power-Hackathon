from fastapi import APIRouter

from routes.handlers import post_handlers as handlers
from routes.routes import POST_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Post routes
router.add_api_route(
    **POST_ROUTES["CREATE_POST"],
    endpoint=handlers.create_post
)
router.add_api_route(
    **POST_ROUTES["GET_ALL_POSTS"],
    endpoint=handlers.get_posts
)
router.add_api_route(
    **POST_ROUTES["GET_POST_BY_ID"],
    endpoint=handlers.get_post
)
router.add_api_route(
    **POST_ROUTES["UPDATE_POST"],
    endpoint=handlers.update_post
)
router.add_api_route(
    **POST_ROUTES["PATCH_POST"],
    endpoint=handlers.patch_post
)
router.add_api_route(
    **POST_ROUTES["DELETE_POST"],
    endpoint=handlers.delete_post
)