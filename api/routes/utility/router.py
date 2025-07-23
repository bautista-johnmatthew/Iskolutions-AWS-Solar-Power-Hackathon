from fastapi import APIRouter
from routes.utility.routes import UTILITY_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

# Dynamically add routes from UTILITY_ROUTES
for api_route in UTILITY_ROUTES.values():
    router.add_api_route(**api_route)