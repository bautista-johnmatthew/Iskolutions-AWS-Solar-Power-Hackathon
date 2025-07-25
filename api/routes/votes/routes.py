from fastapi import Depends
from routes.votes import handlers
from services.aws_clients import get_aws_clients

# =============================
# |        VOTE ROUTES        |
# =============================
VOTE_ROUTES: dict = {
    "VOTE_POST": {
        "methods": ["POST"],
        "path": "/posts/{post_id}/vote",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.vote_post
    },
    "REMOVE_POST_VOTE": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}/vote",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.remove_post_vote
    }
}
