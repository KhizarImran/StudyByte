import os
import aiohttp
import json
from typing import Optional, AsyncGenerator, List, Dict
from dotenv import load_dotenv
import logging
import asyncio
from fastapi import WebSocket
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class DeepSeekClient:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        logger.info("Checking for DeepSeek API key...")
        
        if not self.api_key:
            logger.error("DEEPSEEK_API_KEY environment variable is not set!")
            raise ValueError("DEEPSEEK_API_KEY environment variable is not set")
        
        logger.info("DeepSeek API key found")
        self.model = os.getenv("MODEL_NAME", "deepseek-chat")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "2000"))
        self.api_base = "https://api.deepseek.com/v1"
        
        # Initialize embeddings and vector store for RAG
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = None
        
        # Load pre-computed embeddings
        self._load_embeddings()
        
        logger.info(f"Initialized DeepSeek client with model: {self.model}")

    def _load_embeddings(self):
        """Load pre-computed embeddings from disk"""
        try:
            embeddings_path = "data/ukcat_embeddings"
            if os.path.exists(embeddings_path):
                logger.info("Loading pre-computed embeddings...")
                self.vector_store = FAISS.load_local(
                    embeddings_path,
                    self.embeddings
                )
                logger.info("Successfully loaded embeddings")
            else:
                logger.warning("No pre-computed embeddings found. Please run generate_embeddings.py first.")
                self.vector_store = None
        except Exception as e:
            logger.error(f"Error loading embeddings: {str(e)}")
            self.vector_store = None

    def _get_relevant_context(self, query: str, k: int = 3) -> str:
        """Retrieve relevant context from the vector store"""
        if not self.vector_store:
            return ""
            
        docs = self.vector_store.similarity_search(query, k=k)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        if context:
            logger.info("🔍 RAG: Found relevant context from UKCAT data")
            logger.info(f"Number of relevant documents found: {len(docs)}")
        else:
            logger.info("🔍 RAG: No relevant context found")
            
        return context

    async def generate_response(self, message: str, context: Optional[str] = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # Get relevant UKCAT context if available
        logger.info("🔍 Searching for relevant UKCAT context...")
        ukcat_context = self._get_relevant_context(message)
        
        # Log the retrieved context
        if ukcat_context:
            logger.info("📚 Retrieved UKCAT Context:")
            logger.info(f"Context length: {len(ukcat_context)} characters")
            logger.info(f"Context preview: {ukcat_context[:200]}...")
        else:
            logger.info("❌ No UKCAT context found")
        
        if context:
            logger.info("📝 Additional Context provided:")
            logger.info(f"Context length: {len(context)} characters")
            logger.info(f"Context preview: {context[:200]}...")
        
        # Build the prompt with all available context
        prompt_parts = []
        if ukcat_context:
            prompt_parts.append(f"UKCAT Context:\n{ukcat_context}")
            logger.info("✨ Using RAG: Including UKCAT context in response")
        if context:
            prompt_parts.append(f"Additional Context:\n{context}")
        prompt_parts.append(f"Question: {message}")
        
        prompt = "\n\n".join(prompt_parts)
        
        # Log the complete prompt
        logger.info("📝 Complete Prompt:")
        logger.info(f"Prompt length: {len(prompt)} characters")
        logger.info(f"Prompt preview: {prompt[:200]}...")

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant specialized in helping students prepare for the UKCAT (UK Clinical Aptitude Test). Your role is to provide accurate, relevant, and detailed explanations using the provided UKCAT context to help students understand concepts, solve problems, and improve their test-taking skills. Always be supportive, encouraging, and focus on helping students learn and understand the material."
                },
                {"role": "user", "content": prompt}
            ],
            "max_tokens": self.max_tokens,
            "stream": False
        }

        # Log the payload (excluding API key for security)
        logger.info("📤 Sending Payload:")
        logger.info(f"Model: {payload['model']}")
        logger.info(f"Max tokens: {payload['max_tokens']}")
        logger.info("System message length: " + str(len(payload['messages'][0]['content'])))
        logger.info("User message length: " + str(len(payload['messages'][1]['content'])))

        try:
            logger.info(f"Sending request to DeepSeek API with message: {message[:50]}...")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    response.raise_for_status()
                    result = await response.json()
                    logger.info("✅ Successfully received response from DeepSeek API")
                    logger.info(f"Response length: {len(result['choices'][0]['message']['content'])} characters")
                    return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"❌ DeepSeek API error: {str(e)}")
            raise Exception(f"DeepSeek API error: {str(e)}")

    async def generate_stream(self, websocket: WebSocket, message: str, context: Optional[str] = None):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        }

        # Get relevant UKCAT context if available
        logger.info("🔍 Searching for relevant UKCAT context...")
        ukcat_context = self._get_relevant_context(message)
        
        # Build the prompt with all available context
        prompt_parts = []
        if ukcat_context:
            prompt_parts.append(f"UKCAT Context:\n{ukcat_context}")
            logger.info("✨ Using RAG: Including UKCAT context in response")
        if context:
            prompt_parts.append(f"Additional Context:\n{context}")
        prompt_parts.append(f"Question: {message}")
        
        prompt = "\n\n".join(prompt_parts)

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant specialized in helping students prepare for the UKCAT (UK Clinical Aptitude Test). Your role is to provide accurate, relevant, and detailed explanations using the provided UKCAT context to help students understand concepts, solve problems, and improve their test-taking skills. Always be supportive, encouraging, and focus on helping students learn and understand the material."
                },
                {"role": "user", "content": prompt}
            ],
            "max_tokens": self.max_tokens,
            "stream": True
        }

        # Log the complete payload (excluding API key)
        logger.info("📤 Complete Payload being sent:")
        logger.info(json.dumps(payload, indent=2))
        logger.info("System message content:")
        logger.info(payload["messages"][0]["content"])
        logger.info("User message content:")
        logger.info(payload["messages"][1]["content"])

        try:
            logger.info(f"Starting streaming request to DeepSeek API...")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    response.raise_for_status()
                    accumulated_message = ""
                    
                    async for line in response.content:
                        line = line.decode('utf-8').strip()
                        if line.startswith('data: '):
                            try:
                                json_str = line[6:]  # Remove "data: " prefix
                                if json_str.strip() == "[DONE]":
                                    break
                                
                                chunk = json.loads(json_str)
                                if chunk["choices"][0]["finish_reason"] is not None:
                                    break
                                    
                                content = chunk["choices"][0]["delta"].get("content", "")
                                if content:
                                    accumulated_message += content
                                    metadata = {
                                        "ragContext": ukcat_context if ukcat_context else None
                                    }
                                    await websocket.send_text(json.dumps({
                                        "type": "stream",
                                        "content": content,
                                        "full_content": accumulated_message,
                                        "metadata": metadata
                                    }))
                                    await asyncio.sleep(0.01)  # Small delay to prevent overwhelming the client
                            except json.JSONDecodeError as e:
                                logger.error(f"Error parsing streaming response: {e}")
                                continue
                    
                    # Send final message
                    metadata = {
                        "ragContext": ukcat_context if ukcat_context else None
                    }
                    await websocket.send_text(json.dumps({
                        "type": "end",
                        "content": accumulated_message,
                        "metadata": metadata
                    }))
                    
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            await websocket.send_text(json.dumps({
                "type": "error",
                "content": str(e)
            }))
            raise

# Create a singleton instance
try:
    deepseek_client = DeepSeekClient()
    logger.info("Successfully initialized DeepSeek client")
except Exception as e:
    logger.error(f"Failed to initialize DeepSeek client: {str(e)}")
    raise 