# This file aggregates all the individual routers for different functionalities
# and includes them in a single router instance.

from fastapi import APIRouter

from routes.posts.router import router as posts_router
from routes.comments.router import router as comments_router
from routes.votes.router import router as votes_router
from routes.attachments.router import router as attachments_router
from routes.utility.router import router as utility_router

# Create a new APIRouter instance
router: APIRouter = APIRouter()

router.include_router(posts_router)
router.include_router(comments_router)
router.include_router(votes_router)
router.include_router(attachments_router)
router.include_router(utility_router)
