import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

# ============ Utilities ============
def get_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()

# ============ Enums ============
class UserRole(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    MODERATOR = "moderator"

class VoteType(str, Enum):
    UP = "up"
    DOWN = "down"

# ============ PK/SK Helpers ============
def user_pk(user_id: str) -> str:
    return f"USER#{user_id}"

def post_pk(post_id: str) -> str:
    return f"POST#{post_id}"

def comment_sk(comment_id: str) -> str:
    return f"COMMENT#{comment_id}"

def vote_sk(user_id: str) -> str:
    return f"VOTE#USER#{user_id}"

# ============ MODELS ============
class UserModel:
    def __init__(self, username: str, email: str, password_hash: str,
                 role: UserRole = UserRole.STUDENT, student_id: Optional[str] = None, is_verified: bool = False):
        self.user_id = str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.student_id = student_id
        self.is_verified = is_verified

    def to_item(self):
        return {
            "PK": user_pk(self.user_id),
            "SK": "PROFILE",
            "id": self.user_id,
            "username": self.username,
            "email": self.email,
            "password": self.password_hash,
            "role": self.role.value,
            "student_id": self.student_id,
            "is_verified": self.is_verified,
            "created_at": get_timestamp(),
            "updated_at": get_timestamp(),
        }

class PostModel:
    def __init__(self, author_id: str, title: str, content: str,
                 tags: Optional[List[str]] = None, attachments: Optional[List[str]] = None, is_anonymous: bool = False):
        self.post_id = str(uuid.uuid4())
        self.author_id = author_id
        self.title = title
        self.content = content
        self.tags = tags or []
        self.attachments = attachments or []
        self.is_anonymous = is_anonymous
        self.upvotes = 0
        self.downvotes = 0

    def to_item(self):
        return {
            "PK": post_pk(self.post_id),
            "SK": "METADATA",
            "id": self.post_id,
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
            "attachments": self.attachments,
            "author_id": self.author_id,
            "is_anonymous": self.is_anonymous,
            "upvotes": self.upvotes,
            "downvotes": self.downvotes,
            "created_at": get_timestamp(),
            "updated_at": get_timestamp(),
        }

class CommentModel:
    def __init__(
        self,
        post_id: str,
        author_id: str,
        content: str,
        is_anonymous: bool = False
    ):
        self.comment_id = str(uuid.uuid4())
        self.post_id = post_id
        self.author_id = author_id
        self.content = content
        self.is_anonymous = is_anonymous

    def to_item(self):
        return {
            "PK": post_pk(self.post_id),
            "SK": comment_sk(self.comment_id),
            "id": self.comment_id,
            "content": self.content,
            "author_id": self.author_id,
            "is_anonymous": self.is_anonymous,
            "created_at": get_timestamp(),
            "updated_at": get_timestamp(),
        }

class VoteModel:
    def __init__(self, post_id: str, user_id: str, vote_type: VoteType):
        self.post_id = post_id
        self.user_id = user_id
        self.vote_type = vote_type

    def to_item(self):
        return {
            "PK": post_pk(self.post_id),
            "SK": vote_sk(self.user_id),
            "vote_type": self.vote_type.value,
            "created_at": get_timestamp(),
            "updated_at": get_timestamp(),
        }
