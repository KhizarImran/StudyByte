import os
import aiohttp
import json
from typing import Optional
from dotenv import load_dotenv
import logging
from fastapi import WebSocket

# Configure logging based on environment
log_level = logging.WARNING if os.getenv("VERCEL") else logging.INFO
logging.basicConfig(level=log_level)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class OpenAIClient:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found. Using demo mode.")
            self.demo_mode = True
        else:
            if not os.getenv("VERCEL"):  # Only log in development
                logger.info("OpenAI API key found")
            self.demo_mode = False
        
        self.model = os.getenv("MODEL_NAME", "gpt-4-turbo-preview")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "2000"))
        self.api_base = "https://api.openai.com/v1/chat/completions"
        
        if not os.getenv("VERCEL"):  # Only log in development
            logger.info(f"Initialized OpenAI client with model: {self.model}")

    async def generate_response(self, message: str, context: Optional[str] = None) -> str:
        # Demo mode for testing without API key
        if self.demo_mode:
            logger.warning("Running in demo mode (no API key)")
            return f"Demo response: You asked '{message}'. This is a test response since no OpenAI API key is configured."
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # Build messages
        messages = []
        
        # Add system message
        system_message = {
            "role": "system",
            "content": "You are a helpful AI assistant specialized in helping students prepare for the UKCAT (UK Clinical Aptitude Test). Provide clear, accurate explanations and help students understand concepts and solve problems."
        }
        messages.append(system_message)
        
        # Add context if provided
        if context:
            context_message = {
                "role": "system", 
                "content": f"Additional Context: {context}"
            }
            messages.append(context_message)
        
        # Add user message
        messages.append({
            "role": "user",
            "content": message
        })

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "stream": False
        }

        try:
            if not os.getenv("VERCEL"):  # Only log in development
                logger.info(f"Sending request to OpenAI API...")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_base,
                    headers=headers,
                    json=payload
                ) as response:
                    response.raise_for_status()
                    result = await response.json()
                    
                    if not os.getenv("VERCEL"):  # Only log in development
                        logger.info("✅ Received response from OpenAI")
                    
                    return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"❌ OpenAI API error: {str(e)}")
            return f"I'm having trouble connecting to OpenAI right now. Error: {str(e)}"

    async def generate_stream(self, websocket: WebSocket, message: str, context: Optional[str] = None):
        try:
            # Get full response
            response = await self.generate_response(message, context)
            
            # Send in chunks to simulate streaming
            words = response.split(' ')
            full_content = ""
            
            for word in words:
                full_content += word + " "
                await websocket.send_text(json.dumps({
                    "type": "stream",
                    "content": word + " ",
                    "full_content": full_content.strip()
                }))
                
            # Send end message
            await websocket.send_text(json.dumps({
                "type": "end", 
                "content": full_content.strip()
            }))
            
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            await websocket.send_text(json.dumps({
                "type": "error",
                "content": str(e)
            }))

# Create global instance
openai_client = OpenAIClient() 