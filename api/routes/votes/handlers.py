from typing import Literal
from fastapi import Body, Depends
from services.aws_clients import AWSClients, get_aws_clients
from services.vote_service import VoteService

# =========================
# |     VOTE HANDLERS     |
# =========================

async def vote_post(
    post_id: str,
    user_id: str = Body(..., embed=True),
    vote_type: Literal["up", "down"] = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients),
):
    service = VoteService(aws_clients)
    return service.vote_post(post_id, user_id, vote_type)


async def remove_post_vote(
    post_id: str,
    user_id: str = Body(..., embed=True),
    vote_type: Literal["up", "down"] = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients),
):
    service = VoteService(aws_clients)
    return service.remove_post_vote(post_id, user_id, vote_type)


async def vote_comment(
    comment_id: str,
    post_id: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    vote_type: Literal["up", "down"] = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients),
):
    service = VoteService(aws_clients)
    return service.vote_comment(comment_id, post_id, user_id, vote_type)


async def remove_comment_vote(
    comment_id: str,
    post_id: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    vote_type: Literal["up", "down"] = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients),
):
    service = VoteService(aws_clients)
    return service.remove_comment_vote(comment_id, post_id, user_id, vote_type)
