import asyncio
import os
from datetime import datetime, timedelta
from app.models.event import Event
from app.database import get_database, connect_to_mongo, close_mongo_connection
from app.config import get_settings

# Ensure env vars are loaded
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

async def verify_schema():
    print("Verifying Event Schema (Backend Integrated)...")
    
    # Create a dummy event
    dummy_event_data = {
        "title": "Backend Project Meeting",
        "description": "Discuss project roadmap and milestones",
        "start_time": datetime.utcnow(),
        "end_time": datetime.utcnow() + timedelta(hours=1),
        "location": "Virtual",
        "attendees": ["dev@example.com"],
        "embedding": [0.1, 0.2, 0.3, 0.4, 0.5] # Mock 5-dim vector
    }
    
    try:
        event = Event(**dummy_event_data)
        print("✅ Event model validation successful!")
        print(event.model_dump_json(indent=2))
    except Exception as e:
        print(f"❌ Event model validation failed: {e}")
        return

    # Database Insertion Check
    print("\nAttempting DB Connection...")
    
    # We need to manually set up the connection using the backend's logic
    # The backend uses settings.MONGODB_URI, but previously we saw it relies on .env
    # Let's verify if settings are loading correctly
    settings = get_settings()
    if not settings.MONGODB_URI:
         print("⚠️ MONGODB_URI not set in settings. Skipping DB insertion.")
         return

    try:
        await connect_to_mongo()
        db = await get_database()
        collection = db['events']
        
        # Insert
        result = await collection.insert_one(event.model_dump(by_alias=True))
        print(f"✅ inserted_id: {result.inserted_id}")
        
        # Retrieve
        retrieved = await collection.find_one({"_id": result.inserted_id})
        print(f"✅ Retrieved document: {retrieved}")
        
        # Cleanup
        await collection.delete_one({"_id": result.inserted_id})
        print("✅ Cleaned up test document.")
        
    except Exception as e:
        print(f"⚠️ DB Connection/Insertion failed: {e}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(verify_schema())
