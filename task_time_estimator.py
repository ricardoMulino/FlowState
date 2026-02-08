"""
Task Time Estimator - High-Level Interface

Simple interface for the time estimation agent pipeline.
Provides an easy-to-use function for estimating task time based on historical data.
"""

from typing import Dict, Any, Literal
from time_estimation_agent import build_time_estimation_graph


def estimate_task_time(
    id: str,
    email: str,
    task_title: str,
    task_description: str,
    tag_name: str,
    tag_description: str,
    initial_estimate_minutes: int
) -> Dict[str, Any]:
    """
    Estimates appropriate time allocation for a task based on historical data.
    
    Args:
        email: User's email for filtering historical data
        task_title: Title of the new task
        task_description: Description of the new task
        tag_name: Primary tag for the task
        tag_description: Description of the tag
        initial_estimate_minutes: User's initial time estimate in minutes
        
    Returns:
        Dictionary containing:
        - recommendation: "increase" or "keep" (never "decrease")
        - suggested_minutes: Recommended time in minutes
        - reasoning: Explanation for the recommendation
        - confidence: "high", "medium", or "low"
        - similar_tags_found: Number of similar tags found
        - historical_tasks_analyzed: Number of historical tasks analyzed
        
    Example:
        >>> result = estimate_task_time(
        ...     email="user@example.com",
        ...     task_title="Build API endpoint",
        ...     task_description="Create REST API for user authentication",
        ...     tag_name="backend",
        ...     tag_description="Backend development tasks",
        ...     initial_estimate_minutes=90
        ... )
        >>> print(f"Recommendation: {result['recommendation']}")
        >>> print(f"Suggested time: {result['suggested_minutes']} minutes")
    """
    
    # Build the agent graph
    graph = build_time_estimation_graph()
    
    # Prepare initial state
    initial_state = {
        "id": id,
        "task_title": task_title,
        "task_description": task_description,
        "tag_name": tag_name,
        "tag_description": tag_description,
        "email": email,
        "estimated_time": initial_estimate_minutes,
        "similar_tags": [],
        "historical_tasks": [],
        "messages": []
    }
    
    # Run the agent pipeline
    result = graph.invoke(initial_state)
    
    # Format output
    return {
        "recommendation": result.get("recommendation", "keep"),
        "suggested_minutes": result.get("suggested_minutes", initial_estimate_minutes),
        "reasoning": result.get("reasoning", "No reasoning provided"),
        "confidence": result.get("confidence", "medium"),
        "similar_tags_found": len(result.get("similar_tags", [])),
        "historical_tasks_analyzed": len(result.get("historical_tasks", []))
    }



# Example usage
print("="*60)
print("TASK TIME ESTIMATOR - Example Usage")
print("="*60)

result = estimate_task_time(
    id="3okjfa",
    email="test@example.com",
    task_title="Implement user dashboard",
    task_description="Create a responsive dashboard with charts and user statistics",
    tag_name="work",
    tag_description="Work tasks",
    initial_estimate_minutes=180  # 3 hours
)

print(f"\n✓ Recommendation: {result['recommendation'].upper()}")
print(f"✓ Suggested Time: {result['suggested_minutes']} minutes ({result['suggested_minutes']/60:.1f} hours)")
print(f"✓ Confidence: {result['confidence'].upper()}")
print(f"✓ Similar Tags Found: {result['similar_tags_found']}")
print(f"✓ Historical Tasks Analyzed: {result['historical_tasks_analyzed']}")
print(f"\n📝 Reasoning:")
print(f"   {result['reasoning']}")
print("="*60)
