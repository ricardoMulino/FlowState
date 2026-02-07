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
COLLECTION_NAME = "flowstate_tasks"

# Initialize MongoDB Client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Initialize Embedding Model
# using gemini-embedding-001 as required
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

# Pydantic Schemas
class Task(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    tags: Optional[List[str]] = None
    tag_description: Optional[List[str]] = None
    task_description: Optional[str] = None
    embedding: List[float] = Field(..., description="Vector embedding for semantic search")

class RawTask(BaseModel):
    """Schema for input data before embedding."""
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    end_time: datetime
   


def generate_embedding(text: str) -> List[float]:
    """Generates a vector embedding for the given text."""
    return embeddings.embed_query(text)


def ingest_task(task_data: dict) -> str:
    """
    Ingests a raw task, generates an embedding, and saves it to MongoDB.
    Returns the inserted document ID.
    """
    # Validate raw input
    raw_task = Rawtask(**task_data)
    
    # Create text for embedding (combine meaningful fields)
    text_to_embed = f"{raw_task.title}"
    if raw_task.description:
        text_to_embed += f" - {raw_task.description}"
   
    # Generate Embedding
    print(f"Generating embedding for: {raw_task.title}...")
    vector = generate_embedding(text_to_embed)

    # Create full Task object
    task_dict = raw_task.model_dump()
    task_dict["embedding"] = vector
    
    # Insert into MongoDB
    # Note: We don't use the 'Task' model for insertion directly to let Mongo handle _id creation naturally 
    # unless we want to force validation before insertion.
    # Let's validate to be safe.
    # We pass 'id' as None so it doesn't try to put a null _id in Mongo if it's not set.
    validated_task = Task(**task_dict)
    
    # Convert back to dict for insertion, excluding None _id
    insert_data = validated_task.model_dump(by_alias=True, exclude={"id"} if validated_task.id is None else set())
    
    result = collection.insert_one(insert_data)
    print(f"Successfully inserted task with ID: {result.inserted_id}")
    return str(result.inserted_id)

if __name__ == "__main__":
    # Sample Usage
    sample_task = {
        "title": "Deep Work Session",
        "description": "Focused coding block for the intake pipeline.",
        "start_time": datetime.now(),
        "end_time": datetime.now(), # In practice this would be later

    }

    try:
        inserted_id = ingest_task(sample_task)
        print("Test Ingestion Complete.")
    except Exception as e:
        print(f"Error during ingestion: {e}")
