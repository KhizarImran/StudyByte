import sys
import os
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, Request
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
from utils.auth import get_current_user, get_current_user_optional, get_user_profile, update_subscription_status
from utils.stripe_client import stripe_client, SUBSCRIPTION_PLANS

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

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    subscription_status: str = "free"
    stripe_customer_id: Optional[str] = None

class CreateCheckoutRequest(BaseModel):
    plan: str
    success_url: str
    cancel_url: str

class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str

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
async def chat(request: ChatRequest, current_user = Depends(get_current_user_optional)):
    try:
        logger.info(f"Received chat request with message: {request.message}")
        
        # Add user context if authenticated
        user_context = ""
        if current_user:
            profile = get_user_profile(current_user.id)
            if profile:
                user_context = f"User subscription: {profile.get('subscription_status', 'free')}"
                logger.info(f"Authenticated user: {current_user.email} (subscription: {profile.get('subscription_status', 'free')})")
        
        # Generate response using OpenAI
        response = await openai_client.generate_response(
            message=request.message,
            context=f"{request.context or ''}\n{user_context}".strip()
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
async def chat_with_context(request: ChatRequest, current_user = Depends(get_current_user_optional)):
    try:
        logger.info(f"Received chat with context request: {request.message}")
        
        # Add user context if authenticated
        user_context = ""
        if current_user:
            profile = get_user_profile(current_user.id)
            if profile:
                user_context = f"User subscription: {profile.get('subscription_status', 'free')}"
        
        # This endpoint will be enhanced later with RAG capabilities
        response = await openai_client.generate_response(
            message=request.message,
            context=f"{request.context or ''}\n{user_context}".strip()
        )
        return ChatResponse(
            answer=response,
            context=request.context
        )
    except Exception as e:
        logger.error(f"Error processing chat with context request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile", response_model=UserProfile)
async def get_profile(current_user = Depends(get_current_user)):
    """Get current user's profile"""
    try:
        profile = get_user_profile(current_user.id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return UserProfile(**profile)
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subscription-status")
async def get_subscription_status(current_user = Depends(get_current_user)):
    """Get user's subscription status"""
    try:
        profile = get_user_profile(current_user.id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return {
            "subscription_status": profile.get("subscription_status", "free"),
            "stripe_customer_id": profile.get("stripe_customer_id")
        }
    except Exception as e:
        logger.error(f"Error fetching subscription status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subscription-plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {"plans": SUBSCRIPTION_PLANS}

@app.post("/api/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CreateCheckoutRequest,
    current_user = Depends(get_current_user)
):
    """Create a Stripe checkout session"""
    try:
        # Validate plan
        if request.plan not in SUBSCRIPTION_PLANS:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        plan = SUBSCRIPTION_PLANS[request.plan]
        price_id = plan["price_id"]
        
        if not price_id:
            raise HTTPException(status_code=500, detail="Price ID not configured for this plan")
        
        # Get user profile
        profile = get_user_profile(current_user.id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Create or get Stripe customer
        stripe_customer_id = profile.get("stripe_customer_id")
        if not stripe_customer_id:
            customer = await stripe_client.create_customer(
                email=current_user.email,
                name=profile.get("full_name")
            )
            stripe_customer_id = customer.id
            
            # Update profile with Stripe customer ID
            update_subscription_status(current_user.id, "free", stripe_customer_id)
        
        # Create checkout session
        session = await stripe_client.create_checkout_session(
            customer_id=stripe_customer_id,
            price_id=price_id,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            user_id=current_user.id
        )
        
        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id
        )
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create-billing-portal-session")
async def create_billing_portal_session(
    return_url: str,
    current_user = Depends(get_current_user)
):
    """Create a Stripe billing portal session"""
    try:
        profile = get_user_profile(current_user.id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        stripe_customer_id = profile.get("stripe_customer_id")
        if not stripe_customer_id:
            raise HTTPException(status_code=400, detail="No Stripe customer found")
        
        session = await stripe_client.create_billing_portal_session(
            customer_id=stripe_customer_id,
            return_url=return_url
        )
        
        return {"portal_url": session.url}
        
    except Exception as e:
        logger.error(f"Error creating billing portal session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stripe-webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing signature")
        
        # Verify webhook signature
        event = stripe_client.verify_webhook_signature(payload, signature)
        
        # Handle different event types
        if event.type == "customer.subscription.created":
            subscription = event.data.object
            await handle_subscription_created(subscription)
        elif event.type == "customer.subscription.updated":
            subscription = event.data.object
            await handle_subscription_updated(subscription)
        elif event.type == "customer.subscription.deleted":
            subscription = event.data.object
            await handle_subscription_deleted(subscription)
        elif event.type == "invoice.payment_succeeded":
            invoice = event.data.object
            await handle_payment_succeeded(invoice)
        elif event.type == "invoice.payment_failed":
            invoice = event.data.object
            await handle_payment_failed(invoice)
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

async def handle_subscription_created(subscription):
    """Handle subscription created event"""
    try:
        customer_id = subscription.customer
        user_id = subscription.metadata.get("user_id")
        
        if user_id:
            status = "active" if subscription.status == "active" else "inactive"
            update_subscription_status(user_id, status, customer_id)
            logger.info(f"Updated subscription status for user {user_id}: {status}")
    except Exception as e:
        logger.error(f"Error handling subscription created: {str(e)}")

async def handle_subscription_updated(subscription):
    """Handle subscription updated event"""
    try:
        customer_id = subscription.customer
        user_id = subscription.metadata.get("user_id")
        
        if user_id:
            status = "active" if subscription.status == "active" else "inactive"
            update_subscription_status(user_id, status, customer_id)
            logger.info(f"Updated subscription status for user {user_id}: {status}")
    except Exception as e:
        logger.error(f"Error handling subscription updated: {str(e)}")

async def handle_subscription_deleted(subscription):
    """Handle subscription deleted event"""
    try:
        user_id = subscription.metadata.get("user_id")
        
        if user_id:
            update_subscription_status(user_id, "free")
            logger.info(f"Subscription cancelled for user {user_id}")
    except Exception as e:
        logger.error(f"Error handling subscription deleted: {str(e)}")

async def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    try:
        customer_id = invoice.customer
        subscription_id = invoice.subscription
        
        if subscription_id:
            subscription = stripe_client.get_subscription_status(subscription_id)
            # Additional handling if needed
            logger.info(f"Payment succeeded for subscription {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling payment succeeded: {str(e)}")

async def handle_payment_failed(invoice):
    """Handle failed payment"""
    try:
        customer_id = invoice.customer
        subscription_id = invoice.subscription
        
        if subscription_id:
            # Additional handling for failed payments
            logger.warning(f"Payment failed for subscription {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling payment failed: {str(e)}")

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