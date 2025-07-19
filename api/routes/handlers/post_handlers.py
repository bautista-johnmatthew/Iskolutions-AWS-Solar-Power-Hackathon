from fastapi import Depends
from clients import AWSClients, get_aws_clients


# =========================
# |     POST HANDLERS     |
# =========================
async def create_post(aws_clients: AWSClients = Depends(get_aws_clients)):
    pass

async def get_posts(aws_clients: AWSClients = Depends(get_aws_clients)):
    pass

async def get_post(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def update_post(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def patch_post(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def delete_post(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass