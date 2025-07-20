from fastapi import Depends
from models.clients import AWSClients, get_aws_clients

# This file defines the routes for the API, categorizing them into different
# sections such as posts, comments, votes, attachments, and utility functions.

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

# =============================
# |     ATTACHMENT ROUTES     |
# =============================
ATTACHMENT_ROUTES: dict = {
    "UPLOAD_FILE": {
        "methods": ["POST"],
        "path": "/posts/{post_id}/files",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_POST_FILES": {
        "methods": ["GET"],
        "path": "/posts/{post_id}/files",
        "dependencies": [Depends(get_aws_clients)],
    },
    "DELETE_FILE": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}/files/{file_id}",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_FILE_META": {
        "methods": ["GET"],
        "path": "/files/{file_id}/meta",
        "dependencies": [Depends(get_aws_clients)],
    },
}

# =============================
# |      UTILITY ROUTES       |
# =============================
UTILITY_ROUTES: dict = {
    "GET_HEALTH_CHECK": {
        "methods": ["GET"],
        "path": "/health",
    },
    "SEARCH_POSTS": {
        "methods": ["GET"],
        "path": "/search",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_TRENDING": {
        "methods": ["GET"],
        "path": "/trending",
        "dependencies": [Depends(get_aws_clients)],
    },
    "GET_RECENT_POSTS": {
        "methods": ["GET"],
        "path": "/recent",
        "dependencies": [Depends(get_aws_clients)],
    },
}
