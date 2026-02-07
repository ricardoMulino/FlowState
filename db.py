"""
MongoDB Database Operations Module for FlowState

Provides getters and setters for:
- User: {email, description(optional)}
- Tags: {email, tag_name, tag_description(optional)}
- Tasks: {email, tag_names(list)(optional), description(optional), title(required)}
"""

from pymongo import MongoClient
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
import os

DB_NAME = "flowstate_db"

# =============================================================================
# USER OPERATIONS
# =============================================================================

def get_user(client: MongoClient, email: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user document by email."""
    db = client[DB_NAME]
    collection = db["users"]
    return collection.find_one({"email": email})


def get_user_description(client: MongoClient, email: str) -> Optional[str]:
    """Retrieves the description for a user."""
    db = client[DB_NAME]
    collection = db["users"]
    result = collection.find_one({"email": email}, {"description": 1})
    if result:
        return result.get("description")
    return None


def set_user(client: MongoClient, email: str, description: Optional[str] = None) -> bool:
    """
    Creates or updates a user. Description is optional.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["users"]
    
    update_data = {"email": email}
    if description is not None:
        update_data["description"] = description
    
    result = collection.update_one(
        {"email": email},
        {"$set": update_data},
        upsert=True
    )
    return result.acknowledged


def set_user_description(client: MongoClient, email: str, description: str) -> bool:
    """
    Sets or updates only the description for a user.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["users"]
    
    result = collection.update_one(
        {"email": email},
        {"$set": {"description": description}},
        upsert=True
    )
    return result.acknowledged


def delete_user(client: MongoClient, email: str) -> bool:
    """Deletes a user by email. Returns True if a user was deleted."""
    db = client[DB_NAME]
    collection = db["users"]
    result = collection.delete_one({"email": email})
    return result.deleted_count > 0


def get_all_users(client: MongoClient) -> List[Dict[str, Any]]:
    """Retrieves all users."""
    db = client[DB_NAME]
    collection = db["users"]
    return list(collection.find())


# =============================================================================
# TAGS OPERATIONS
# =============================================================================

def get_tag(client: MongoClient, email: str, tag_name: str) -> Optional[Dict[str, Any]]:
    """Retrieves a specific tag by email and tag_name."""
    db = client[DB_NAME]
    collection = db["tags"]
    return collection.find_one({"email": email, "tag_name": tag_name})


def get_tag_description(client: MongoClient, email: str, tag_name: str) -> Optional[str]:
    """Retrieves the description for a specific tag."""
    db = client[DB_NAME]
    collection = db["tags"]
    result = collection.find_one(
        {"email": email, "tag_name": tag_name}, 
        {"tag_description": 1}
    )
    if result:
        return result.get("tag_description")
    return None


def set_tag(client: MongoClient, email: str, tag_name: str, tag_description: Optional[str] = None) -> bool:
    """
    Creates or updates a tag. Tag description is optional.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tags"]
    
    update_data = {"email": email, "tag_name": tag_name}
    if tag_description is not None:
        update_data["tag_description"] = tag_description
    
    result = collection.update_one(
        {"email": email, "tag_name": tag_name},
        {"$set": update_data},
        upsert=True
    )
    return result.acknowledged


def set_tag_description(client: MongoClient, email: str, tag_name: str, tag_description: str) -> bool:
    """
    Sets or updates only the description for a tag.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tags"]
    
    result = collection.update_one(
        {"email": email, "tag_name": tag_name},
        {"$set": {"tag_description": tag_description}},
        upsert=True
    )
    return result.acknowledged


def delete_tag(client: MongoClient, email: str, tag_name: str) -> bool:
    """Deletes a specific tag. Returns True if a tag was deleted."""
    db = client[DB_NAME]
    collection = db["tags"]
    result = collection.delete_one({"email": email, "tag_name": tag_name})
    return result.deleted_count > 0


def get_all_tags_for_user(client: MongoClient, email: str) -> List[Dict[str, Any]]:
    """Retrieves all tags for a specific user."""
    db = client[DB_NAME]
    collection = db["tags"]
    return list(collection.find({"email": email}))


def get_all_tags(client: MongoClient) -> List[Dict[str, Any]]:
    """Retrieves all tags in the database."""
    db = client[DB_NAME]
    collection = db["tags"]
    return list(collection.find())


# =============================================================================
# TASKS OPERATIONS
# =============================================================================

def get_task(client: MongoClient, email: str, title: str) -> Optional[Dict[str, Any]]:
    """Retrieves a specific task by email and title."""
    db = client[DB_NAME]
    collection = db["tasks"]
    return collection.find_one({"email": email, "title": title})


def get_task_by_id(client: MongoClient, task_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a task by its MongoDB _id."""
    from bson import ObjectId
    db = client[DB_NAME]
    collection = db["tasks"]
    return collection.find_one({"_id": ObjectId(task_id)})


def get_task_description(client: MongoClient, email: str, title: str) -> Optional[str]:
    """Retrieves the description for a specific task."""
    db = client[DB_NAME]
    collection = db["tasks"]
    result = collection.find_one(
        {"email": email, "title": title}, 
        {"description": 1}
    )
    if result:
        return result.get("description")
    return None


def get_task_tags(client: MongoClient, email: str, title: str) -> Optional[List[str]]:
    """Retrieves the tag_names list for a specific task."""
    db = client[DB_NAME]
    collection = db["tasks"]
    result = collection.find_one(
        {"email": email, "title": title}, 
        {"tag_names": 1}
    )
    if result:
        return result.get("tag_names", [])
    return None


def set_task(
    client: MongoClient, 
    email: str, 
    title: str, 
    description: Optional[str] = None, 
    tag_names: Optional[List[str]] = None
) -> bool:
    """
    Creates or updates a task. 
    - title is required
    - description and tag_names are optional
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    update_data = {"email": email, "title": title}
    if description is not None:
        update_data["description"] = description
    if tag_names is not None:
        update_data["tag_names"] = tag_names
    
    result = collection.update_one(
        {"email": email, "title": title},
        {"$set": update_data},
        upsert=True
    )
    return result.acknowledged


def set_task_description(client: MongoClient, email: str, title: str, description: str) -> bool:
    """
    Sets or updates only the description for a task.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    result = collection.update_one(
        {"email": email, "title": title},
        {"$set": {"description": description}}
    )
    return result.acknowledged


def set_task_tags(client: MongoClient, email: str, title: str, tag_names: List[str]) -> bool:
    """
    Sets or updates the tag_names list for a task.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    result = collection.update_one(
        {"email": email, "title": title},
        {"$set": {"tag_names": tag_names}}
    )
    return result.acknowledged


def add_tag_to_task(client: MongoClient, email: str, title: str, tag_name: str) -> bool:
    """
    Adds a single tag to a task's tag_names list (avoids duplicates).
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    result = collection.update_one(
        {"email": email, "title": title},
        {"$addToSet": {"tag_names": tag_name}}
    )
    return result.acknowledged


def remove_tag_from_task(client: MongoClient, email: str, title: str, tag_name: str) -> bool:
    """
    Removes a single tag from a task's tag_names list.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    result = collection.update_one(
        {"email": email, "title": title},
        {"$pull": {"tag_names": tag_name}}
    )
    return result.acknowledged


def delete_task(client: MongoClient, email: str, title: str) -> bool:
    """Deletes a specific task. Returns True if a task was deleted."""
    db = client[DB_NAME]
    collection = db["tasks"]
    result = collection.delete_one({"email": email, "title": title})
    return result.deleted_count > 0


def get_all_tasks_for_user(client: MongoClient, email: str) -> List[Dict[str, Any]]:
    """Retrieves all tasks for a specific user."""
    db = client[DB_NAME]
    collection = db["tasks"]
    return list(collection.find({"email": email}))


def get_tasks_by_tag(client: MongoClient, email: str, tag_name: str) -> List[Dict[str, Any]]:
    """Retrieves all tasks for a user that have a specific tag."""
    db = client[DB_NAME]
    collection = db["tasks"]
    return list(collection.find({"email": email, "tag_names": tag_name}))


def get_all_tasks(client: MongoClient) -> List[Dict[str, Any]]:
    """Retrieves all tasks in the database."""
    db = client[DB_NAME]
    collection = db["tasks"]
    return list(collection.find())


# =============================================================================
# MAIN - VERIFICATION METHODS
# =============================================================================

def seed_tags(client: MongoClient):
    """
    Seeds persistent tags into the database for verification.
    Tags: cs3663, cleaning, coding-personal
    """
    email = "ricardomulino@gmail.com"
    
    print("=" * 60)
    print("Seeding Persistent Tags")
    print("=" * 60)
    
    # Create the 3 persistent tags
    tags_to_create = [
        ("cs3663", "CS 3663 course related tasks"),
        ("cleaning", "Cleaning and organization tasks"),
        ("coding-personal", "Personal coding projects"),
    ]
    
    for tag_name, tag_description in tags_to_create:
        result = set_tag(client, email, tag_name, tag_description)
        print(f"  Created tag '{tag_name}': {'SUCCESS' if result else 'FAILED'}")
    
    # Verify tags were created
    print("\n--- Verifying Tags ---")
    all_tags = get_all_tags_for_user(client, email)
    print(f"Total tags for {email}: {len(all_tags)}")
    for t in all_tags:
        print(f"  - {t.get('tag_name')}: {t.get('tag_description', 'No description')}")
    
    print("\n" + "=" * 60)
    print("Seeding Complete! Tags persist in database.")
    print("=" * 60)


def run_full_verification(client: MongoClient):
    """
    Full verification test that creates and cleans up test data.
    Call this if you want to run the complete test suite.
    """
    print("=" * 60)
    print("FlowState Database Operations Verification")
    print("=" * 60)
    
    test_email = "test@flowstate.com"
    
    # --- USER TESTS ---
    print("\n--- USER OPERATIONS ---")
    
    # Create user
    print(f"Creating user: {test_email}")
    result = set_user(client, test_email, description="Test user for verification")
    print(f"  set_user: {'SUCCESS' if result else 'FAILED'}")
    
    # Get user
    user = get_user(client, test_email)
    print(f"  get_user: {user}")
    
    # Get user description
    desc = get_user_description(client, test_email)
    print(f"  get_user_description: {desc}")
    
    # Update description only
    set_user_description(client, test_email, "Updated description")
    desc = get_user_description(client, test_email)
    print(f"  Updated description: {desc}")
    
    # --- TAGS TESTS ---
    print("\n--- TAGS OPERATIONS ---")
    
    # Create tags
    print(f"Creating tags for: {test_email}")
    set_tag(client, test_email, "work", "Work related tasks")
    set_tag(client, test_email, "personal", "Personal tasks")
    set_tag(client, test_email, "urgent")  # No description
    print("  set_tag: Created 3 tags")
    
    # Get specific tag
    tag = get_tag(client, test_email, "work")
    print(f"  get_tag('work'): {tag}")
    
    # Get tag description
    tag_desc = get_tag_description(client, test_email, "work")
    print(f"  get_tag_description('work'): {tag_desc}")
    
    # Get all tags for user
    all_tags = get_all_tags_for_user(client, test_email)
    print(f"  get_all_tags_for_user: {len(all_tags)} tags found")
    for t in all_tags:
        print(f"    - {t.get('tag_name')}: {t.get('tag_description', 'No description')}")
    
    # --- TASKS TESTS ---
    print("\n--- TASKS OPERATIONS ---")
    
    # Create tasks
    print(f"Creating tasks for: {test_email}")
    set_task(client, test_email, "Complete project", 
             description="Finish the FlowState project", 
             tag_names=["work", "urgent"])
    set_task(client, test_email, "Buy groceries", 
             description="Weekly shopping",
             tag_names=["personal"])
    set_task(client, test_email, "Quick note")  # Minimal task
    print("  set_task: Created 3 tasks")
    
    # Get specific task
    task = get_task(client, test_email, "Complete project")
    print(f"  get_task('Complete project'): {task}")
    
    # Get task description
    task_desc = get_task_description(client, test_email, "Complete project")
    print(f"  get_task_description: {task_desc}")
    
    # Get task tags
    task_tags = get_task_tags(client, test_email, "Complete project")
    print(f"  get_task_tags: {task_tags}")
    
    # Add a tag to task
    add_tag_to_task(client, test_email, "Complete project", "important")
    task_tags = get_task_tags(client, test_email, "Complete project")
    print(f"  After add_tag_to_task('important'): {task_tags}")
    
    # Remove a tag from task
    remove_tag_from_task(client, test_email, "Complete project", "urgent")
    task_tags = get_task_tags(client, test_email, "Complete project")
    print(f"  After remove_tag_from_task('urgent'): {task_tags}")
    
    # Get all tasks for user
    all_tasks = get_all_tasks_for_user(client, test_email)
    print(f"  get_all_tasks_for_user: {len(all_tasks)} tasks found")
    
    # Get tasks by tag
    work_tasks = get_tasks_by_tag(client, test_email, "work")
    print(f"  get_tasks_by_tag('work'): {len(work_tasks)} tasks")
    
    # --- CLEANUP ---
    print("\n--- CLEANUP ---")
    
    # Delete test data
    delete_task(client, test_email, "Complete project")
    delete_task(client, test_email, "Buy groceries")
    delete_task(client, test_email, "Quick note")
    print("  Deleted all test tasks")
    
    delete_tag(client, test_email, "work")
    delete_tag(client, test_email, "personal")
    delete_tag(client, test_email, "urgent")
    print("  Deleted all test tags")
    
    delete_user(client, test_email)
    print("  Deleted test user")
    
    # Verify cleanup
    user = get_user(client, test_email)
    print(f"\n  Verification - User exists: {user is not None}")
    
    print("\n" + "=" * 60)
    print("Verification Complete!")
    print("=" * 60)


if __name__ == "__main__":
    """ main is used as a sort of verification in the DB!
    """
    load_dotenv()
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(MONGO_URI)
    
    # Run seed_tags to create persistent tags for verification
    # seed_tags(client)
    
    # Uncomment below to run full verification (creates and cleans up test data)
    # run_full_verification(client)
    
    client.close()
