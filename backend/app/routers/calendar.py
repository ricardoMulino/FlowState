from fastapi import APIRouter, Query
from datetime import datetime
from typing import Dict, List, Any

from app.services.task_service import TaskService
from app.utils.date_utils import get_week_range

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

@router.get("/week", response_model=Dict[str, Dict[str, List[Any]]])
async def get_week_view(start: datetime = Query(default_factory=datetime.utcnow)):
    """
    Get week view data grouped by day and category.
    Defaults to current week if no start date provided.
    """
    # If explicit start provided, use it. Otherwise calculate start of week.
    # But if user provides specific date, maybe they want week starting from that date?
    # Usually calendar requests Monday/Sunday of the week.
    # Let's normalize it to start of the week for that date just in case, or trust frontend sends correct start.
    # The requirements sample: "/api/calendar/week?start=..."
    
    # Use helper to align to week start?
    # get_week_range aligns to Monday (weekday 0).
    week_start, _ = get_week_range(start)
    
    return await TaskService.get_week_view(week_start)

@router.get("/categories")
async def get_category_stats():
    """
    Get category summary stats.
    """
    # Return seed categories + stats?
    # For now, just stats from db.
    # Or return static categories if db is empty?
    # Requirement: "categories collection (seed data): [ ... ]"
    # Endpoints: "GET /api/calendar/categories - Get category summary stats"
    
    # We can return hardcoded categories definitions combined with stats.
    # Let's fetch stats.
    stats = await TaskService.get_category_stats()
    
    # Transform to list of categories with stats
    # Placeholder categories
    categories = [
        {"id": "work", "name": "Work", "color": "#3b82f6", "icon": "briefcase"},
        {"id": "school", "name": "School", "color": "#8b5cf6", "icon": "graduation-cap"},
        {"id": "hobbies", "name": "Hobbies", "color": "#f97316", "icon": "gamepad-2"}
    ]
    
    # Merge stats
    stats_map = {s["_id"]: s for s in stats}
    
    for cat in categories:
        cat_stat = stats_map.get(cat["id"], {})
        cat["count"] = cat_stat.get("count", 0)
        cat["total_duration"] = cat_stat.get("total_duration", 0)
        
    return categories
