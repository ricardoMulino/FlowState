from fastapi import APIRouter, HTTPException, Query, Body, status
from typing import List, Optional, Any
from datetime import datetime

from app.models.task import Task, TaskCreate, TaskUpdate
from app.services.task_service import TaskService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[Task])
async def list_tasks(
    category: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """
    List tasks with optional filters.
    """
    return await TaskService.get_tasks(category, start_date, end_date)

@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate):
    """
    Create a new task.
    """
    return await TaskService.create_task(task)

@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """
    Get a single task by ID.
    """
    task = await TaskService.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    """
    Update a task (full update).
    """
    task = await TaskService.update_task(task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    """
    Delete a task.
    """
    success = await TaskService.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None

@router.patch("/{task_id}/move", response_model=Task)
async def move_task(
    task_id: str,
    start_time: Optional[datetime] = Body(None),
    category: Optional[str] = Body(None) # category: Literal["work", ...] but str is fine here
):
    """
    Quick endpoint for drag-drop moves.
    """
    # Create TaskUpdate object manually or use service helper.
    # The requirement said "PATCH .../move".
    # Service has move_task helper?
    # Actually TaskService has update_task.
    
    # Let's construct a TaskUpdate here.
    update_data: dict[str, Any] = {}
    if start_time:
        update_data["start_time"] = start_time
    if category:
        update_data["category"] = category
        
    if not update_data:
        # No change
        task = await TaskService.get_task(task_id)
        if not task:
             raise HTTPException(status_code=404, detail="Task not found")
        return task

    # We can use update_task directly.
    task_update = TaskUpdate(**update_data)
    task = await TaskService.update_task(task_id, task_update)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
