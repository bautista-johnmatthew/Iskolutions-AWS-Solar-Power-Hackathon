from botocore.exceptions import ClientError
from services.aws_clients import AWSClients

class UtilityService:
    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table

    def search_posts(self, query: str):
        """Search posts by title or content"""
        try:
            response = self.table.scan(
                FilterExpression="contains(title, :q) OR contains(content, :q)",
                ExpressionAttributeValues={":q": query}
            )
            return response.get("Items", [])
        except ClientError as e:
            raise RuntimeError(f"Error searching posts: {e}")

    def get_recent_posts(self, limit=10):
        """Get most recent posts by created_at"""
        try:
            response = self.table.scan()
            posts = [item for item in response.get("Items", [])
                     if item.get("SK") == "POST"]
            return sorted(posts, key=lambda x: x.get("created_at", 0),
                          reverse=True)[:limit]
        except ClientError as e:
            raise RuntimeError(f"Error fetching recent posts: {e}")

    def get_trending(self, limit=10):
        """Get trending posts based on upvotes + downvotes"""
        try:
            response = self.table.scan()
            posts = [item for item in response.get("Items", [])
                     if item.get("SK") == "POST"]
            return sorted(posts,
                          key=lambda x: x.get("upvotes", 0) +
                                        x.get("downvotes", 0),
                          reverse=True)[:limit]
        except ClientError as e:
            raise RuntimeError(f"Error fetching trending posts: {e}")
