from fastapi import Depends, HTTPException
from typing import Dict, List
from services.aws_clients import AWSClients, get_aws_clients
from services.post_service import PostService
from schemas.forum_schemas import PostCreate

# =========================
# |     POST HANDLERS     |
# =========================
async def create_post(data: PostCreate, aws_clients: AWSClients 
                      = Depends(get_aws_clients)) -> Dict:
    service = PostService(aws_clients)
    return service.create_post(
        author_id=data.author_id,
        title=data.title,
        content=data.content,
        tags=data.tags,
        attachments=data.attachments,
        is_anonymous=data.is_anonymous
    )

async def get_posts(aws_clients: AWSClients 
                    = Depends(get_aws_clients)) -> List[Dict]:
    service = PostService(aws_clients)
    return service.get_posts()

async def get_post(post_id: str, aws_clients: AWSClients 
                   = Depends(get_aws_clients)) -> Dict:
    service = PostService(aws_clients)
    item = service.get_post(post_id)
    if not item:
        raise HTTPException(status_code=404, detail="Post not found")
    return item

async def update_post(post_id: str, data: PostCreate, aws_clients: AWSClients 
                      = Depends(get_aws_clients)) -> Dict:
    service = PostService(aws_clients)
    item = service.update_post(post_id, data.title, data.content, 
                               data.tags, data.attachments)
    if not item:
        raise HTTPException(status_code=404, detail="Post not found")
    return item

async def patch_post(post_id: str, fields: Dict, aws_clients: AWSClients 
                     = Depends(get_aws_clients)) -> Dict:
    service = PostService(aws_clients)
    item = service.patch_post(post_id, fields)
    if not item:
        raise HTTPException(status_code=404, 
                            detail="Post not found or no fields provided")
    return item

async def delete_post(post_id: str, aws_clients: AWSClients 
                      = Depends(get_aws_clients)) -> Dict:
    service = PostService(aws_clients)
    success = service.delete_post(post_id)
    if not success:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}
