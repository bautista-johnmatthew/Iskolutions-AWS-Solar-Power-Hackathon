import logging
from typing import Literal
from botocore.exceptions import ClientError
from services.aws_clients import AWSClients
from models.forum_models import get_timestamp, vote_sk, post_pk, comment_sk

logger = logging.getLogger(__name__)


class VoteService:
    """
    Service for handling vote-related operations on posts and comments.
    """

    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table

    # =========================
    # |      POST VOTES       |
    # =========================
    def vote_post(
        self,
        post_id: str,
        vote_type: Literal["up", "down"],
        user_id: str = "Guest",
    ):
        try:
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": "METADATA"},
                UpdateExpression=(
                    "SET #updated_at = :ts ADD #vote_counter :inc"
                ),
                ExpressionAttributeNames={
                    "#updated_at": "updated_at",
                    "#vote_counter": f"{vote_type}votes",
                },
                ExpressionAttributeValues={
                    ":ts": get_timestamp(),
                    ":inc": 1,
                },
            )
            vote_item = {
                "PK": post_pk(post_id),
                "SK": vote_sk(user_id),
                "vote_type": vote_type,
                "created_at": get_timestamp(),
            }
            self.table.put_item(Item=vote_item)
            return {"message": f"{vote_type.capitalize()}vote added to post"}
        except ClientError as e:
            logger.error(f"DynamoDB Error (vote_post): {e}")
            raise

    def remove_post_vote(self, post_id: str, user_id: str,
                         vote_type: Literal["up", "down"]):
        try:
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": "METADATA"},
                UpdateExpression=(
                    "SET #updated_at = :ts ADD #vote_counter :dec"
                ),
                ExpressionAttributeNames={
                    "#updated_at": "updated_at",
                    "#vote_counter": f"{vote_type}votes",
                },
                ExpressionAttributeValues={
                    ":ts": get_timestamp(),
                    ":dec": -1,
                },
            )
            self.table.delete_item(
                Key={"PK": post_pk(post_id), "SK": vote_sk(user_id)}
            )
            return {"message": 
                    f"{vote_type.capitalize()}vote removed from post"}
        except ClientError as e:
            logger.error(f"DynamoDB Error (remove_post_vote): {e}")
            raise

    # =========================
    # |    COMMENT VOTES      |
    # =========================
    def vote_comment(self, comment_id: str, post_id: str, user_id: str,
                     vote_type: Literal["up", "down"]):
        try:
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": comment_sk(comment_id)},
                UpdateExpression=(
                    "SET #updated_at = :ts ADD #vote_counter :inc"
                ),
                ExpressionAttributeNames={
                    "#updated_at": "updated_at",
                    "#vote_counter": f"{vote_type}votes",
                },
                ExpressionAttributeValues={
                    ":ts": get_timestamp(),
                    ":inc": 1,
                },
            )
            vote_item = {
                "PK": comment_sk(comment_id),
                "SK": vote_sk(user_id),
                "vote_type": vote_type,
                "created_at": get_timestamp(),
            }
            self.table.put_item(Item=vote_item)
            return {"message": 
                    f"{vote_type.capitalize()}vote added to comment"}
        except ClientError as e:
            logger.error(f"DynamoDB Error (vote_comment): {e}")
            raise

    def remove_comment_vote(self, comment_id: str, post_id: str, user_id: str,
                            vote_type: Literal["up", "down"]):
        try:
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": comment_sk(comment_id)},
                UpdateExpression=(
                    "SET #updated_at = :ts ADD #vote_counter :dec"
                ),
                ExpressionAttributeNames={
                    "#updated_at": "updated_at",
                    "#vote_counter": f"{vote_type}votes",
                },
                ExpressionAttributeValues={
                    ":ts": get_timestamp(),
                    ":dec": -1,
                },
            )
            self.table.delete_item(
                Key={"PK": comment_sk(comment_id), "SK": vote_sk(user_id)}
            )
            return {"message": 
                    f"{vote_type.capitalize()}vote removed from comment"}
        except ClientError as e:
            logger.error(f"DynamoDB Error (remove_comment_vote): {e}")
            raise
