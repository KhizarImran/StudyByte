import os
import stripe
from typing import Dict, Optional, List
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

class StripeClient:
    def __init__(self):
        if not stripe.api_key:
            raise ValueError("STRIPE_SECRET_KEY environment variable is not set")
        
        self.webhook_secret = STRIPE_WEBHOOK_SECRET
        logger.info("Stripe client initialized")

    async def create_customer(self, email: str, name: Optional[str] = None) -> stripe.Customer:
        """Create a new Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={"source": "studybyte"}
            )
            logger.info(f"Created Stripe customer: {customer.id}")
            return customer
        except Exception as e:
            logger.error(f"Error creating Stripe customer: {str(e)}")
            raise

    async def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        user_id: str
    ) -> stripe.checkout.Session:
        """Create a Stripe Checkout session"""
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "user_id": user_id,
                    "source": "studybyte"
                },
                allow_promotion_codes=True,
                billing_address_collection='required',
            )
            logger.info(f"Created checkout session: {session.id}")
            return session
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            raise

    async def create_billing_portal_session(
        self,
        customer_id: str,
        return_url: str
    ) -> stripe.billing_portal.Session:
        """Create a customer portal session for subscription management"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            logger.info(f"Created billing portal session: {session.id}")
            return session
        except Exception as e:
            logger.error(f"Error creating billing portal session: {str(e)}")
            raise

    def get_customer_subscriptions(self, customer_id: str) -> List[stripe.Subscription]:
        """Get all subscriptions for a customer"""
        try:
            subscriptions = stripe.Subscription.list(customer=customer_id)
            return subscriptions.data
        except Exception as e:
            logger.error(f"Error fetching subscriptions: {str(e)}")
            raise

    def verify_webhook_signature(self, payload: bytes, signature: str) -> stripe.Event:
        """Verify webhook signature and return event"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return event
        except ValueError as e:
            logger.error(f"Invalid payload: {str(e)}")
            raise
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {str(e)}")
            raise

    def get_subscription_status(self, subscription_id: str) -> str:
        """Get subscription status"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription.status
        except Exception as e:
            logger.error(f"Error fetching subscription status: {str(e)}")
            raise

# Global instance
stripe_client = StripeClient()

# Subscription plans configuration
SUBSCRIPTION_PLANS = {
    "premium": {
        "name": "StudyByte Premium",
        "price_id": os.getenv("STRIPE_PREMIUM_PRICE_ID"),
        "features": [
            "Unlimited AI chat sessions",
            "Advanced UKCAT question analysis",
            "Personal study plans",
            "Priority support",
            "Detailed performance analytics"
        ]
    },
    "pro": {
        "name": "StudyByte Pro",
        "price_id": os.getenv("STRIPE_PRO_PRICE_ID"),
        "features": [
            "Everything in Premium",
            "1-on-1 study coaching",
            "Custom question sets",
            "Exam simulation mode",
            "API access"
        ]
    }
} 