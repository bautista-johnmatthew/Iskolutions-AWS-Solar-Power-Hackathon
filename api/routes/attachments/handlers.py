from fastapi import Depends, HTTPException, UploadFile, File, Body
from services.aws_clients import AWSClients, get_aws_clients
from services.attachment_service import AttachmentService
from services.post_service import PostService

# =========================
# |  ATTACHMENT HANDLERS  |
# =========================

MAX_FILE_SIZE_MB = 15


async def upload_file(
    post_id: str,
    user_id: str = Body(...),
    file: UploadFile = File(...),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    attachment_service = AttachmentService(aws_clients)
    post_service = PostService(aws_clients)

    # Validate post existence
    if not post_service.get_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")

    # Validate file size
    file.file.seek(0, 2)  # Move cursor to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset cursor

    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {MAX_FILE_SIZE_MB}MB limit"
        )

    try:
        result = attachment_service.upload_file(post_id, file, user_id)
        return {"message": "File uploaded successfully", "file_meta": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_post_files(
    post_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    attachment_service = AttachmentService(aws_clients)
    post_service = PostService(aws_clients)

    if not post_service.get_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        return attachment_service.get_post_files(post_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def delete_file(
    post_id: str,
    file_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    attachment_service = AttachmentService(aws_clients)
    post_service = PostService(aws_clients)

    if not post_service.get_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        attachment_service.delete_file(post_id, file_id)
        return {"message": f"File {file_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_file_meta(
    file_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    attachment_service = AttachmentService(aws_clients)

    meta = attachment_service.get_file_meta(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")

    return meta
