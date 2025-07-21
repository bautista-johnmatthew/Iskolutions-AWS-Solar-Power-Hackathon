from fastapi import APIRouter

from routes.attachments.routes import ATTACHMENT_ROUTES

# Create a new APIRouter instance
router: APIRouter = APIRouter()

for api_route in ATTACHMENT_ROUTES.values():
    router.add_api_route(**api_route)