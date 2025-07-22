from botocore.exceptions import ClientError
from services.aws_clients import AWSClients
from models.forum_models import get_timestamp, vote_sk, post_pk, comment_sk
from enum import Enum
from typing import Literal


class VoteService:
    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table

    def vote_post(self, post_id: str, user_id: str, vote_type: 
                  Literal["up", "down"]):
        try:
            # Store vote item
            self.table.put_item(
                Item={
                    "PK": post_pk(post_id),
                    "SK": vote_sk(user_id),
                    "vote_type": vote_type,
                    "created_at": get_timestamp(),
                }
            )

            # Update counters atomically
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": "METADATA"},
                UpdateExpression=f"SET #updated_at = :ts ADD {vote_type}votes :inc",
                ExpressionAttributeNames={"#updated_at": "updated_at"},
                ExpressionAttributeValues={":inc": 1, ":ts": get_timestamp()},
            )
            return {"message": f"Vote {vote_type} recorded"}
        except ClientError as e:
            print(f"DynamoDB Error: {e}")
            raise

    def remove_post_vote(self, post_id: str, user_id: str, vote_type: Literal["up", "down"]):
        try:
            self.table.delete_item(Key={"PK": post_pk(post_id), "SK": vote_sk(user_id)})

            # Decrement counters atomically
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": "METADATA"},
                UpdateExpression=f"SET #updated_at = :ts ADD {vote_type}votes :dec",
                ExpressionAttributeNames={"#updated_at": "updated_at"},
                ExpressionAttributeValues={":dec": -1, ":ts": get_timestamp()},
            )
            return {"message": f"Vote {vote_type} removed"}
        except ClientError as e:
            print(f"DynamoDB Error: {e}")
            raise

    def vote_comment(self, post_id: str, comment_id: str, user_id: str, vote_type: Literal["up", "down"]):
        try:
            self.table.put_item(
                Item={
                    "PK": post_pk(post_id),
                    "SK": f"{comment_sk(comment_id)}#{vote_sk(user_id)}",
                    "vote_type": vote_type,
                    "created_at": get_timestamp(),
                }
            )

            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": comment_sk(comment_id)},
                UpdateExpression=f"SET #updated_at = :ts ADD {vote_type}votes :inc",
                ExpressionAttributeNames={"#updated_at": "updated_at"},
                ExpressionAttributeValues={":inc": 1, ":ts": get_timestamp()},
            )
            return {"message": f"Comment vote {vote_type} recorded"}
        except ClientError as e:
            print(f"DynamoDB Error: {e}")
            raise

    def remove_comment_vote(self, post_id: str, comment_id: str, user_id: str, vote_type: Literal["up", "down"]):
        try:
            self.table.delete_item(Key={"PK": post_pk(post_id), "SK": f"{comment_sk(comment_id)}#{vote_sk(user_id)}"})

            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": comment_sk(comment_id)},
                UpdateExpression=f"SET #updated_at = :ts ADD {vote_type}votes :dec",
                ExpressionAttributeNames={"#updated_at": "updated_at"},
                ExpressionAttributeValues={":dec": -1, ":ts": get_timestamp()},
            )
            return {"message": f"Comment vote {vote_type} removed"}
        except ClientError as e:
            print(f"DynamoDB Error: {e}")
            raise
