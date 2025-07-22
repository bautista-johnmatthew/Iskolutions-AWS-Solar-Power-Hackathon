import uuid
import mimetypes
from botocore.exceptions import ClientError
from fastapi import UploadFile
from services.aws_clients import AWSClients
from models.forum_models import get_timestamp, post_pk


class AttachmentService:
    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table
        self.s3 = aws_clients.s3
        self.bucket = aws_clients.s3_bucket

    def upload_file(self, post_id: str, file: UploadFile, user_id: str):
        """Upload file to S3 and store metadata in DynamoDB"""
        file_id = str(uuid.uuid4())
        key = f"attachments/{post_id}/{file_id}-{file.filename}"
        content_type, _ = mimetypes.guess_type(file.filename)
        content_type = content_type or "application/octet-stream"

        try:
            # Upload to S3
            self.s3.upload_fileobj(file.file, self.bucket, key,
                                   ExtraArgs={"ContentType": content_type})

            # Save metadata to DynamoDB
            item = {
                "PK": post_pk(post_id),
                "SK": f"FILE#{file_id}",
                "file_id": file_id,
                "filename": file.filename,
                "s3_key": key,
                "content_type": content_type,
                "uploaded_by": user_id,
                "created_at": get_timestamp()
            }
            self.table.put_item(Item=item)
            return {
                "message": "File uploaded successfully",
                "file_id": file_id,
                "url": f"s3://{self.bucket}/{key}"
            }
        except ClientError as e:
            raise RuntimeError(f"Error uploading file: {e}")

    def list_files(self, post_id: str):
        """List all files for a given post"""
        try:
            response = self.table.query(
                KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
                ExpressionAttributeValues={
                    ":pk": post_pk(post_id),
                    ":sk": "FILE#"
                }
            )
            return response.get("Items", [])
        except ClientError as e:
            raise RuntimeError(f"Error listing files: {e}")

    def delete_file(self, post_id: str, file_id: str):
        """Delete file from S3 and DynamoDB"""
        try:
            # Get metadata
            response = self.table.get_item(
                Key={"PK": post_pk(post_id), "SK": f"FILE#{file_id}"}
            )
            item = response.get("Item")
            if not item:
                return {"error": "File not found"}

            # Delete from S3
            self.s3.delete_object(Bucket=self.bucket, Key=item["s3_key"])

            # Delete metadata
            self.table.delete_item(
                Key={"PK": post_pk(post_id), "SK": f"FILE#{file_id}"}
            )
            return {"message": "File deleted successfully"}
        except ClientError as e:
            raise RuntimeError(f"Error deleting file: {e}")

    def get_file_metadata(self, post_id: str, file_id: str):
        """Retrieve file metadata"""
        try:
            response = self.table.get_item(
                Key={"PK": post_pk(post_id), "SK": f"FILE#{file_id}"}
            )
            return response.get("Item", {})
        except ClientError as e:
            raise RuntimeError(f"Error fetching file metadata: {e}")
