import uuid
from typing import Dict, Any, List
from botocore.exceptions import ClientError
from services.aws_clients import AWSClients
from models.forum_models import get_timestamp
from services.profanity.checker import check_text


class CommentService:
    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table

    async def create_comment(self, post_id: str,
                             data: Dict[str, Any]) -> Dict[str, Any]:
        # ✅ Profanity Check
        content_check = check_text(data["content"])
        if content_check["has_profanity"]:
            raise ValueError({
                "error": "Profanity detected in comment",
                "hits": content_check.get("english_hits", [])
                + content_check.get("tagalog_hits", [])
            })

        comment_id = str(uuid.uuid4())
        item = {
            "PK": f"POST#{post_id}",
            "SK": f"COMMENT#{comment_id}",
            "id": comment_id,
            "content": data["content"],
            "author_id": data["author_id"],
            "is_anonymous": data.get("is_anonymous", False),
            "created_at": get_timestamp(),
            "updated_at": get_timestamp(),
        }
        self.table.put_item(Item=item)
        return item

    async def get_comments(self, post_id: str) -> List[Dict[str, Any]]:
        resp = self.table.query(
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues={":pk": f"POST#{post_id}",
                                       ":sk": "COMMENT#"}
        )
        return resp.get("Items", [])

    async def get_comment(self, post_id: str,
                          comment_id: str) -> Dict[str, Any]:
        resp = self.table.get_item(Key={"PK": f"POST#{post_id}", "SK":
                                        f"COMMENT#{comment_id}"})
        return resp.get("Item")

    async def update_comment(self, post_id: str, comment_id: str,
                             data: Dict[str, Any]) -> Dict[str, Any]:
        # ✅ Profanity Check
        content_check = check_text(data["content"])
        if content_check["has_profanity"]:
            raise ValueError({
                "error": "Profanity in updated comment",
                "hits": content_check.get("english_hits", [])
                + content_check.get("tagalog_hits", [])
            })

        update_expr = "SET content = :c, updated_at = :u"
        expr_vals = {":c": data["content"], ":u": get_timestamp()}
        resp = self.table.update_item(
            Key={"PK": f"POST#{post_id}", "SK": f"COMMENT#{comment_id}"},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_vals,
            ReturnValues="ALL_NEW"
        )
        return resp["Attributes"]

    async def patch_comment(self, post_id: str, comment_id: str,
                            data: Dict[str, Any]) -> Dict[str, Any]:
        if "content" in data:
            content_check = check_text(data["content"])
            if content_check["has_profanity"]:
                raise ValueError({
                    "error": "Profanity in patched comment",
                    "hits": content_check.get("english_hits", [])
                    + content_check.get("tagalog_hits", [])
                })

        update_parts = []
        expr_vals = {":u": get_timestamp()}
        for key, val in data.items():
            update_parts.append(f"{key} = :{key}")
            expr_vals[f":{key}"] = val
        update_expr = "SET " + ", ".join(update_parts) + ", updated_at = :u"
        resp = self.table.update_item(
            Key={"PK": f"POST#{post_id}", "SK": f"COMMENT#{comment_id}"},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_vals,
            ReturnValues="ALL_NEW"
        )
        return resp["Attributes"]

    async def delete_comment(self, post_id: str,
                             comment_id: str) -> Dict[str, Any]:
        resp = self.table.delete_item(
            Key={"PK": f"POST#{post_id}", "SK": f"COMMENT#{comment_id}"},
            ReturnValues="ALL_OLD"
        )
        return resp.get("Attributes")
