import uuid
from datetime import datetime
from typing import Optional, List

def now_iso():
    return datetime.utcnow().isoformat()

# ---------- Base ----------
class DynamoBase:
    @staticmethod
    def timestamp():
        return now_iso()

# ---------- User ----------
class UserModel(DynamoBase):
    def __init__(self, username, email, password_hash, role="student", student_id=None):
        self.user_id = str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.student_id = student_id

    def to_item(self):
        return {
            "PK": f"USER#{self.user_id}",
            "SK": "PROFILE",
            "username": self.username,
            "id": self.user_id,
            "email": self.email,
            "password": self.password_hash,
            "role": self.role,
            "student_id": self.student_id,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }

# ---------- Post ----------
class PostModel(DynamoBase):
    def __init__(self, author_id, title, content, tags=None, attachments=None, is_anonymous=False):
        self.post_id = str(uuid.uuid4())
        self.author_id = author_id
        self.title = title
        self.content = content
        self.tags = tags or []
        self.attachments = attachments or []
        self.is_anonymous = is_anonymous

    def to_item(self):
        return {
            "PK": f"POST#{self.post_id}",
            "SK": "METADATA",
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
            "attachments": self.attachments,
            "author_id": self.author_id,
            "is_anonymous": self.is_anonymous,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }

# ---------- Comment ----------
class CommentModel(DynamoBase):
    def __init__(self, post_id, author_id, content, parent_comment_id=None, is_anonymous=False):
        self.comment_id = str(uuid.uuid4())
        self.post_id = post_id
        self.author_id = author_id
        self.content = content
        self.parent_comment_id = parent_comment_id
        self.is_anonymous = is_anonymous

    def to_item(self):
        return {
            "PK": f"POST#{self.post_id}",
            "SK": f"COMMENT#{self.comment_id}",
            "content": self.content,
            "author_id": self.author_id,
            "is_anonymous": self.is_anonymous,
            "parent_comment_id": self.parent_comment_id,
            "upvotes": 0,
            "downvotes": 0,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }

# ---------- Vote ----------
class VoteModel(DynamoBase):
    def __init__(self, post_id, user_id, vote_type):
        self.post_id = post_id
        self.user_id = user_id
        self.vote_type = vote_type

    def to_item(self):
        return {
            "PK": f"POST#{self.post_id}",
            "SK": f"VOTE#USER#{self.user_id}",
            "vote_type": self.vote_type,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }