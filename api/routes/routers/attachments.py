from fastapi import APIRouter

from routes.handlers import attachment_handlers as handlers
from routes.routes import ATTACHMENT_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Attachment routes
router.add_api_route(
    **ATTACHMENT_ROUTES["UPLOAD_FILE"],
    endpoint=handlers.upload_file
)
router.add_api_route(
    **ATTACHMENT_ROUTES["GET_POST_FILES"],
    endpoint=handlers.get_post_files
)
router.add_api_route(
    **ATTACHMENT_ROUTES["DELETE_FILE"],
    endpoint=handlers.delete_file
)
router.add_api_route(
    **ATTACHMENT_ROUTES["GET_FILE_META"],
    endpoint=handlers.get_file_meta
)