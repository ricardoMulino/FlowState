import asyncio
from typing import Optional, List
from task_time_estimator import estimate_task_time
from websocket_manager import manager
import db
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")


async def run_agent_background(
    client_id: str, 
    task_client_id: str,
    email: str, 
    title: str, 
    description: Optional[str],
    tag_names: List[str],
    initial_duration: int = 30,
    initial_cost: int = 0
):
    """
    Runs the time estimation agent in the background and sends updates via WebSocket.
    Uses tags vector search to find similar tasks and estimate time.
    """
    try:
        # Notify frontend agent is starting
        await manager.send_personal_message({
            "type": "agent_status",
            "status": "started",
            "task_client_id": task_client_id,
            "message": f"AI analyzing task: {title}"
        }, client_id)

        # Get tag description for vector search
        tag_name = tag_names[0] if tag_names else "work"
        tag_description = ""
        
        # Get tag description from database
        mongo_client = MongoClient(MONGO_URI)
        try:
            tag = db.get_tag(mongo_client, email, tag_name)
            if tag:
                tag_description = tag.get("tag_description", "")
        finally:
            mongo_client.close()

        # Run the time estimation agent
        result = estimate_task_time(
            id=task_client_id,
            email=email,
            task_title=title,
            task_description=description or "",
            tag_name=tag_name,
            tag_description=tag_description,
            initial_estimate_minutes=initial_duration,
            initial_estimate_cost=initial_cost
        )

        # Extract estimation results
        recommendation = result.get("recommendation", "keep")
        suggested_minutes = result.get("suggested_minutes", 30)
        suggested_cost = result.get("suggested_cost", 0)
        reasoning = result.get("reasoning", "")
        confidence = result.get("confidence", "medium")
        
        print(f"[DEBUG] Sending WebSocket result: task_client_id={task_client_id}, recommendation={recommendation}, duration={suggested_minutes}, cost={suggested_cost}")

        # Send estimation result via WebSocket
        await manager.send_personal_message({
            "type": "agent_result",
            "task_client_id": task_client_id,
            "duration": suggested_minutes,
            "cost": suggested_cost,
            "recommendation": recommendation,
            "reasoning": reasoning,
            "confidence": confidence,
            "similar_tags_found": result.get("similar_tags_found", 0),
            "historical_tasks_analyzed": result.get("historical_tasks_analyzed", 0)
        }, client_id)
        
        print(f"[DEBUG] WebSocket message sent successfully for task {task_client_id}")

        # Persist AI result to database
        mongo_client = MongoClient(MONGO_URI)
        try:
            db.update_task_ai_estimation(
                mongo_client,
                task_client_id,
                ai_estimation_status="success",
                ai_time_estimation=suggested_minutes,
                ai_cost_estimation=suggested_cost,
                ai_recommendation=recommendation,
                ai_reasoning=reasoning,
                ai_confidence=confidence
            )
            print(f"[DEBUG] Persisted AI result to DB for task {task_client_id}")
        except Exception as e:
            print(f"[ERROR] Failed to persist AI result: {e}")
        finally:
            mongo_client.close()

        # Notify completion
        await manager.send_personal_message({
            "type": "agent_status",
            "status": "completed",
            "task_client_id": task_client_id,
            "message": f"AI estimation complete: {recommendation.upper()} - {suggested_minutes} min / ${suggested_cost}"
        }, client_id)

    except Exception as e:
        print(f"Error in background agent task: {e}")
        await manager.send_personal_message({
            "type": "agent_error",
            "task_client_id": task_client_id,
            "error": str(e)
        }, client_id)
        
        # Persist error status to database
        mongo_client = MongoClient(MONGO_URI)
        try:
            db.update_task_ai_estimation(
                mongo_client,
                task_client_id,
                ai_estimation_status="error"
            )
        except:
            pass
        finally:
            mongo_client.close()


async def run_search_agent_background(
    client_id: str,
    user_id: str,
    message: str
):
    """
    Runs the search agent in the background and sends results via WebSocket.
    """
    try:
        from search_agent import build_search_agent_graph
        from langchain_core.messages import HumanMessage

        # Notify status
        await manager.send_personal_message({
            "type": "flowbot_status",
            "status": "thinking",
            "message": "FloBot is thinking..."
        }, client_id)

        # Run agent
        graph = build_search_agent_graph()
        result = await asyncio.to_thread(graph.invoke, {
            "messages": [HumanMessage(content=message)]
        })
        
        response_text = result['messages'][-1].content

        # Send result
        await manager.send_personal_message({
            "type": "flowbot_result",
            "response": response_text
        }, client_id)

    except Exception as e:
        print(f"Error in background search agent: {e}")
        await manager.send_personal_message({
            "type": "flowbot_error",
            "error": str(e)
        }, client_id)

