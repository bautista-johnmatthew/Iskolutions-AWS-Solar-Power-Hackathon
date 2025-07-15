from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import boto3

app = FastAPI(title="My Notes API", version="1.0.0",
        description="API for taking notes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DYNAMO_TABLE_NAME = "notes"
# S3_BUCKET_NAME = "my-notes-bucket"

# dynamodb = boto3.resource('dynamodb')
# s3 = boto3.client('s3')

# Models
class Note(BaseModel):
    id: str
    title: str
    content: str
    created_at: str
    updated_at: str
    images: List[str] = []
    image_urls: List[str] = []

# Schemas
class NoteCreate(BaseModel):
    title: str
    content: str
    images: List[str] = []
class NoteUpdate(BaseModel):
    title: str = None
    content: str = None
    images: List[str] = []

# Endpoints
@app.get("/")
async def read_root():
    return {"message" : "Welcome to notepad"}

@app.get("/health")
async def health():
    return {"status" : "healthy"}

@app.get("/notes")
async def get_notes():
    pass

@app.post("/notes")
async def create_note(note: NoteCreate):
    pass

@app.get("/notes/{note_id}")
async def get_note(note_id: str):
    pass

@app.put("/notes/{note_id}")
async def update_note(note_id: str, note: NoteUpdate):
    pass

@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
