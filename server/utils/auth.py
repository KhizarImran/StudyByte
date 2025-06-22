import os
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_service_key:
    raise ValueError("Missing Supabase environment variables")

supabase: Client = create_client(supabase_url, supabase_service_key)

# Security scheme
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate JWT token and return user information
    """
    try:
        # Verify the token with Supabase
        user = supabase.auth.get_user(credentials.credentials)
        
        if not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user.user
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
):
    """
    Optional authentication - returns user if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

def create_user_profile(user_id: str, email: str, full_name: Optional[str] = None):
    """
    Create a user profile in the profiles table
    """
    try:
        profile_data = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "subscription_status": "free",
            "created_at": "now()"
        }
        
        result = supabase.table("profiles").insert(profile_data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Error creating user profile: {str(e)}")
        return None

def get_user_profile(user_id: str):
    """
    Get user profile by ID
    """
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        return None

def update_subscription_status(user_id: str, subscription_status: str, stripe_customer_id: Optional[str] = None):
    """
    Update user's subscription status
    """
    try:
        update_data = {"subscription_status": subscription_status}
        if stripe_customer_id:
            update_data["stripe_customer_id"] = stripe_customer_id
            
        result = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Error updating subscription status: {str(e)}")
        return None 