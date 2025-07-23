from fastapi import Query, Depends
from typing import List, Dict
from services.utility_service import UtilityService
from services.aws_clients import AWSClients
from schemas.forum_schemas import PostBase


async def health_check() -> Dict[str, str]:
    return {"status": "ok", "message": "API is running"}


async def search_posts(
    q: str = Query(..., min_length=1, max_length=100, 
                   description="Search query for posts"),
    limit: int = Query(10, ge=1, le=50, description="Max number of results"),
    aws_clients: AWSClients = Depends()
) -> List[PostBase]:
    service = UtilityService(aws_clients)
    return service.search_posts(query=q, limit=limit)


async def get_trending(
    limit: int = Query(10, ge=1, le=50, 
                       description="Max number of trending posts"),
    aws_clients: AWSClients = Depends()
) -> List[PostBase]:
    service = UtilityService(aws_clients)
    return service.get_trending_posts(limit=limit)


async def get_recent_posts(
    limit: int = Query(10, ge=1, le=50, 
                       description="Max number of recent posts"),
    aws_clients: AWSClients = Depends()
) -> List[PostBase]:
    service = UtilityService(aws_clients)
    return service.get_recent_posts(limit=limit)
