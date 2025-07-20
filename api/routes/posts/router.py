from fastapi import APIRouter

from routes.posts.routes import POST_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

for api_route in POST_ROUTES.values():
    router.add_api_route(**api_route)