from fastapi import Depends
from clients import AWSClients, get_aws_clients

# =========================
# |  ATTACHMENT HANDLERS  |
# =========================
async def upload_file(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def get_post_files(
    post_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def delete_file(
    post_id: int,
    file_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass

async def get_file_meta(
    file_id: int,
    aws_clients: AWSClients = Depends(get_aws_clients)
):
    pass