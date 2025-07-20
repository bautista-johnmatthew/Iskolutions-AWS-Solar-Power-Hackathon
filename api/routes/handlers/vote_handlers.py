from fastapi import Depends
from models.clients import AWSClients, get_aws_clients

# =========================
# |     VOTE HANDLERS     |
# =========================
async def vote_post(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def remove_post_vote(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def vote_comment(
    comment_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def remove_comment_vote(
    comment_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass