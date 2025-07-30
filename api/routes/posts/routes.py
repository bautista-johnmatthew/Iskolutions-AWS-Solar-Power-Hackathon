from fastapi import Depends
from routes.posts import handlers
from services.aws_clients import get_aws_clients

POST_ROUTES: dict = {
    "CREATE_POST": {
        "methods": ["POST"],
        "path": "/posts",
        "endpoint": handlers.create_post,
        "dependencies": [Depends(get_aws_clients)]
    },
    "GET_ALL_POSTS": {
        "methods": ["GET"],
        "path": "/posts",
        "endpoint": handlers.get_posts,
        "dependencies": [Depends(get_aws_clients)]
    },
    "GET_POST_BY_ID": {
        "methods": ["GET"],
        "path": "/posts/{post_id}",
        "endpoint": handlers.get_post,
        "dependencies": [Depends(get_aws_clients)]
    },
    "UPDATE_POST": {
        "methods": ["PUT"],
        "path": "/posts/{post_id}",
        "endpoint": handlers.update_post,
        "dependencies": [Depends(get_aws_clients)]
    },
    "DELETE_POST": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}",
        "endpoint": handlers.delete_post,
        "dependencies": [Depends(get_aws_clients)]
    },
    "PATCH_POST": {
        "methods": ["PATCH"],
        "path": "/posts/{post_id}",
        "endpoint": handlers.patch_post,
        "dependencies": [Depends(get_aws_clients)]
    },
}

