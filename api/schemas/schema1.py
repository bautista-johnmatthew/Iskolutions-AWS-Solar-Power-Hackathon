from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ---------- USER ----------
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "student"  # student | faculty | moderator
    student_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: str
    student_id: Optional[str]
    verification_status: str
    reputation: int

# ---------- POST ----------
class PostCreate(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []
    attachments: Optional[List[str]] = []
    is_anonymous: bool = False

class PostResponse(BaseModel):
    id: str
    title: str
    content: str
    tags: List[str]
    attachments: List[str]
    author_id: str
    is_anonymous: bool

# ---------- COMMENT ----------
class CommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[str] = None
    is_anonymous: bool = False

class CommentResponse(BaseModel):
    id: str
    content: str
    author_id: str
    upvotes: int
    downvotes: int
    parent_comment_id: Optional[str]

# ---------- VOTE ----------
class VoteCreate(BaseModel):
    vote_type: str  # "up" or "down"