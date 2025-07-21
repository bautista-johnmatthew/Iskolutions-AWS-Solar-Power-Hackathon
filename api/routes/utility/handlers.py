from fastapi import Depends
from services.aws_clients import AWSClients, get_aws_clients

# =========================
# |    UTILITY HANDLERS   |
# =========================
async def health_check():
    return {"status": "healthy"}

async def search_posts(aws_clients: AWSClients = Depends(get_aws_clients)):
    pass

async def get_trending(aws_clients: AWSClients = Depends(get_aws_clients)):
    pass

async def get_recent_posts(aws_clients: AWSClients = Depends(get_aws_clients)):
    pass