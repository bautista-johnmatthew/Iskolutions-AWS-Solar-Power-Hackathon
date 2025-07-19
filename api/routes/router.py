# This file aggregates all the individual routers for different functionalities
# and includes them in a single router instance.

from fastapi import APIRouter, Depends

from routes.routers import (
    posts_router,
    comments_router,
    votes_router,
    attachments_router,
    utility_router,
)

# Create a new APIRouter instance
router: APIRouter = APIRouter()

router.include_router(posts_router)
router.include_router(comments_router)
router.include_router(votes_router)
router.include_router(attachments_router)
router.include_router(utility_router)
