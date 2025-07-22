from fastapi import Depends, UploadFile, File, Body
from services.aws_clients import AWSClients, get_aws_clients
from services.attachment_service import AttachmentService


async def upload_file(post_id: str, user_id: str = Body(...), 
                      file: UploadFile = File(...),
                      aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AttachmentService(aws_clients)
    return service.upload_file(post_id, file, user_id)


async def get_post_files(post_id: str, 
                         aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AttachmentService(aws_clients)
    return service.list_files(post_id)


async def delete_file(post_id: str, file_id: str, 
                      aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AttachmentService(aws_clients)
    return service.delete_file(post_id, file_id)


async def get_file_meta(post_id: str, file_id: str, 
                        aws_clients: AWSClients = Depends(get_aws_clients)):
    service = AttachmentService(aws_clients)
    return service.get_file_metadata(post_id, file_id)
