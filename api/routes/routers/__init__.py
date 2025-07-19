# This file initializes the API routers for different functionalities.

from .posts import router as posts_router
from .utility import router as utility_router
from .comments import router as comments_router
from .votes import router as votes_router
from .attachments import router as attachments_router