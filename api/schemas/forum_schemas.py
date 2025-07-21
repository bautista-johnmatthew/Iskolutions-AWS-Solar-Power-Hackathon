from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

# ---- ENUM-LIKE LITERALS ----
RoleType = Literal["student", "faculty", "moderator"]
VoteType = Literal["up", "down"]

# ---- BASE MIXINS ----
class AnonymousMixin(BaseModel):
    is_anonymous: bool = False

# ---- USER SCHEMAS ----
class UserProfile(BaseModel):
    username: str
    student_id: str
    role: RoleType = "student"
    verification_status: str = "pending"

# ---- POST SCHEMAS ----
class CreatePost(AnonymousMixin):
    title: str
    content: str
    tags: List[str]
    attachments: Optional[List[str]] = []

class PostResponse(CreatePost):
    post_id: str
    author_id: str
    created_at: datetime
    updated_at: datetime

# ---- COMMENT SCHEMAS ----
class CreateComment(AnonymousMixin):
    content: str
    parent_comment_id: Optional[str] = None

class CommentResponse(CreateComment):
    comment_id: str
    post_id: str
    author_id: str
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: datetime

# ---- VOTE SCHEMA ----
class VoteAction(BaseModel):
    vote_type: VoteType