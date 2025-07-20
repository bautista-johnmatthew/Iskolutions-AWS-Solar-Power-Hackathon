from pydantic import BaseModel, EmailStr
from typing import List, Optional

# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "student"
    student_id: Optional[str]

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    role: str
    student_id: Optional[str]

# Post Schemas
class PostCreate(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []
    attachments: Optional[List[str]] = []
    is_anonymous: bool = False

class PostResponse(BaseModel):
    post_id: str
    title: str
    content: str
    tags: List[str]
    attachments: List[str]
    author_id: str
    is_anonymous: bool

# Comment Schemas
class CommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[str] = None
    is_anonymous: bool = False

# Vote Schema
class VoteCreate(BaseModel):
    vote_type: str  # "up" or "down"
