from fastapi import APIRouter

from routes.auth.routes import AUTH_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

for api_route in AUTH_ROUTES.values():
    router.add_api_route(**api_route)
