import os
import asyncio
from datetime import datetime
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from pymongo import MongoClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "flowstate_db"
COLLECTION_NAME = "flowstate_events"

# Initialize MongoDB Client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Initialize Embedding Model
# using gemini-embedding-001 as required
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

# Pydantic Schemas
class Event(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: List[str] = [] # List of email addresses or user IDs
    embedding: List[float] = Field(..., description="Vector embedding for semantic search")

class RawEvent(BaseModel):
    """Schema for input data before embedding."""
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: List[str] = []

def generate_embedding(text: str) -> List[float]:
    """Generates a vector embedding for the given text."""
    return embeddings.embed_query(text)

def ingest_event(event_data: dict) -> str:
    """
    Ingests a raw event, generates an embedding, and saves it to MongoDB.
    Returns the inserted document ID.
    """
    # Validate raw input
    raw_event = RawEvent(**event_data)
    
    # Create text for embedding (combine meaningful fields)
    text_to_embed = f"{raw_event.title}"
    if raw_event.description:
        text_to_embed += f" - {raw_event.description}"
    if raw_event.location:
        text_to_embed += f" at {raw_event.location}"

    # Generate Embedding
    print(f"Generating embedding for: {raw_event.title}...")
    vector = generate_embedding(text_to_embed)

    # Create full Event object
    event_dict = raw_event.model_dump()
    event_dict["embedding"] = vector
    
    # Insert into MongoDB
    # Note: We don't use the 'Event' model for insertion directly to let Mongo handle _id creation naturally 
    # unless we want to force validation before insertion.
    # Let's validate to be safe.
    # We pass 'id' as None so it doesn't try to put a null _id in Mongo if it's not set.
    validated_event = Event(**event_dict)
    
    # Convert back to dict for insertion, excluding None _id
    insert_data = validated_event.model_dump(by_alias=True, exclude={"id"} if validated_event.id is None else set())
    
    result = collection.insert_one(insert_data)
    print(f"Successfully inserted event with ID: {result.inserted_id}")
    return str(result.inserted_id)

if __name__ == "__main__":
    # Sample Usage
    sample_event = {
        "title": "Deep Work Session",
        "description": "Focused coding block for the intake pipeline.",
        "start_time": datetime.now(),
        "end_time": datetime.now(), # In practice this would be later
        "location": "Home Office",
        "attendees": ["me@example.com"]
    }

    try:
        inserted_id = ingest_event(sample_event)
        print("Test Ingestion Complete.")
    except Exception as e:
        print(f"Error during ingestion: {e}")
