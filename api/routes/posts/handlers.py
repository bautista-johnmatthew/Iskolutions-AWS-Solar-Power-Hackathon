from fastapi import Depends, HTTPException, Body
from typing import List
from services.aws_clients import AWSClients, get_aws_clients
from services.post_service import PostService
from schemas.forum_schemas import PostCreate, PostResponse


# =========================
# |     POST HANDLERS     |
# =========================

async def create_post(
    post_data: PostCreate,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> dict:
    """Create a new post"""
    service = PostService(aws_clients)
    try:
        new_post = service.create_post(
            author_id=post_data.author_id,
            title=post_data.title,
            content=post_data.content,
            tags=post_data.tags,
            attachments=post_data.attachments,
            is_anonymous=post_data.is_anonymous
        )

        service.add_summary(
            post_id=new_post['post_id'],
            attachments=post_data.attachments
        )

        return {"message": "Post created successfully", "post": new_post}
    except ValueError as e:
        # ✅ Handle profanity detection
        raise HTTPException(status_code=400, detail=e.args[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_posts(
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> List[PostResponse]:
    """Retrieve all posts"""
    service = PostService(aws_clients)
    try:
        return service.get_posts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_post(
    post_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> PostResponse:
    """Retrieve a single post by ID"""
    service = PostService(aws_clients)
    try:
        post = service.get_post(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return post
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def update_post(
    post_id: str,
    post_data: PostCreate,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> dict:
    """Update an existing post (full update)"""
    service = PostService(aws_clients)
    try:
        if not service.get_post(post_id):
            raise HTTPException(status_code=404, detail="Post not found")

        updated_post = service.update_post(
            post_id=post_id,
            title=post_data.title,
            content=post_data.content,
            tags=post_data.tags,
            attachments=post_data.attachments,
            is_anonymous=post_data.is_anonymous
        )
        return {"message": "Post updated successfully", "post": updated_post}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=e.args[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def patch_post(
    post_id: str,
    fields: dict = Body(...),
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> dict:
    """Patch an existing post (partial update)"""
    service = PostService(aws_clients)
    try:
        if not service.get_post(post_id):
            raise HTTPException(status_code=404, detail="Post not found")
        updated_post = service.patch_post(post_id, fields)
        return {"message": "Post patched successfully", "post": updated_post}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=e.args[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def delete_post(
    post_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
) -> dict:
    """Delete a post"""
    service = PostService(aws_clients)
    try:
        if not service.get_post(post_id):
            raise HTTPException(status_code=404, detail="Post not found")
        service.delete_post(post_id)
        return {"message": f"Post {post_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
