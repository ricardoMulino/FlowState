
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
