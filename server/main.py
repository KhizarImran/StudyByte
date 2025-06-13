from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import logging
from utils.deepseek_client import deepseek_client
from utils.openai_client import openai_client # Use this for OpenAI 
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
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

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received chat request with message: {request.message}")
        
        # Generate response using DeepSeek
        response = await deepseek_client.generate_response(
            message=request.message,
            context=request.context
        )
        
        logger.info(f"Received response from DeepSeek: {response}")
        return ChatResponse(
            answer=response,
            context=request.context
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/with-context")
async def chat_with_context(request: ChatRequest):
    try:
        logger.info(f"Received chat with context request: {request.message}")
        # This endpoint will be enhanced later with RAG capabilities
        response = await deepseek_client.generate_response(
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

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive and parse the message
            data = await websocket.receive_text()
            request = json.loads(data)
            
            logger.info(f"Received WebSocket message: {request}")
            
            # Generate streaming response
            await deepseek_client.generate_stream(
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 