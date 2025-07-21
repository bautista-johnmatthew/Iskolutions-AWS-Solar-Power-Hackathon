from fastapi import APIRouter

from routes.votes.routes import VOTE_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

for api_route in VOTE_ROUTES.values():
    router.add_api_route(**api_route)