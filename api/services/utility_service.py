from typing import List, Dict, Any
from boto3.dynamodb.conditions import Key
from services.aws_clients import AWSClients
import logging

logger = logging.getLogger(__name__)


class UtilityService:
    """Service class for utility operations like search, trending, and 
    recent posts."""

    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table

    def search_posts(self, query: str, limit: int = 10) -> List[
        Dict[str, Any]]:
        """Search posts by title or content with validation and limit."""
        if not isinstance(query, str) or not query.strip():
            raise ValueError("Query must be a non-empty string.")
        if len(query) > 100:
            raise ValueError("Query is too long. Maximum length is 100 " \
            "characters.")

        try:
            response = self.table.scan(
                FilterExpression="contains(title, :q) OR contains(content, " \
                ":q)",
                ExpressionAttributeValues={":q": query.strip()},
                Limit=limit
            )
            items = response.get("Items", [])
            return [item for item in items if item.get("SK") == "POST"]
        except Exception as e:
            logger.error(f"Error searching posts: {e}")
            raise

    def get_trending_posts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending posts sorted by vote activity (upvotes + downvotes)."""
        try:
            posts = []
            last_evaluated_key = None
            while True:
                response = (
                    self.table.scan(ExclusiveStartKey=last_evaluated_key)
                    if last_evaluated_key
                    else self.table.scan()
                )
                posts.extend([item for item in response.get("Items", []) 
                              if item.get("SK") == "POST"])
                last_evaluated_key = response.get("LastEvaluatedKey")
                if not last_evaluated_key:
                    break

            return sorted(
                posts,
                key=lambda x: x.get("upvotes", 0) + x.get("downvotes", 0),
                reverse=True
            )[:limit]
        except Exception as e:
            logger.error(f"Error fetching trending posts: {e}")
            raise

    def get_recent_posts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get the most recent posts."""
        try:
            posts = []
            last_evaluated_key = None
            while True:
                response = (
                    self.table.scan(ExclusiveStartKey=last_evaluated_key)
                    if last_evaluated_key
                    else self.table.scan()
                )
                posts.extend([item for item in response.get("Items", []) 
                              if item.get("SK") == "POST"])
                last_evaluated_key = response.get("LastEvaluatedKey")
                if not last_evaluated_key:
                    break

            return sorted(posts, key=lambda x: x.get("created_at", ""), 
                          reverse=True)[:limit]
        except Exception as e:
            logger.error(f"Error fetching recent posts: {e}")
            raise
