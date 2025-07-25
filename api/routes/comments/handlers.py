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
        new_comment = await comment_service.create_comment(post_id, 
                                                           comment_data.dict())
        return {"message": "Comment added", "comment": new_comment}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=e.args[0])
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
        return await comment_service.get_comments(post_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_comment(
    post_id: str,
    comment_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)
    comment = await comment_service.get_comment(post_id, comment_id)

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return comment


async def update_comment(
    post_id: str,
    comment_id: str,
    comment_data: CommentCreate,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)

    if not await comment_service.get_comment(post_id, comment_id):
        raise HTTPException(status_code=404, detail="Comment not found")

    try:
        updated = await comment_service.update_comment(post_id, comment_id, 
                                                       comment_data.dict())
        return {"message": "Comment updated", "comment": updated}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=e.args[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def patch_comment(
    post_id: str,
    comment_id: str,
    fields: dict = Body(...),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)

    if not await comment_service.get_comment(post_id, comment_id):
        raise HTTPException(status_code=404, detail="Comment not found")

    try:
        updated = await comment_service.patch_comment(post_id, comment_id, fields)
        return {"message": "Comment patched", "comment": updated}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=e.args[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def delete_comment(
    post_id: str,
    comment_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    comment_service = CommentService(aws_clients)

    if not await comment_service.get_comment(post_id, comment_id):
        raise HTTPException(status_code=404, detail="Comment not found")

    try:
        await comment_service.delete_comment(post_id, comment_id)
        return {"message": f"Comment {comment_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
