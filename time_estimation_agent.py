"""
Time Estimation Agent Pipeline

LangGraph-based agent that:
1. Takes a new task with tag and description
2. Finds similar tasks with the SAME tag using vector search on descriptions
3. Uses LLM to analyze historical task durations
4. Suggests time allocation (increase or keep, never decrease)
"""

import os
from typing import Annotated, TypedDict, List, Dict, Any, Literal
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, HumanMessage
from pymongo import MongoClient
from langchain_mongodb import MongoDBAtlasVectorSearch


# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "flowstate_db"
client = MongoClient(MONGO_URI)
db = client["flowstate_db"]
collection = db["tasks"]


# Initialize LLM (using Gemini 2.5 Flash as per user rules)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

# =============================================================================
# STATE DEFINITION
# =============================================================================

class TimeEstimationState(TypedDict):
    """State for the time estimation agent pipeline."""
    # Input fields
    id: str
    task_title: str
    task_description: str
    tag_name: str
    tag_description: str
    email: str
    estimated_time: int  # User's initial estimate in minutes
    
    # Intermediate results
    similar_tags: List[Dict[str, Any]]
    historical_tasks: List[Dict[str, Any]]
    
    # LLM conversation
    messages: Annotated[list, add_messages]
    
    # Final output
    recommendation: Literal["increase", "keep"]
    suggested_minutes: int
    reasoning: str
    confidence: Literal["high", "medium", "low"]


# =============================================================================
# Vector Search
# =============================================================================


def find_similar_tasks_node(state: TimeEstimationState) -> Dict[str, Any]:
    """
    Node 1: Find similar tasks with the same tag using Atlas Vector Search.
    Uses the langchain_mongodb vector store class.
    """
    print(f"\n[Node 1] Finding similar tasks with tag '{state['tag_name']}'...")
    
    # Initialize the vector store
    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embeddings,
        index_name="default",
        embedding_key="embedding",
        text_key="description",
        relevance_score_fn="cosine"
    )
    
    # Define the filter to ensure we only get tasks with the same tag
    # Using pre_filter for performance
    search_filter = {
        "$and": [
            {"tag_names": {"$eq": state["tag_name"]}},
            {"_id": {"$ne": state["id"]}}
        ]
    }
    
    try:
        # Perform similarity search
        # k=4 as per user request in previous conversations
        docs = vector_store.similarity_search(
            query=state["task_description"],
            k=4,
            pre_filter=search_filter
        )
        
        # Convert List[Document] to List[Dict] for easier LLM processing in the next node
        historical_tasks = []
        for doc in docs:
            task_dict = doc.metadata.copy()
            task_dict["description"] = doc.page_content
            historical_tasks.append(task_dict)
            
        print(f"Found {len(historical_tasks)} similar tasks with the same tag")
        return {"historical_tasks": historical_tasks}

    except Exception as e:
        print(f"Error executing vector search: {e}")
        return {"historical_tasks": []}





def estimate_time_node(state: TimeEstimationState) -> Dict[str, Any]:
    """
    Node 2: Use LLM to analyze historical data and suggest time allocation.
    """
    print(f"\n[Node 2] Analyzing with LLM...")
    
    # Prepare context from historical tasks
    historical_tasks = state.get("historical_tasks", [])
    print(historical_tasks)
    
    # Build context string
    context_parts = []
    
    # Add historical task durations
    if historical_tasks:
        context_parts.append("\nHistorical task completion times:")
        durations = []
        for task in historical_tasks:
            title = task.get("title", "Untitled")
            duration = task.get("duration")
            tags = task.get("tags", [])
            
            if duration:
                durations.append(duration)
                context_parts.append(f"  - '{title}' (tags: {', '.join(tags)}): {duration} minutes")
        
        if durations:
            avg_duration = sum(durations) / len(durations)
            max_duration = max(durations)
            min_duration = min(durations)
            context_parts.append(f"\nStatistics:")
            context_parts.append(f"  Average: {avg_duration:.1f} minutes")
            context_parts.append(f"  Range: {min_duration}-{max_duration} minutes")
    else:
        context_parts.append("\nNo historical tasks found for similar tags.")
    
    context_str = "\n".join(context_parts)
    print(context_str)
    
    # Create LLM prompt
    system_prompt = f"""You are a time estimation expert helping users allocate appropriate time for their tasks.

CRITICAL RULES:
1. You can ONLY recommend to "increase" or "keep" the estimated time
2. You must NEVER suggest decreasing the time estimate
3. Base your recommendation on historical data and task complexity

Current Task:
- Title: {state['task_title']}
- Description: {state['task_description']}
- Tag: {state['tag_name']} - {state['tag_description']}
- User's Initial Estimate: {state['estimated_time']} minutes

Historical Tasks:{historical_tasks}
Historical Time Statistics:{context_str}

Analyze the historical data and provide:
1. Recommendation: "increase" or "keep" (NEVER "decrease")
2. Suggested time in minutes (must be >= initial estimate)
3. Clear reasoning based on the data
4. Confidence level: "high", "medium", or "low"

Format your response as:
RECOMMENDATION: [increase/keep]
SUGGESTED_TIME: [number] minutes
CONFIDENCE: [high/medium/low]
REASONING: [your detailed reasoning]
"""

    user_message = f"Should I adjust my {state['estimated_time']}-minute estimate for this task?"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    # Invoke LLM
    response = llm.invoke(messages)
    response_text = response.content
    
    # Parse LLM response
    recommendation = "keep"
    suggested_minutes = state["estimated_time"]
    confidence = "medium"
    reasoning = response_text
    
    # Simple parsing (look for keywords in response)
    lines = response_text.split("\n")
    for line in lines:
        line_upper = line.upper()
        if "RECOMMENDATION:" in line_upper:
            if "INCREASE" in line_upper:
                recommendation = "increase"
            else:
                recommendation = "keep"
        elif "SUGGESTED_TIME:" in line_upper or "SUGGESTED TIME:" in line_upper:
            # Extract number
            import re
            numbers = re.findall(r'\d+', line)
            if numbers:
                suggested_minutes = max(int(numbers[0]), state["estimated_time"])
        elif "CONFIDENCE:" in line_upper:
            if "HIGH" in line_upper:
                confidence = "high"
            elif "LOW" in line_upper:
                confidence = "low"
            else:
                confidence = "medium"
        elif "REASONING:" in line_upper:
            # Get everything after REASONING:
            reasoning_start = line_upper.find("REASONING:")
            reasoning = line[reasoning_start + 10:].strip()
            # Also include subsequent lines
            idx = lines.index(line)
            if idx + 1 < len(lines):
                reasoning += " " + " ".join(lines[idx + 1:])
    
    print(f"LLM Recommendation: {recommendation} ({suggested_minutes} minutes)")
    
    return {
        "recommendation": recommendation,
        "suggested_minutes": suggested_minutes,
        "reasoning": reasoning,
        "confidence": confidence,
        "messages": [response]
    }


# =============================================================================
# BUILD GRAPH
# =============================================================================

def build_time_estimation_graph():
    """Builds and compiles the time estimation agent graph."""
    graph_builder = StateGraph(TimeEstimationState)
    
    # Add nodes
    graph_builder.add_node("find_similar_tasks", find_similar_tasks_node)
    graph_builder.add_node("estimate_time", estimate_time_node)
    
    # Define edges
    graph_builder.add_edge(START, "find_similar_tasks")
    graph_builder.add_edge("find_similar_tasks", "estimate_time")
    graph_builder.add_edge("estimate_time", END)
    
    return graph_builder.compile()


# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == "__main__":
    import json
    # Example usage
    initial_state = {
        "task_title": "Implement authentication system",
        "task_description": "Build JWT-based authentication with refresh tokens and role-based access control",
        "tag_name": "work",
        "tag_description": "Work related tasks",
        "email": "test@example.com",
        "estimated_time": 120,  # 2 hours
        "similar_tags": [],
        "historical_tasks": [],
        "messages": []
    }

    print("="*60)
    print("TIME ESTIMATION AGENT")
    print("="*60)

    # Build and run the graph
    graph = build_time_estimation_graph()

    result = graph.invoke(initial_state)

    # Display results
    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    print(f"Recommendation: {result.get('recommendation', 'N/A').upper()}")
    print(f"Suggested Time: {result.get('suggested_minutes', 'N/A')} minutes")
    print(f"Confidence: {result.get('confidence', 'N/A').upper()}")
    print(f"\nReasoning:")
    print(result.get('reasoning', 'N/A'))
    print("="*60)

    # Save result to JSON for verification
    import json
    with open("agent_result.json", "w") as f:
        # Filter out non-serializable objects (like messages)
        serializable_result = {k: v for k, v in result.items() if k != "messages"}
        serializable_result["similar_tasks_count"] = len(result.get("historical_tasks", []))
        json.dump(serializable_result, f, indent=2)
    print("Result saved to agent_result.json")
