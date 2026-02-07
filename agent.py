import os
from dotenv import load_dotenv
from typing import Annotated, TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from pymongo import MongoClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.messages import SystemMessage

# Load environment variables (ensure GOOGLE_API_KEY is in your .env)
load_dotenv()

# Define the state which is shared between nodes
class State(TypedDict):
    # The 'add_messages' function defines how to update the list of messages
    # Annotated[list, add_messages] means new messages will be appended to the list
    messages: Annotated[list, add_messages]
    user_id: str
    context: list[str]

# Initialize Services
# 1. MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["flowstate_db"]
collection = db["flowstate_events"]

# 2. Embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

# 3. LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

def retrieve_events(state: State):
    """Retrieves relevant events based on the user's latest message using Atlas Vector Search."""
    query = state["messages"][-1].content
    user_id = state.get("user_id", "me@example.com") # Default for dev
    
    # 1. Generate query embedding
    print(f"Searching for: {query}")
    query_vec = embeddings.embed_query(query)
    
    # 2. Define Atlas Vector Search Pipeline
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_vec,
                "numCandidates": 100,
                "limit": 3,
                "filter": {"attendees": user_id} 
            }
        },
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "description": 1,
                "start_time": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    # 3. Execute Search
    try:
        results = list(collection.aggregate(pipeline))
    except Exception as e:
        print(f"Error executing vector search: {e}")
        return {"context": ["Error retrieving events."]}
    
    if not results:
        return {"context": ["No events found."]}
        
    # 4. Format results
    top_docs = []
    for event in results:
        doc_str = f"Date: {event['start_time']} - Title: {event['title']} ({event.get('description', '')})"
        top_docs.append(doc_str)
        
    return {"context": top_docs}

# Define a simple node function that calls the LLM
def chatbot(state: State):
    # Invoke the model with context
    context_str = "\n".join(state.get("context", []))
    system_prompt = f"You are a helpful assistant. Use the following context to answer the user's question:\n\n{context_str}"
    
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    return {"messages": [llm.invoke(messages)]}

# Build the LangGraph
graph_builder = StateGraph(State)
graph_builder.add_node("retrieve_events", retrieve_events)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_edge(START, "retrieve_events")
graph_builder.add_edge("retrieve_events", "chatbot")
graph_builder.add_edge("chatbot", END)

# Compile the graph into a runnable agent
graph = graph_builder.compile()

# Example usage (uncomment to test):
if __name__ == "__main__":
    # Initial state with a single user message
    initial_state = {
        "messages": [("user", "Do I have any deep work sessions planned?")],
        "user_id": "me@example.com"
    }
#     
    # Stream events from the graph
    for event in graph.stream(initial_state):
        for value in event.values():
            if "messages" in value:
                # Print the last message in the list (the model response)
                print("Assistant:", value["messages"][-1].content)
