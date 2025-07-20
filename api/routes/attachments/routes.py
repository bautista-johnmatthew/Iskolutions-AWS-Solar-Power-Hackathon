from fastapi import Depends

from routes.attachments import handlers
from services.aws_clients import get_aws_clients

# =============================
# |     ATTACHMENT ROUTES     |
# =============================
ATTACHMENT_ROUTES: dict = {
    "UPLOAD_FILE": {
        "methods": ["POST"],
        "path": "/posts/{post_id}/files",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.upload_file
    },
    "GET_POST_FILES": {
        "methods": ["GET"],
        "path": "/posts/{post_id}/files",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_post_files
    },
    "DELETE_FILE": {
        "methods": ["DELETE"],
        "path": "/posts/{post_id}/files/{file_id}",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.delete_file
    },
    "GET_FILE_META": {
        "methods": ["GET"],
        "path": "/files/{file_id}/meta",
        "dependencies": [Depends(get_aws_clients)],
        "endpoint": handlers.get_file_meta
    },
}