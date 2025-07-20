from fastapi import Depends
from services.aws_clients import get_aws_clients

# =============================
# |      COMMENT ROUTES       |
# =============================
COMMENT_ROUTES: dict = {
    "CREATE_COMMENT": {
        "methods": ["POST"],
        "path": "/posts/{post_id}/comments",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_ALL_COMMENTS": {
        "methods": ["GET"],
        "path": "/posts/{post_id}/comments",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_COMMENT_BY_ID": {
        "methods": ["GET"],
        "path": "/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "UPDATE_COMMENT": {
        "methods": ["PUT"],
        "path": "/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "PATCH_COMMENT": {
        "methods": ["PATCH"],
        "path": "/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "DELETE_COMMENT": {
        "methods": ["DELETE"],
        "path": "/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "REPLY_TO_COMMENT": {
        "methods": ["POST"],
        "path": "/comments/{comment_id}/replies",
        "dependencies": [Depends(get_aws_clients)],
    },
}