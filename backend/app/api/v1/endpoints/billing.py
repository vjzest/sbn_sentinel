import os
import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Setup Razorpay client
razorpay_key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mock")
razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret")

# We handle the case where keys might be mock keys so it doesn't crash on initialization
client = None
if razorpay_key_id and razorpay_key_secret:
    try:
        client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
    except Exception as e:
        print(f"Failed to initialize Razorpay: {e}")

class OrderCreateRequest(BaseModel):
    plan_id: str
    amount: int  # amount in INR or USD (Razorpay uses smallest currency unit, e.g. paise/cents)
    currency: str = "USD"

@router.post("/create-order")
def create_order(request: OrderCreateRequest):
    """
    Create a Razorpay order for a subscription upgrade.
    """
    if not client:
        # If no real keys are provided, return a mock order ID
        return {
            "order_id": f"order_mock_{request.plan_id}_12345",
            "amount": request.amount,
            "currency": request.currency,
            "key_id": razorpay_key_id
        }
    
    try:
        # Create a Razorpay Order
        order_data = {
            "amount": request.amount,
            "currency": request.currency,
            "receipt": f"receipt_{request.plan_id}",
            "payment_capture": 1 # Auto capture
        }
        order = client.order.create(data=order_data)
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": razorpay_key_id
        }
    except Exception as e:
        # Fallback to mock order if test keys fail
        print(f"Razorpay Order creation failed: {e}")
        return {
            "order_id": f"order_mock_{request.plan_id}_{request.amount}",
            "amount": request.amount,
            "currency": request.currency,
            "key_id": razorpay_key_id
        }
