from fastapi import Depends, HTTPException, Body
from typing import List
from services.aws_clients import AWSClients, get_aws_clients
from services.comment_service import CommentService
from services.post_service import PostService
from schemas.forum_schemas import CommentCreate, CommentResponse

# =========================
# |   COMMENT HANDLERS    |
# =========================

async def create_comment(
    post_id: str,
    comment_data: CommentCreate,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)
    post_service = PostService(aws_clients)

    if not post_service.get_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        new_comment = comment_service.create_comment(post_id, comment_data.dict())
        return {"message": "Comment added", "comment": new_comment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_comments(
    post_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> List[CommentResponse]:
    comment_service = CommentService(aws_clients)
    post_service = PostService(aws_clients)

    if not post_service.get_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        return comment_service.get_comments_for_post(post_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_comment(
    comment_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)
    comment = comment_service.get_comment(comment_id)

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return comment


async def update_comment(
    comment_id: str,
    comment_data: CommentCreate,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)

    if not comment_service.get_comment(comment_id):
        raise HTTPException(status_code=404, detail="Comment not found")

    try:
        updated = comment_service.update_comment(comment_id, comment_data.dict())
        return {"message": "Comment updated", "comment": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def patch_comment(
    comment_id: str,
    fields: dict = Body(...),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)

    if not comment_service.get_comment(comment_id):
        raise HTTPException(status_code=404, detail="Comment not found")

    try:
        updated = comment_service.patch_comment(comment_id, fields)
        return {"message": "Comment patched", "comment": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def delete_comment(
    comment_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)

    if not comment_service.get_comment(comment_id):
        raise HTTPException(status_code=404, detail="Comment not found")

    try:
        comment_service.delete_comment(comment_id)
        return {"message": f"Comment {comment_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))