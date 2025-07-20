from fastapi import Depends
from services.aws_clients import AWSClients, get_aws_clients

# =========================
# |   COMMENT HANDLERS    |
# =========================
async def create_comment(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def get_comments(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def get_comment(
    comment_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def update_comment(
    comment_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def patch_comment(
    comment_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def delete_comment(
    comment_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def reply_to_comment(
    comment_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass