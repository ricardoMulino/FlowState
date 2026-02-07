from fastapi.testclient import TestClient
from app.main import app
import pytest
import datetime

# Note: These tests will run against the configured database. 
# For a real project, use a separate test db or mock.

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to ChronoHeight Calendar API"}

def test_create_task():
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "category": "work",
        "start_time": datetime.datetime.utcnow().isoformat(),
        "duration": 60
    }
    response = client.post("/api/tasks/", json=task_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert "id" in data
    assert "end_time" in data
    return data["id"]

def test_list_tasks():
    response = client.get("/api/tasks/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_week_view():
    response = client.get("/api/calendar/week")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    # Check structure
    # Keys should be dates, values should include categories
