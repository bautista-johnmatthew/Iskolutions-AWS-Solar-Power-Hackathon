from fastapi import Depends
from services.aws_clients import get_aws_clients

# =============================
# |        POST ROUTES        |
# =============================
POST_ROUTES: dict = {
    "CREATE_POST": {
        "methods": ["POST"],
        "path": "/posts",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_ALL_POSTS": {
        "methods": ["GET"],
        "path": "/posts",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_POST_BY_ID": {
        "methods": ["GET"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "UPDATE_POST": {
        "methods": ["PUT"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "PATCH_POST": {
        "methods": ["PATCH"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "DELETE_POST": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
}