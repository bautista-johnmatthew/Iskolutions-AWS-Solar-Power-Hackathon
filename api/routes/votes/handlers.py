from fastapi import Depends
from services.aws_clients import AWSClients, get_aws_clients
from services.vote_service import VoteService
from fastapi import Body

# =========================
# |     VOTE HANDLERS     |
# =========================
async def vote_post(
    post_id: str,
    vote_type: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = VoteService(aws_clients)
    return service.vote_post(post_id, user_id, vote_type)

async def remove_post_vote(
    post_id: str,
    vote_type: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = VoteService(aws_clients)
    return service.remove_post_vote(post_id, user_id, vote_type)

async def vote_comment(
    comment_id: str,
    post_id: str = Body(..., embed=True),
    vote_type: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = VoteService(aws_clients)
    return service.vote_comment(post_id, comment_id, user_id, vote_type)

async def remove_comment_vote(
    comment_id: str,
    post_id: str = Body(..., embed=True),
    vote_type: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = VoteService(aws_clients)
    return service.remove_comment_vote(post_id, comment_id, user_id, vote_type)
