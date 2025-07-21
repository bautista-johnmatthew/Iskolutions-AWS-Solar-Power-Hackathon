import uuid
from botocore.exceptions import ClientError
from services.aws_clients import AWSClients
from models.forum_models import UserModel, PostModel, CommentModel, VoteModel
from schemas.forum_schemas import PostCreate, CommentCreate, VoteCreate

# ======================
# |     POST CRUD      |
# ======================

async def create_post(data: PostCreate, aws: AWSClients) -> dict:
    """Create a new post in DynamoDB"""
    post = PostModel(
        author_id=data.author_id,
        title=data.title,
        content=data.content,
        tags=data.tags,
        attachments=data.attachments,
        is_anonymous=data.is_anonymous
    )
    item = post.to_item()
    aws.table.put_item(Item=item)
    return item

async def get_posts(aws: AWSClients) -> list:
    """Retrieve all posts"""
    try:
        response = aws.table.scan(
            FilterExpression="begins_with(PK, :prefix)",
            ExpressionAttributeValues={":prefix": "POST#"}
        )
        return response.get("Items", [])
    except ClientError as e:
        raise Exception(f"DynamoDB Error: {str(e)}")

async def get_post(post_id: str, aws: AWSClients) -> dict:
    """Retrieve a single post by ID"""
    response = aws.table.get_item(Key={"PK": f"POST#{post_id}", "SK": "METADATA"})
    return response.get("Item")

async def delete_post(post_id: str, aws: AWSClients) -> bool:
    """Delete a post"""
    aws.table.delete_item(Key={"PK": f"POST#{post_id}", "SK": "METADATA"})
    return True

# =========================
# |   COMMENT CRUD        |
# =========================

async def create_comment(post_id: str, data: CommentCreate, aws: AWSClients) -> dict:
    """Create a comment under a post"""
    comment = CommentModel(
        post_id=post_id,
        author_id=data.author_id,
        content=data.content,
        parent_comment_id=data.parent_comment_id,
        is_anonymous=data.is_anonymous
    )
    item = comment.to_item()
    aws.table.put_item(Item=item)
    return item

async def get_comments(post_id: str, aws: AWSClients) -> list:
    """Retrieve all comments for a post"""
    response = aws.table.query(
        KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues={":pk": f"POST#{post_id}", ":sk": "COMMENT#"}
    )
    return response.get("Items", [])

# ======================
# |     VOTE CRUD      |
# ======================

async def create_vote(post_id: str, data: VoteCreate, aws: AWSClients) -> dict:
    """Create a vote for a post"""
    vote = VoteModel(post_id=post_id, user_id=data.user_id, vote_type=data.vote_type)
    item = vote.to_item()
    aws.table.put_item(Item=item)
    return item

async def get_votes(post_id: str, aws: AWSClients) -> list:
    """Retrieve all votes for a post"""
    response = aws.table.query(
        KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues={":pk": f"POST#{post_id}", ":sk": "VOTE#"}
    )
    return response.get("Items", [])

# ======================
# |     S3 Upload      |
# ======================

async def upload_file_to_s3(file_name: str, file_content: bytes, aws: AWSClients) -> str:
    """Upload a file to S3 and return its URL"""
    try:
        aws.s3.put_object(Bucket=aws.s3_bucket, Key=file_name, Body=file_content)
        return f"https://{aws.s3_bucket}.s3.amazonaws.com/{file_name}"
    except ClientError as e:
        raise Exception(f"S3 Upload Error: {str(e)}")
