from fastapi import Depends, Body
from services.aws_clients import AWSClients, get_aws_clients
from services.post_service import PostService


async def create_post(
    author_id: str = Body(...),
    title: str = Body(...),
    content: str = Body(...),
    tags: list = Body(default=[]),
    attachments: list = Body(default=[]),
    is_anonymous: bool = Body(default=False),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = PostService(aws_clients)
    return service.create_post(author_id, title, content, tags, attachments, 
                               is_anonymous)


async def get_posts(aws_clients: AWSClients = Depends(get_aws_clients)):
    service = PostService(aws_clients)
    return service.get_posts()


async def get_post(post_id: str, aws_clients: AWSClients 
                   = Depends(get_aws_clients)):
    service = PostService(aws_clients)
    post = service.get_post(post_id)
    if not post:
        return {"error": "Post not found"}
    return post


async def update_post(
    post_id: str,
    title: str = Body(...),
    content: str = Body(...),
    tags: list = Body(default=[]),
    attachments: list = Body(default=[]),
    is_anonymous: bool = Body(default=False),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = PostService(aws_clients)
    return service.update_post(post_id, title, content, tags, attachments, 
                               is_anonymous)


async def patch_post(
    post_id: str,
    updates: dict = Body(...),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = PostService(aws_clients)
    return service.patch_post(post_id, updates)


async def delete_post(post_id: str, aws_clients: AWSClients 
                      = Depends(get_aws_clients)):
    service = PostService(aws_clients)
    return service.delete_post(post_id)