from fastapi import Depends

from routes.comments import handlers
from services.aws_clients import get_aws_clients

# =============================
# |      COMMENT ROUTES       |
# =============================
COMMENT_ROUTES: dict = {
    "CREATE_COMMENT": {
        "methods": ["POST"],
        "path": "/posts/{post_id}/comments",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.create_comment
    },
    "GET_ALL_COMMENTS": {
        "methods": ["GET"],
        "path": "/posts/{post_id}/comments",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_comments
    },
    "GET_COMMENT_BY_ID": {
        "methods": ["GET"],
        "path": "/posts/{post_id}/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_comment
    },
    "UPDATE_COMMENT": {
        "methods": ["PUT"],
        "path": "/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.update_comment
    },
    "PATCH_COMMENT": {
        "methods": ["PATCH"],
        "path": "/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.patch_comment
    },
    "DELETE_COMMENT": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}/comments/{comment_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.delete_comment
    }
}