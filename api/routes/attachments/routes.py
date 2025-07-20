from fastapi import Depends
from services.aws_clients import get_aws_clients

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