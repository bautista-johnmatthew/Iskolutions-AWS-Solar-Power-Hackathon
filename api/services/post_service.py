from botocore.exceptions import ClientError
from services.aws_clients import AWSClients
from models.forum_models import PostModel, post_pk, get_timestamp
from services.profanity.checker import check_text
from services.openrouter_api import summarize_pdf
from asyncio import create_task

class PostService:
    def __init__(self, aws_clients: AWSClients):
        self.table = aws_clients.table
        self._tasks = []

    def create_post(self, author_id: str, title: str, content: str,
                    tags=None, attachments=None, is_anonymous=False):

        # ✅ Profanity Check
        title_check = check_text(title)
        content_check = check_text(content)
        if title_check["has_profanity"] or content_check["has_profanity"]:
            raise ValueError({
                "error": "Profanity detected in post creation",
                "title_hits": title_check.get("english_hits", []) +
                title_check.get("tagalog_hits", []),
                "content_hits": content_check.get("english_hits", []) +
                content_check.get("tagalog_hits", [])
            })

        post = PostModel(author_id, title, content, tags,
                         attachments, is_anonymous)
        try:
            self.table.put_item(Item=post.to_item())
            return {"message": "Post created successfully",
                    "post_id": post.post_id}
        except ClientError as e:
            raise RuntimeError(f"Error creating post: {e}")
        
    def add_summary(self, post_id: str, attachments: list):
        if not attachments:
            return {"message": "No attachments to summarize"}
        
        task = create_task(self.process_summary(post_id, attachments))
        self._tasks.append(task)
        task.add_done_callback(lambda t: self._tasks.remove(t))

    async def process_summary(self, post_id, attachments):
        """ Generate summary for the post attachments asynchronously """
        try:
            summary = await summarize_pdf(attachments)
            await self.patch_post(
                post_id=post_id,
                fields={"summary": summary}
            )
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
    
    def get_posts(self):
        try:
            response = self.table.scan(
                FilterExpression="begins_with(PK, :pk) AND SK = :sk",
                ExpressionAttributeValues={":pk": "POST#", ":sk": "METADATA"}
            )
            return response.get("Items", [])
        except ClientError as e:
            raise RuntimeError(f"Error fetching posts: {e}")

    def get_post(self, post_id: str):
        try:
            response = self.table.get_item(Key={"PK": post_pk(post_id),
                                                "SK": "METADATA"})
            return response.get("Item")
        except ClientError as e:
            raise RuntimeError(f"Error fetching post: {e}")

    def update_post(self, post_id: str, title: str, content: str,
                    tags=None, attachments=None, is_anonymous=False):
        existing = self.get_post(post_id)
        if not existing:
            return {"error": "Post not found"}

        # ✅ Profanity Check
        title_check = check_text(title)
        content_check = check_text(content)
        if title_check["has_profanity"] or content_check["has_profanity"]:
            raise ValueError({
                "error": "Profanity detected in update",
                "title_hits": title_check.get("english_hits", [])
                + title_check.get("tagalog_hits", []),
                "content_hits": content_check.get("english_hits", [])
                + content_check.get("tagalog_hits", [])
            })

        try:
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": "METADATA"},
                UpdateExpression=("SET title = :title, content = :content, "
                                  "tags = :tags, attachments = :attachments, "
                                  "is_anonymous = :anon, updated_at = :ts"),
                ExpressionAttributeValues={
                    ":title": title,
                    ":content": content,
                    ":tags": tags or [],
                    ":attachments": attachments or [],
                    ":anon": is_anonymous,
                    ":ts": get_timestamp()
                }
            )
            return {"message": "Post updated successfully"}
        except ClientError as e:
            raise RuntimeError(f"Error updating post: {e}")

    def patch_post(self, post_id: str, updates: dict):
        existing = self.get_post(post_id)
        if not existing:
            return {"error": "Post not found"}

        # ✅ Profanity Check on updated fields
        if "title" in updates:
            title_check = check_text(updates["title"])
            if title_check["has_profanity"]:
                raise ValueError({
                    "error": "Profanity in title",
                    "hits": title_check.get("english_hits", [])
                    + title_check.get("tagalog_hits", [])
                })

        if "content" in updates:
            content_check = check_text(updates["content"])
            if content_check["has_profanity"]:
                raise ValueError({
                    "error": "Profanity in content",
                    "hits": content_check.get("english_hits", [])
                    + content_check.get("tagalog_hits", [])
                })

        update_parts = []
        expr_vals = {":ts": get_timestamp()}
        for key, val in updates.items():
            placeholder = f":{key}"
            update_parts.append(f"{key} = {placeholder}")
            expr_vals[placeholder] = val

        update_expr = "SET " + ", ".join(update_parts) + ", updated_at = :ts"

        try:
            self.table.update_item(
                Key={"PK": post_pk(post_id), "SK": "METADATA"},
                UpdateExpression=update_expr,
                ExpressionAttributeValues=expr_vals
            )
            return {"message": "Post patched successfully"}
        except ClientError as e:
            raise RuntimeError(f"Error patching post: {e}")

    def delete_post(self, post_id: str):
        existing = self.get_post(post_id)
        if not existing:
            return {"error": "Post not found"}

        try:
            self.table.delete_item(Key={"PK": post_pk(post_id),
                                        "SK": "METADATA"})
            return {"message": "Post deleted successfully"}
        except ClientError as e:
            raise RuntimeError(f"Error deleting post: {e}")
