from fastapi import APIRouter

from routes.handlers import attachment_handlers as handlers
from routes.routes import ATTACHMENT_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Attachment routes
attachment_routes: dict = ATTACHMENT_ROUTES

router.add_api_route(
    **attachment_routes["UPLOAD_FILE"],
    endpoint=handlers.upload_file
)
router.add_api_route(
    **attachment_routes["GET_POST_FILES"],
    endpoint=handlers.get_post_files
)
router.add_api_route(
    **attachment_routes["DELETE_FILE"],
    endpoint=handlers.delete_file
)
router.add_api_route(
    **attachment_routes["GET_FILE_META"],
    endpoint=handlers.get_file_meta
)