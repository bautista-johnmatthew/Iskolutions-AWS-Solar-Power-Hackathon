from fastapi import APIRouter

from routes.comments.routes import COMMENT_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

for api_route in COMMENT_ROUTES.values():
    router.add_api_route(**api_route)