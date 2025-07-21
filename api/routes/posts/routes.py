from fastapi import Depends

from routes.posts import handlers
from services.aws_clients import get_aws_clients

# =============================
# |        POST ROUTES        |
# =============================
POST_ROUTES: dict = {
    "CREATE_POST": {
        "methods": ["POST"],
        "path": "/posts",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.create_post
    },
    "GET_ALL_POSTS": {
        "methods": ["GET"],
        "path": "/posts",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_posts
    },
    "GET_POST_BY_ID": {
        "methods": ["GET"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_post
    },
    "UPDATE_POST": {
        "methods": ["PUT"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.update_post
    },
    "PATCH_POST": {
        "methods": ["PATCH"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.patch_post
    },
    "DELETE_POST": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.delete_post
    },
}