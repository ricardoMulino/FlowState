
import os
import requests
import re
from typing import Annotated, TypedDict, List, Dict, Any, Literal
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage
from bs4 import BeautifulSoup

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# State Definition
class SearchAgentState(TypedDict):
    """State for the search agent pipeline."""
    messages: Annotated[list, add_messages]
    urls: List[str]
    scraped_content: Dict[str, str]

# Node 1: Extract URLs
def extract_urls_node(state: SearchAgentState) -> Dict[str, Any]:
    """
    Extracts URLs from the latest user message.
    Limits to 2 URLs.
    """
    # Get the last user message
    messages = state["messages"]
    last_message = messages[-1]
    
    if not isinstance(last_message, HumanMessage) and not (isinstance(last_message, dict) and last_message.get("role") == "user"):
         # Try to find the last human message if checking strictly
         for m in reversed(messages):
             if isinstance(m, HumanMessage):
                 last_message = m
                 break
    
    content = last_message.content if hasattr(last_message, "content") else last_message.get("content", "")
    
    # Simple regex for URL extraction
    url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*'
    found_urls = re.findall(url_pattern, content)
    
    # Limit to 2 URLs
    if len(found_urls) > 2:
        urls = found_urls[:2]
    else:
        urls = found_urls
    
    print(f"Extracted URLs: {urls}")
    return {"urls": urls}

# Node 2: Scrape URLs
def scrape_urls_node(state: SearchAgentState) -> Dict[str, Any]:
    """
    Scrapes content from the extracted URLs.
    """
    urls = state.get("urls", [])
    scraped_content = {}
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for url in urls:
        try:
            print(f"Scraping {url}...")
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.extract()
                
            # Get text
            text = soup.get_text()
            
            # Break into lines and remove leading/trailing space on each
            lines = (line.strip() for line in text.splitlines())
            # Break multi-headlines into a line each
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            # Drop blank lines
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            # Limit content length to avoid token limits (approx 4000 chars per URL)
            scraped_content[url] = text[:4000]
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            scraped_content[url] = f"Error scraping content: {str(e)}"
            
    return {"scraped_content": scraped_content}

# Node 3: Generate Response
def generate_response_node(state: SearchAgentState) -> Dict[str, Any]:
    """
    Generates a response using the LLM and scraped content.
    """
    messages = state["messages"]
    scraped_content = state.get("scraped_content", {})
    
    # Prepare context from scraped content
    context_parts = []
    for url, content in scraped_content.items():
        context_parts.append(f"--- Content from {url} ---\n{content}\n---------------------------")
        
    context_str = "\n\n".join(context_parts)
    
    system_prompt = """You are a helpful AI assistant with the ability to read web pages.
    
    If the user provides URLs, you have been provided with the scraped content from those URLs below.
    Use this content to answer the user's questions. 
    If the content doesn't contain the answer, say so.
    
    If no URLs were provided, simply answer the user's question to the best of your ability.
    """
    
    if context_str:
        system_prompt += f"\n\nCONTEXT FROM SCRAPED URLS:\n{context_str}"
        
    # Construct messages for the LLM
    # We need to preserve the conversation history but inject the system prompt
    
    llm_messages = [SystemMessage(content=system_prompt)] + messages
    
    response = llm.invoke(llm_messages)
    
    return {"messages": [response]}


# Build Graph
def build_search_agent_graph():
    """Builds and compiles the search agent graph."""
    graph_builder = StateGraph(SearchAgentState)
    
    # Add nodes
    graph_builder.add_node("extract_urls", extract_urls_node)
    graph_builder.add_node("scrape_urls", scrape_urls_node)
    graph_builder.add_node("generate_response", generate_response_node)
    
    # Define edges
    graph_builder.add_edge(START, "extract_urls")
    graph_builder.add_edge("extract_urls", "scrape_urls")
    graph_builder.add_edge("scrape_urls", "generate_response")
    graph_builder.add_edge("generate_response", END)
    
    return graph_builder.compile()

if __name__ == "__main__":
    # Example usage
    print("Search Agent Initialized")
    graph = build_search_agent_graph()
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["quit", "exit"]:
            break
            
        result = graph.invoke({"messages": [HumanMessage(content=user_input)]})
        
        # improved printing of the last message
        last_message = result['messages'][-1]
        print(f"Agent: {last_message.content}")
