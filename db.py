"""
MongoDB Database Operations Module for FlowState

Provides getters and setters for:
- User: {email, description(optional)}
- Tags: {email, tag_name, tag_description(optional)}
- Tasks: {email, tag_names(list)(optional), description(optional), title(required)}
"""

from pymongo import MongoClient
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv
import os

import agent

# Load environment variables for embedding model
load_dotenv()

DB_NAME = "flowstate_db"

# =============================================================================
# EMBEDDING UTILITIES
# =============================================================================


def _generate_embedding(text: str) -> Optional[List[float]]:
    """
    Generates a vector embedding for text using Gemini.
    Returns None if text is empty or embedding generation fails.
    """
    if not text or not text.strip():
        return None
    
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        return embeddings.embed_query(text)
    except Exception as e:
        print(f"Warning: Failed to generate embedding: {e}")
        return None


def _generate_tag_embedding(tag_description: str) -> Optional[List[float]]:
    """Wrapper for _generate_embedding to maintain backward compatibility if needed."""
    return _generate_embedding(tag_description)


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
    Automatically generates and stores embedding if tag_description is provided.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tags"]
    
    update_data = {"email": email, "tag_name": tag_name}
    if tag_description is not None:
        update_data["tag_description"] = tag_description
        # Generate embedding for vector search
        embedding = _generate_tag_embedding(tag_description)
        if embedding is not None:
            update_data["embedding"] = embedding
    
    result = collection.update_one(
        {"email": email, "tag_name": tag_name},
        {"$set": update_data},
        upsert=True
    )
    return result.acknowledged



def set_tag_description(client: MongoClient, email: str, tag_name: str, tag_description: str) -> bool:
    """
    Sets or updates only the description for a tag.
    Automatically regenerates embedding for the new description.
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tags"]
    
    update_data = {"tag_description": tag_description}
    # Regenerate embedding for vector search
    embedding = _generate_tag_embedding(tag_description)
    if embedding is not None:
        update_data["embedding"] = embedding
    
    result = collection.update_one(
        {"email": email, "tag_name": tag_name},
        {"$set": update_data},
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

def get_task(client: MongoClient, email: str, task_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a specific task by email and object id."""
    db = client[DB_NAME]
    collection = db["tasks"]
    try:
        return collection.find_one({"email": email, "_id": ObjectId(task_id)})
    except Exception:
        return None

def get_task_by_title(client: MongoClient, email: str, title: str) -> Optional[Dict[str, Any]]:
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


def get_task_description(client: MongoClient, email: str, identifier: str) -> Optional[str]:
    """Retrieves the description for a specific task by ID or Title."""
    db = client[DB_NAME]
    collection = db["tasks"]
    
    # Try as ObjectId first
    try:
        result = collection.find_one(
            {"email": email, "_id": ObjectId(identifier)}, 
            {"description": 1}
        )
        if result:
            return result.get("description")
    except Exception:
        pass
        
    # Fallback to Title
    result = collection.find_one(
        {"email": email, "title": identifier}, 
        {"description": 1}
    )
    if result:
        return result.get("description")
    return None


def get_task_tags(client: MongoClient, email: str, identifier: str) -> Optional[List[str]]:
    """Retrieves the tags for a specific task by ID or Title."""
    db = client[DB_NAME]
    collection = db["tasks"]
    
    # Try as ObjectId first
    try:
        result = collection.find_one(
            {"email": email, "_id": ObjectId(identifier)}, 
            {"tag_names": 1}
        )
        if result:
            return result.get("tag_names")
    except Exception:
        pass

    # Fallback to Title
    result = collection.find_one(
        {"email": email, "title": identifier}, 
        {"tag_names": 1}
    )
    if result:
        return result.get("tag_names")
    return None


def set_task(
    client: MongoClient, 
    email: str, 
    title: str, 
    task_client_id: str,
    description: Optional[str] = None, 
    tag_names: Optional[List[str]] = None,
    start_time: Optional[Any] = None,
    duration: Optional[int] = 0,
    recurrence: Optional[str] = None,
    is_completed: bool = False,
    flowbot_suggest_duration: Optional[int] = None,
    actual_duration: Optional[int] = None,
    color: Optional[str] = None,
    ai_estimation_status: Optional[str] = None,
    ai_time_estimation: Optional[int] = None,
    ai_recommendation: Optional[str] = None,
    ai_reasoning: Optional[str] = None,
    ai_confidence: Optional[str] = None
) -> bool:
    """
    Creates or updates a task. 
    - title is required
    - description and tag_names are optional
    Returns True if the operation was successful.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    update_data = {
        "email": email, 
        "title": title,
        "task_client_id": task_client_id,
        "is_completed": is_completed
    }
    
    if description is not None:
        update_data["description"] = description
    if tag_names is not None:
        update_data["tag_names"] = tag_names
    
    # Generate embedding for vector search using title and description
    # Combine title and description for better context
    embedding_text = title
    if description:
        embedding_text += f": {description}"
    
    embedding = _generate_embedding(embedding_text)
    if embedding is not None:
        update_data["embedding"] = embedding
    if start_time is not None:
        update_data["start_time"] = start_time
    if duration is not None:
        update_data["duration"] = duration
    if recurrence is not None:
        update_data["recurrence"] = recurrence
    if flowbot_suggest_duration is not None:
        update_data["flowbot_suggest_duration"] = flowbot_suggest_duration
    if actual_duration is not None:
        update_data["actual_duration"] = actual_duration
    if color is not None:
        update_data["color"] = color
    if ai_estimation_status is not None:
        update_data["ai_estimation_status"] = ai_estimation_status
    if ai_time_estimation is not None:
        update_data["ai_time_estimation"] = ai_time_estimation
    if ai_recommendation is not None:
        update_data["ai_recommendation"] = ai_recommendation
    if ai_reasoning is not None:
        update_data["ai_reasoning"] = ai_reasoning
    if ai_confidence is not None:
        update_data["ai_confidence"] = ai_confidence
    
    result = collection.update_one(
        {"email": email, "title": title},
        {"$set": update_data},
        upsert=True
    )
    
    return result.acknowledged


def update_task_fields(client: MongoClient, task_id: str, updates: Dict[str, Any]) -> bool:
    """
    Updates specific fields of a task using its _id.
    """
    from bson import ObjectId
    db = client[DB_NAME]
    collection = db["tasks"]
    
    # potentially filter out _id from updates if passed
    if "_id" in updates:
        del updates["_id"]

    result = collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": updates}
    )
    return result.acknowledged


def delete_task_by_id(client: MongoClient, task_id: str) -> bool:
    """
    Deletes a task by its _id.
    """
    from bson import ObjectId
    db = client[DB_NAME]
    collection = db["tasks"]
    result = collection.delete_one({"_id": ObjectId(task_id)})
    return result.deleted_count > 0


def set_task_description(client: MongoClient, email: str, identifier: str, description: str) -> bool:
    """
    Sets or updates only the description for a task by ID or Title.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    update_data = {"description": description}
    
    # Regenerate embedding since description changed
    embedding_text = description
    embedding = _generate_embedding(embedding_text)
    if embedding is not None:
        update_data["embedding"] = embedding

    try:
        # Try as ObjectId first
        result = collection.update_one(
            {"email": email, "_id": ObjectId(identifier)},
            {"$set": {"description": description}}
        )
        if result.acknowledged and result.matched_count > 0:
            return True
    except Exception:
        pass
        
    # Fallback to Title
    try:
        result = collection.update_one(
            {"email": email, "title": identifier},
            {"$set": update_data}
        )
        return result.acknowledged
    except Exception:
        return False


def set_task_tags(client: MongoClient, email: str, identifier: str, tag_names: List[str]) -> bool:
    """
    Sets or updates the tag_names list for a task by ID or Title.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    try:
        # Try as ObjectId first
        result = collection.update_one(
            {"email": email, "_id": ObjectId(identifier)},
            {"$set": {"tag_names": tag_names}}
        )
        if result.acknowledged and result.matched_count > 0:
            return True
    except Exception:
        pass
        
    # Fallback to Title
    try:
        result = collection.update_one(
            {"email": email, "title": identifier},
            {"$set": {"tag_names": tag_names}}
        )
        return result.acknowledged
    except Exception:
        return False


def add_tag_to_task(client: MongoClient, email: str, identifier: str, tag_name: str) -> bool:
    """
    Adds a single tag to a task's tag_names list (avoids duplicates) by ID or Title.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    try:
        # Try as ObjectId first
        result = collection.update_one(
            {"email": email, "_id": ObjectId(identifier)},
            {"$addToSet": {"tag_names": tag_name}}
        )
        if result.acknowledged and result.matched_count > 0:
            return True
    except Exception:
        pass
        
    # Fallback to Title
    try:
        result = collection.update_one(
            {"email": email, "title": identifier},
            {"$addToSet": {"tag_names": tag_name}}
        )
        return result.acknowledged
    except Exception:
        return False


def remove_tag_from_task(client: MongoClient, email: str, identifier: str, tag_name: str) -> bool:
    """
    Removes a single tag from a task's tag_names list by ID or Title.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    try:
        # Try as ObjectId first
        result = collection.update_one(
            {"email": email, "_id": ObjectId(identifier)},
            {"$pull": {"tag_names": tag_name}}
        )
        if result.acknowledged and result.matched_count > 0:
            return True
    except Exception:
        pass
        
    # Fallback to Title
    try:
        result = collection.update_one(
            {"email": email, "title": identifier},
            {"$pull": {"tag_names": tag_name}}
        )
        return result.acknowledged
    except Exception:
        return False


def delete_task(client: MongoClient, email: str, identifier: str) -> bool:
    """Deletes a specific task by ID or Title."""
    db = client[DB_NAME]
    collection = db["tasks"]
    try:
        # Try as ObjectId first
        result = collection.delete_one({"email": email, "_id": ObjectId(identifier)})
        if result.deleted_count > 0:
            return True
    except Exception:
        pass
    
    # Fallback to Title
    result = collection.delete_one({"email": email, "title": identifier})
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
    email = "test@mulino.com"
    
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
    
    # # Delete test data
    # delete_task(client, test_email, "Complete project")
    # delete_task(client, test_email, "Buy groceries")
    # delete_task(client, test_email, "Quick note")
    # print("  Deleted all test tasks")
    
    # delete_tag(client, test_email, "work")
    # delete_tag(client, test_email, "personal")
    # delete_tag(client, test_email, "urgent")
    # print("  Deleted all test tags")
    
    # delete_user(client, test_email)
    # print("  Deleted test user")
    
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
    MONGO_URI = os.getenv("MONGO_URI")
    client = MongoClient(MONGO_URI)
    
    # Run seed_tags to create persistent tags for verification
    # seed_tags(client)
    
    # Uncomment below to run full verification (creates and cleans up test data)
    # Run a simple test
    set_task(
        client, 
        "test@mulino.com", 
        "Implement authentication system", 
        "test-auth-1",
        "Build JWT-based authentication with refresh tokens and role-based access control", 
        ["work"]
    )
    client.close()

def update_task_ai_estimation(
    client: MongoClient,
    task_client_id: str,
    ai_estimation_status: str,
    ai_time_estimation: Optional[int] = None,
    ai_recommendation: Optional[str] = None,
    ai_reasoning: Optional[str] = None,
    ai_confidence: Optional[str] = None
) -> bool:
    """
    Updates a task's AI estimation fields using its task_client_id.
    """
    db = client[DB_NAME]
    collection = db["tasks"]
    
    update_data = {
        "ai_estimation_status": ai_estimation_status
    }
    
    if ai_time_estimation is not None:
        update_data["ai_time_estimation"] = ai_time_estimation
    if ai_recommendation is not None:
        update_data["ai_recommendation"] = ai_recommendation
    if ai_reasoning is not None:
        update_data["ai_reasoning"] = ai_reasoning
    if ai_confidence is not None:
        update_data["ai_confidence"] = ai_confidence
        
    result = collection.update_one(
        {"task_client_id": task_client_id},
        {"$set": update_data}
    )
    
    return result.acknowledged