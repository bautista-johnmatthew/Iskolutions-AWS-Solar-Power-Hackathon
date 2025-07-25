from fastapi import Depends, HTTPException, Body
from typing import Literal
from services.aws_clients import AWSClients, get_aws_clients
from services.vote_service import VoteService
from services.post_service import PostService
from services.comment_service import CommentService

# =========================
# |     VOTE HANDLERS     |
# =========================

async def vote_post(
    post_id: str,
    vote_type: Literal['up', 'down'] = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    vote_service = VoteService(aws_clients)
    post_service = PostService(aws_clients)

    if not post_service.get_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        print("Attempting to add vote to DB for post:", post_id,
              "Vote type:", vote_type, "User ID:", user_id)
        return vote_service.vote_post(post_id, vote_type, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def remove_post_vote(
    post_id: str,
    vote_type: Literal['up', 'down'] = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    vote_service = VoteService(aws_clients)
    post_service = PostService(aws_clients)

    if not post_service.get_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        return vote_service.remove_post_vote(post_id, user_id, vote_type)
    except Exception as e:
        print("Error removing vote:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
async def get_post_votes(
    post_id: str,
    user_id: str,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    vote_service = VoteService(aws_clients)

    try:
        # Get all votes for the post
        votes = vote_service.get_post_votes(post_id)
        
        # Check for the specific user vote in the returned votes
        user_votes = []
        for vote in votes:
            sk = vote.get('sk', '')
            if f'VOTE#USER#{user_id}' in sk:
                user_votes.append(vote)
        
        return {
            'all_votes': votes,
            'user_votes': user_votes
        }
    except Exception as e:
        print("Error fetching post votes:", e)
        raise HTTPException(status_code=500, detail=str(e))
