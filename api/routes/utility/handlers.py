from fastapi import Depends, Query
from services.aws_clients import AWSClients, get_aws_clients
from services.utility_service import UtilityService

# =========================
# |    UTILITY HANDLERS   |
# =========================
async def health_check():
    return {"status": "healthy"}

async def search_posts(
    q: str = Query(...),
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    service = UtilityService(aws_clients)
    return service.search_posts(query=q)

async def get_trending(aws_clients: AWSClients = Depends(get_aws_clients)):
    service = UtilityService(aws_clients)
    return service.get_trending()

async def get_recent_posts(aws_clients: AWSClients = Depends(get_aws_clients)):
    service = UtilityService(aws_clients)
    return service.get_recent_posts()
