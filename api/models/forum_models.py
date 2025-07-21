import uuid
from datetime import datetime
from typing import List, Optional

def now_iso():
    return datetime.utcnow().isoformat()

# ---------- Base ----------
class DynamoBase:
    @staticmethod
    def timestamp():
        return now_iso()

# ---------- USER ----------
class UserModel(DynamoBase):
    def __init__(self, username, email, password_hash, role="student", 
                 student_id=None, verification_status="pending"):
        self.user_id = str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role  # student | faculty | moderator
        self.student_id = student_id
        self.verification_status = verification_status
        self.reputation = 0

    def to_item(self):
        return {
            "PK": f"USER#{self.user_id}",
            "SK": "PROFILE",
            "id": self.user_id,
            "username": self.username,
            "email": self.email,
            "password": self.password_hash,
            "role": self.role,
            "student_id": self.student_id,
            "verification_status": self.verification_status,
            "reputation": self.reputation,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }

# ---------- POST ----------
class PostModel(DynamoBase):
    def __init__(self, author_id, title, content, tags=None, 
                 attachments=None, is_anonymous=False):
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
            "id": self.post_id,
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
            "attachments": self.attachments,
            "author_id": self.author_id,
            "is_anonymous": self.is_anonymous,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }

# ---------- COMMENT ----------
class CommentModel(DynamoBase):
    def __init__(self, post_id, author_id, content, 
                 parent_comment_id=None, is_anonymous=False):
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
            "id": self.comment_id,
            "content": self.content,
            "author_id": self.author_id,
            "is_anonymous": self.is_anonymous,
            "parent_comment_id": self.parent_comment_id,
            "upvotes": 0,
            "downvotes": 0,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }

# ---------- VOTE ----------
class VoteModel(DynamoBase):
    def __init__(self, post_id, user_id, vote_type):
        self.post_id = post_id
        self.user_id = user_id
        self.vote_type = vote_type  # "up" or "down"

    def to_item(self):
        return {
            "PK": f"POST#{self.post_id}",
            "SK": f"VOTE#USER#{self.user_id}",
            "vote_type": self.vote_type,
            "created_at": self.timestamp(),
            "updated_at": self.timestamp(),
        }