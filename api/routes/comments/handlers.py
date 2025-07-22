from fastapi import Depends, HTTPException
from services.aws_clients import AWSClients, get_aws_clients
from services.comment_service import CommentService
from typing import Dict, Any

# =========================
# |   COMMENT HANDLERS    |
# =========================
async def create_comment(post_id: str, data: Dict[str, Any], 
                         aws_clients: AWSClients = Depends(get_aws_clients)):
    service = CommentService(aws_clients)
    return await service.create_comment(post_id, data)

async def get_comments(post_id: str, aws_clients: 
                       AWSClients = Depends(get_aws_clients)):
    service = CommentService(aws_clients)
    return await service.get_comments(post_id)

async def get_comment(comment_id: str, post_id: str, 
                      aws_clients: AWSClients = Depends(get_aws_clients)):
    service = CommentService(aws_clients)
    result = await service.get_comment(post_id, comment_id)
    if not result:
        raise HTTPException(status_code=404, detail="Comment not found")
    return result

async def update_comment(comment_id: str, post_id: str, data: Dict[str, Any], 
                         aws_clients: AWSClients = Depends(get_aws_clients)):
    service = CommentService(aws_clients)
    return await service.update_comment(post_id, comment_id, data)

async def patch_comment(comment_id: str, post_id: str, data: Dict[str, Any], 
                        aws_clients: AWSClients = Depends(get_aws_clients)):
    service = CommentService(aws_clients)
    return await service.patch_comment(post_id, comment_id, data)

async def delete_comment(comment_id: str, post_id: str, aws_clients: 
                         AWSClients = Depends(get_aws_clients)):
    service = CommentService(aws_clients)
    return await service.delete_comment(post_id, comment_id)

async def reply_to_comment(comment_id: str, post_id: str, data: Dict[str, Any], 
                           aws_clients: AWSClients = Depends(get_aws_clients)):
    service = CommentService(aws_clients)
    return await service.reply_to_comment(post_id, comment_id, data)
