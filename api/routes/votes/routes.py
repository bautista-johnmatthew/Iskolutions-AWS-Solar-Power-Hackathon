from fastapi import Depends
from services.aws_clients import get_aws_clients

# =============================
# |        VOTE ROUTES        |
# =============================
VOTE_ROUTES: dict = {
    "VOTE_ON_POST": {
        "methods": ["POST"],
        "path": "/posts/{post_id}/vote",
        "dependencies": [Depends(get_aws_clients)],
    },
    "REMOVE_POST_VOTE": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}/vote",
        "dependencies": [Depends(get_aws_clients)],
    },
    "VOTE_ON_COMMENT": {
        "methods": ["POST"],
        "path": "/comments/{comment_id}/vote",
        "dependencies": [Depends(get_aws_clients)],
    },
    "REMOVE_COMMENT_VOTE": {
        "methods": ["DELETE"],
        "path": "/comments/{comment_id}/vote",
        "dependencies": [Depends(get_aws_clients)],
    },
}