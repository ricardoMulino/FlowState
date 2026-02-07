import asyncio
from datetime import datetime, timedelta
from app.database import db, settings
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.task import TaskCreate
from app.services.task_service import TaskService
from app.utils.date_utils import calculate_end_time

async def seed_data():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_instance = client[settings.DATABASE_NAME]
    
    # Clear existing tasks?
    print("Clearing existing tasks...")
    await db_instance["tasks"].delete_many({})
    
    # Initialize db client for service (hacky as service uses global db)
    # Service uses app.database.get_database -> db.client
    db.client = client
    
    tasks_data = [
        # Work
        {
            "title": "Client Meeting",
            "description": "Quarterly review with client",
            "category": "work",
            "start_time": datetime.utcnow().replace(hour=14, minute=0, second=0, microsecond=0) + timedelta(days=1),
            "duration": 120
        },
        {
            "title": "Code Review",
            "description": "Review PRs for feature X",
            "category": "work",
            "start_time": datetime.utcnow().replace(hour=16, minute=0, second=0, microsecond=0),
            "duration": 60
        },
        # School
        {
            "title": "Study Group",
            "description": "Physics study group",
            "category": "school",
            "start_time": datetime.utcnow().replace(hour=18, minute=0, second=0, microsecond=0) + timedelta(days=2), # Wednesday approx
            "duration": 180
        },
        {
            "title": "Assignment Due",
            "description": "Submit final report",
            "category": "school",
            "start_time": datetime.utcnow().replace(hour=23, minute=59, second=0, microsecond=0) + timedelta(days=4), # Friday approx
            "duration": 0 # Marker? Requirement said duration is int.
        },
        # Hobbies
        {
            "title": "Gym",
            "description": "Leg day",
            "category": "hobbies",
            "start_time": datetime.utcnow().replace(hour=7, minute=0, second=0, microsecond=0), # Today
            "duration": 60
        },
        {
            "title": "Read Book",
            "description": "Sci-fi novel",
            "category": "hobbies",
            "start_time": datetime.utcnow().replace(hour=20, minute=0, second=0, microsecond=0) + timedelta(days=6), # Sunday
            "duration": 45
        }
    ]
    
    print(f"Seeding {len(tasks_data)} tasks...")
    
    for task_in in tasks_data:
        # Handling 0 duration for markers? Let's say 15 min minimum
        if task_in["duration"] == 0:
             task_in["duration"] = 15
             
        task = TaskCreate(**task_in)
        created_task = await TaskService.create_task(task)
        print(f"Created task: {created_task.title} ({created_task.id})")
        
    print("Seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
