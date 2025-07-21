from fastapi import Depends, HTTPException
from typing import List
from services.aws_clients import AWSClients, get_aws_clients
from services.crud_service import (
    create_post, get_posts, get_post, update_post, delete_post, patch_post
)
from schemas.forum_schemas import PostCreate, PostResponse


async def create_post_handler(
    data: PostCreate,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> PostResponse:
    try:
        return await create_post(data, aws_clients)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_posts_handler(
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> List[PostResponse]:
    try:
        return await get_posts(aws_clients)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_post_handler(
    post_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> PostResponse:
    try:
        post = await get_post(post_id, aws_clients)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return post
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def update_post_handler(
    post_id: str,
    data: PostCreate,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> PostResponse:
    try:
        return await update_post(post_id, data, aws_clients)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def delete_post_handler(
    post_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    try:
        await delete_post(post_id, aws_clients)
        return {"message": "Post deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def patch_post_handler(
    post_id: str,
    data: dict,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    try:
        return await patch_post(post_id, data, aws_clients)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
