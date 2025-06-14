import sys
import os
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import logging
import json

# Add the current directory to Python path for Vercel compatibility
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Configure logging
log_level = logging.WARNING if os.getenv("VERCEL") else logging.INFO
logging.basicConfig(level=log_level)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import from utils package
from utils import openai_client

app = FastAPI()

# Add CORS middleware - Updated for production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175",
        "https://*.vercel.app",  # Allow Vercel preview deployments
        "https://study-byte-nu.vercel.app"  # Replace with your actual domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    context: Optional[str] = None

@app.get("/")
async def read_root():
    return {"status": "healthy", "message": "API is running"}

# Update routes to use /api prefix for Vercel routing
@app.get("/api")
async def api_root():
    return {"status": "healthy", "message": "StudyByte API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received chat request with message: {request.message}")
        
        # Generate response using OpenAI
        response = await openai_client.generate_response(
            message=request.message,
            context=request.context
        )
        
        logger.info(f"Received response from OpenAI: {response}")
        return ChatResponse(
            answer=response,
            context=request.context
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/with-context")
async def chat_with_context(request: ChatRequest):
    try:
        logger.info(f"Received chat with context request: {request.message}")
        # This endpoint will be enhanced later with RAG capabilities
        response = await openai_client.generate_response(
            message=request.message,
            context=request.context
        )
        return ChatResponse(
            answer=response,
            context=request.context
        )
    except Exception as e:
        logger.error(f"Error processing chat with context request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket support is disabled for Vercel serverless compatibility
# Uncomment for local development if needed
"""
@app.websocket("/api/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive and parse the message
            data = await websocket.receive_text()
            request = json.loads(data)
            
            logger.info(f"Received WebSocket message: {request}")
            
            # Generate streaming response using OpenAI
            await openai_client.generate_stream(
                websocket=websocket,
                message=request.get("message", ""),
                context=request.get("context")
            )
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "content": str(e)
        }))
"""

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 