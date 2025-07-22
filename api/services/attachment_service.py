import uuid
import re
import mimetypes
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile
from models.forum_models import get_timestamp, post_pk
from services.aws_clients import AWSClients

MAX_FILE_SIZE = 15 * 1024 * 1024  # 10 MB

class AttachmentService:
    """Service for managing post attachments in S3 and DynamoDB."""

    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table
        self.s3 = aws_clients.s3
        self.bucket = aws_clients.s3_bucket

    def upload_file(self, post_id: str, file: UploadFile, user_id: str):
        """Upload file to S3 and store metadata in DynamoDB with validations."""
        try:
            response = self.table.get_item(Key={"PK": post_pk(post_id), 
                                                "SK": "POST"})
            if "Item" not in response:
                raise HTTPException(status_code=404, 
                                    detail="Post not found")
        except ClientError as e:
            raise HTTPException(status_code=500, 
                                detail=f"Error validating post: {e}")

        file.file.seek(0, 2)  # Move cursor to end
        size = file.file.tell()
        file.file.seek(0)  # Reset cursor
        if size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, 
                                detail="File too large (max 10 MB)")

        sanitized_filename = re.sub(r"[^\w\-.]", "_", file.filename)
        file_id = str(uuid.uuid4())
        key = f"attachments/{post_id}/{file_id}-{sanitized_filename}"

        content_type, _ = mimetypes.guess_type(sanitized_filename)

        try:
            self.s3.upload_fileobj(file.file, self.bucket, key,
                                   ExtraArgs={"ContentType": content_type})
            item = {
                "PK": post_pk(post_id),
                "SK": f"FILE#{file_id}",
                "file_id": file_id,
                "filename": sanitized_filename,
                "s3_key": key,
                "uploaded_by": user_id,
                "created_at": get_timestamp(),
            }
            self.table.put_item(Item=item)

            return {"message": "File uploaded", "file_id": file_id}
        except ClientError as e:
            raise HTTPException(status_code=500, 
                                detail=f"S3 upload failed: {e}")

    def get_post_files(self, post_id: str):
        """Retrieve all files attached to a post."""
        try:
            response = self.table.query(
                KeyConditionExpression="PK = :pk AND begins_with(SK, :file)",
                ExpressionAttributeValues={":pk": post_pk(post_id), 
                                           ":file": "FILE#"},
            )
            return response.get("Items", [])
        except ClientError as e:
            raise HTTPException(status_code=500, 
                                detail=f"Error fetching files: {e}")

    def delete_file(self, post_id: str, file_id: str):
        """Delete file from S3 and DynamoDB."""
        key = f"attachments/{post_id}/{file_id}"
        try:
            # Fetch file metadata to get S3 key
            response = self.table.get_item(Key={"PK": post_pk(post_id), 
                                                "SK": f"FILE#{file_id}"})
            if "Item" not in response:
                raise HTTPException(status_code=404, detail="File not found")

            s3_key = response["Item"]["s3_key"]
            self.s3.delete_object(Bucket=self.bucket, Key=s3_key)
            self.table.delete_item(Key={"PK": post_pk(post_id), 
                                        "SK": f"FILE#{file_id}"})
            return {"message": "File deleted"}
        except ClientError as e:
            raise HTTPException(status_code=500, 
                                detail=f"Error deleting file: {e}")

    def get_file_meta(self, file_id: str):
        """Get metadata for a specific file."""
        try:
            response = self.table.scan(
                FilterExpression="SK = :sk",
                ExpressionAttributeValues={":sk": f"FILE#{file_id}"},
            )
            items = response.get("Items", [])
            if not items:
                raise HTTPException(status_code=404, 
                                    detail="File metadata not found")
            return items[0]
        except ClientError as e:
            raise HTTPException(status_code=500, 
                                detail=f"Error fetching metadata: {e}")