from datetime import datetime, timedelta

def calculate_end_time(start_time: datetime, duration_minutes: int) -> datetime:
    """Calculates end time based on start time and duration."""
    return start_time + timedelta(minutes=duration_minutes)

def get_week_range(date: datetime = None) -> tuple[datetime, datetime]:
    """Returns the start and end of the week for a given date."""
    if date is None:
        date = datetime.utcnow()
    
    start = date - timedelta(days=date.weekday())
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=7)
    return start, end
