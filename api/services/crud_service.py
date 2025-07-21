from models.forum_models import PostModel
from schemas.forum_schemas import PostCreate, PostResponse
from services.aws_clients import AWSClients
from boto3.dynamodb.conditions import Key
from typing import List
from decimal import Decimal
import json


def decimal_to_float(obj):
    """Convert DynamoDB Decimals to float for JSON serialization."""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


async def create_post(data: PostCreate, aws_clients: AWSClients) -> PostResponse:
    post = PostModel(
        author_id=data.author_id,
        title=data.title,
        content=data.content,
        tags=data.tags,
        attachments=data.attachments,
        is_anonymous=data.is_anonymous
    )

    item = post.to_item()
    aws_clients.table.put_item(Item=item)

    return PostResponse(**item)


async def get_posts(aws_clients: AWSClients) -> List[PostResponse]:
    response = aws_clients.table.scan(
        FilterExpression=Key("SK").eq("METADATA")
    )
    items = response.get("Items", [])
    return [PostResponse(**item) for item in items]


async def get_post(post_id: str, aws_clients: AWSClients) -> PostResponse | None:
    response = aws_clients.table.get_item(
        Key={"PK": f"POST#{post_id}", "SK": "METADATA"}
    )
    item = response.get("Item")
    if not item:
        return None
    return PostResponse(**item)


async def update_post(post_id: str, data: PostCreate, aws_clients: AWSClients) -> PostResponse:
    # Overwrite with new data
    response = aws_clients.table.update_item(
        Key={"PK": f"POST#{post_id}", "SK": "METADATA"},
        UpdateExpression="SET title=:t, content=:c, tags=:tg, attachments=:a, updated_at=:u",
        ExpressionAttributeValues={
            ":t": data.title,
            ":c": data.content,
            ":tg": data.tags,
            ":a": data.attachments,
            ":u": data.updated_at.isoformat() if hasattr(data, 'updated_at') else None
        },
        ReturnValues="ALL_NEW"
    )
    return PostResponse(**response["Attributes"])


async def delete_post(post_id: str, aws_clients: AWSClients):
    aws_clients.table.delete_item(Key={"PK": f"POST#{post_id}", "SK": "METADATA"})

# api/services/crud_service.py

async def patch_post(post_id: str, data: dict, aws_clients: AWSClients) -> PostResponse:
    # Build dynamic update expression
    update_expr = []
    expr_attr_values = {}
    for key, value in data.items():
        update_expr.append(f"{key}=:{key}")
        expr_attr_values[f":{key}"] = value

    update_expr.append("updated_at=:updated_at")
    expr_attr_values[":updated_at"] = get_timestamp()

    response = aws_clients.table.update_item(
        Key={"PK": f"POST#{post_id}", "SK": "METADATA"},
        UpdateExpression="SET " + ", ".join(update_expr),
        ExpressionAttributeValues=expr_attr_values,
        ReturnValues="ALL_NEW"
    )
    return PostResponse(**response["Attributes"])
