from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime

# Helper for handling ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: List[str] = [] # List of email addresses or user IDs

class EventCreate(EventBase):
    embedding: List[float] = Field(..., description="Vector embedding for semantic search")

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    attendees: Optional[List[str]] = None
    embedding: Optional[List[float]] = None

class Event(EventBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    embedding: List[float] = Field(..., description="Vector embedding for semantic search")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
