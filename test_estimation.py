from agent import graph
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import db
import asyncio

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

async def test_estimation():
    client = MongoClient(MONGO_URI)
    user_email = "test@mulino.com"
    
    # 1. Seed some tasks with embeddings
    print("--- Seeding tasks for RAG ---")
    db.set_task(client, user_email, "Weekly Sync", "opt-1", "Meeting with team about progress", ["work"], duration=30)
    db.set_task(client, user_email, "Code Review", "opt-2", "Reviewing high-priority PRs", ["work"], duration=45)
    db.set_task(client, user_email, "Deep Work", "opt-3", "Developing new backend features", ["work"], duration=120)

    # 2. Mock state
    initial_state = {
        "messages": [("user", "Build a new complex API endpoint for task processing")],
        "user_id": user_email,
        "tag_names": ["work"]
    }

    print("\n--- Running AI Estimation Agent ---")
    result = await graph.ainvoke(initial_state)
    
    print("\n--- RESULTS ---")
    if "messages" in result:
        print(f"AI Response: {result['messages'][-1].content}")
    
    if "context" in result:
        print(f"\nContext Used (RAG):")
        for doc in result['context']:
            print(f" - {doc}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_estimation())
