from datetime import datetime, timedelta
from typing import List, Optional, Any
from bson import ObjectId
from fastapi import HTTPException

from app.models.task import Task, TaskCreate, TaskUpdate
from app.database import get_database
from app.utils.date_utils import calculate_end_time

class TaskService:
    @staticmethod
    async def create_task(task_in: TaskCreate) -> Task:
        db = await get_database()
        task_data = task_in.model_dump()
        
        # Calculate end_time
        task_data["end_time"] = calculate_end_time(task_data["start_time"], task_data["duration"])
        task_data["created_at"] = datetime.utcnow()
        task_data["updated_at"] = datetime.utcnow()
        task_data["estimated_time"] = task_data["duration"] # default estimated to duration if not provided?
        # Actually estimated_time was optional in model but required in schema text description, let's keep it optional matching model or fill it.
        # User defined TaskCreate with duration, and Task model with estimated_time. 
        # Requirement: "estimated_time: int # minutes (for ML prediction later)"
        # Let's set it to duration for now if not present, but TaskCreate doesn't have it. 
        # Ah, TaskCreate doesn't have estimated_time. So we infer it or set it same as duration.
        task_data["estimated_time"] = task_data["duration"]
        
        result = await db["tasks"].insert_one(task_data)
        created_task = await db["tasks"].find_one({"_id": result.inserted_id})
        return Task(**created_task)

    @staticmethod
    async def get_tasks(category: Optional[str] = None, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Task]:
        db = await get_database()
        query: dict[str, Any] = {}
        if category:
            query["category"] = category
        
        # Date filtering logic - check if task overlaps with range or starts within range?
        # Usually "list tasks" with date range means tasks starting in that range.
        if start_date and end_date:
            query["start_time"] = {"$gte": start_date, "$lt": end_date}
        elif start_date:
            query["start_time"] = {"$gte": start_date}

        cursor = db["tasks"].find(query).sort("start_time", 1)
        tasks = await cursor.to_list(length=100)
        return [Task(**task) for task in tasks]

    @staticmethod
    async def get_task(task_id: str) -> Optional[Task]:
        db = await get_database()
        task = await db["tasks"].find_one({"_id": ObjectId(task_id)})
        if task:
            return Task(**task)
        return None

    @staticmethod
    async def update_task(task_id: str, task_update: TaskUpdate) -> Optional[Task]:
        db = await get_database()
        update_data = task_update.model_dump(exclude_unset=True)
        
        if not update_data:
            return await TaskService.get_task(task_id)

        # specific logic for drag-drop (move) handled generally by update or specific method?
        # If start_time or duration changes, we might need to recalculate end_time
        current_task = await db["tasks"].find_one({"_id": ObjectId(task_id)})
        if not current_task:
            return None
            
        if "start_time" in update_data or "duration" in update_data:
            start = update_data.get("start_time", current_task["start_time"])
            duration = update_data.get("duration", current_task["duration"])
            update_data["end_time"] = calculate_end_time(start, duration)
            
        update_data["updated_at"] = datetime.utcnow()
        
        await db["tasks"].update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        
        return await TaskService.get_task(task_id)

    @staticmethod
    async def delete_task(task_id: str) -> bool:
        db = await get_database()
        result = await db["tasks"].delete_one({"_id": ObjectId(task_id)})
        return result.deleted_count > 0

    @staticmethod
    async def move_task(task_id: str, start_time: Optional[datetime] = None, category: Optional[str] = None) -> Optional[Task]:
        update_data: dict[str, Any] = {}
        if start_time:
            update_data["start_time"] = start_time
        if category:
            update_data["category"] = category
            
        if not update_data:
            return await TaskService.get_task(task_id)
            
        return await TaskService.update_task(task_id, TaskUpdate(**update_data))

    @staticmethod
    async def get_week_view(start_date: datetime) -> dict:
        db = await get_database()
        # Ensure we get whole week
        # Actually logic says "Get week view data (grouped by day and category)"
        # The frontend likely requests a specific week start date.
        
        end_date = start_date + timedelta(days=7)
        
        cursor = db["tasks"].find({
            "start_time": {"$gte": start_date, "$lt": end_date}
        })
        tasks = await cursor.to_list(length=1000)
        
        # Group by date string (YYYY-MM-DD) and then category
        week_view = {}
        # Initialize days? Or just return what we have? 
        # Requirement: "2024-01-15": { "work": [], ... }
        # Better to initialize structure if we want to be consistent, but dynamic is fine too.
        
        for task_doc in tasks:
            task = Task(**task_doc)
            date_key = task.start_time.strftime("%Y-%m-%d")
            
            if date_key not in week_view:
                week_view[date_key] = {"work": [], "school": [], "hobbies": []}
                
            if task.category in week_view[date_key]:
                week_view[date_key][task.category].append(task)
            else:
                 # Fallback if category invalid or new
                 if task.category not in week_view[date_key]:
                     week_view[date_key][task.category] = []
                 week_view[date_key][task.category].append(task)
                 
        return week_view

    @staticmethod
    async def get_category_stats():
        db = await get_database()
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}, "total_duration": {"$sum": "$duration"}}}
        ]
        stats = await db["tasks"].aggregate(pipeline).to_list(length=None)
        return stats
