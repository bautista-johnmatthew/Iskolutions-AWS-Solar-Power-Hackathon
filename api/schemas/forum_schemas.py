from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Shared mixin for timestamps
class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Enums (reused in schemas for OpenAPI)
class UserRole(str, Enum):
    student = "student"
    faculty = "faculty"
    moderator = "moderator"

class VoteType(str, Enum):
    up = "up"
    down = "down"

# USER SCHEMAS
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.student

class UserCreate(UserBase):
    password: str
    student_id: Optional[str] = None  # For verification
    is_verified: bool = False

class UserResponse(UserBase, TimestampMixin):
    user_id: str

# POST SCHEMAS
class PostBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    is_anonymous: bool = False
    attachments: List[str] = []  # S3 URLs

class PostCreate(PostBase):
    author_id: str

class PostResponse(PostBase, TimestampMixin):
    post_id: str
    author_id: str
    upvotes: int = 0
    downvotes: int = 0

# COMMENT SCHEMAS
class CommentBase(BaseModel):
    content: str
    is_anonymous: bool = False

class CommentCreate(CommentBase):
    author_id: str
    parent_comment_id: Optional[str] = None

class CommentResponse(CommentBase, TimestampMixin):
    comment_id: str
    post_id: str
    author_id: str
    upvotes: int = 0
    downvotes: int = 0

# VOTE SCHEMAS
class VoteBase(BaseModel):
    vote_type: VoteType

class VoteCreate(VoteBase):
    user_id: str

class VoteResponse(VoteBase, TimestampMixin):
    user_id: str
    post_id: str
