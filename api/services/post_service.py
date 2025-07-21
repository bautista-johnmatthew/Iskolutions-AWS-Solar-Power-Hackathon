# api/services/posts_service.py
import uuid
from typing import List, Dict, Optional
from models.forum_models import post_pk
from services.aws_clients import AWSClients
from datetime import datetime, timezone

def get_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()

class PostService:
    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table

    def create_post(self, author_id: str, title: str, content: str,
                    tags: Optional[List[str]] = None,
                    attachments: Optional[List[str]] = None,
                    is_anonymous: bool = False) -> Dict:
        post_id = str(uuid.uuid4())
        item = {
            "PK": post_pk(post_id),
            "SK": "METADATA",
            "post_id": post_id,
            "author_id": author_id,
            "title": title,
            "content": content,
            "tags": tags or [],
            "attachments": attachments or [],
            "is_anonymous": is_anonymous,
            "upvotes": 0,
            "downvotes": 0,
            "created_at": get_timestamp(),
            "updated_at": get_timestamp()
        }
        self.table.put_item(Item=item)
        return item

    def get_posts(self) -> List[Dict]:
        response = self.table.scan()
        return [item for item in response.get("Items", []) if item.get("SK") == "METADATA"]

    def get_post(self, post_id: str) -> Optional[Dict]:
        response = self.table.get_item(Key={"PK": post_pk(post_id), "SK": "METADATA"})
        return response.get("Item")

    def update_post(self, post_id: str, title: str, content: str,
                    tags: Optional[List[str]], attachments: Optional[List[str]]) -> Optional[Dict]:
        update_expr = "SET title = :title, content = :content, tags = :tags, attachments = :attachments, updated_at = :updated_at"
        values = {
            ":title": title,
            ":content": content,
            ":tags": tags or [],
            ":attachments": attachments or [],
            ":updated_at": get_timestamp()
        }
        response = self.table.update_item(
            Key={"PK": post_pk(post_id), "SK": "METADATA"},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=values,
            ReturnValues="ALL_NEW"
        )
        return response.get("Attributes")

    def patch_post(self, post_id: str, fields: Dict) -> Optional[Dict]:
        if not fields:
            return None

        update_expr = "SET " + ", ".join([f"{k} = :{k}" for k in fields.keys()])
        values = {f":{k}": v for k, v in fields.items()}
        values[":updated_at"] = get_timestamp()
        update_expr += ", updated_at = :updated_at"

        response = self.table.update_item(
            Key={"PK": post_pk(post_id), "SK": "METADATA"},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=values,
            ReturnValues="ALL_NEW"
        )
        return response.get("Attributes")

    def delete_post(self, post_id: str) -> bool:
        self.table.delete_item(Key={"PK": post_pk(post_id), "SK": "METADATA"})
        return True
