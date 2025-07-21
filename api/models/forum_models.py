import os
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource("dynamodb")
TABLE = dynamodb.Table(os.getenv("DYNAMO_DB_TABLE"))

def _timestamp():
    return datetime.now(timezone.utc).isoformat()

# ---- USER ----
def create_user_profile(user_id: str, data: dict):
    item = {
        "PK": f"USER#{user_id}",
        "SK": "PROFILE",
        **data,
        "created_at": _timestamp(),
        "updated_at": _timestamp()
    }
    TABLE.put_item(Item=item)
    return item

# ---- POST ----
def create_post(post_id: str, user_id: str, data: dict):
    item = {
        "PK": f"POST#{post_id}",
        "SK": "METADATA",
        "author_id": user_id,
        **data,
        "created_at": _timestamp(),
        "updated_at": _timestamp()
    }
    TABLE.put_item(Item=item)
    return item

# ---- COMMENT ----
def create_comment(post_id: str, comment_id: str, user_id: str, data: dict):
    item = {
        "PK": f"POST#{post_id}",
        "SK": f"COMMENT#{comment_id}",
        "author_id": user_id,
        "upvotes": 0,
        "downvotes": 0,
        **data,
        "created_at": _timestamp(),
        "updated_at": _timestamp()
    }
    TABLE.put_item(Item=item)
    return item

# ---- VOTE ----
def create_vote(post_id: str, user_id: str, vote_type: str):
    item = {
        "PK": f"POST#{post_id}",
        "SK": f"VOTE#USER#{user_id}",
        "vote_type": vote_type,
        "created_at": _timestamp()
    }
    TABLE.put_item(Item=item)
    return item
