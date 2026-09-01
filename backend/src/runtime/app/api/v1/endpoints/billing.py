import os
import razorpay
import hmac
import hashlib
import uuid
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.billing import Invoice

router = APIRouter()

# Setup Razorpay client
razorpay_key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mock")
razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret")
razorpay_webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_webhook_secret")

client = None
if razorpay_key_id and razorpay_key_secret:
    try:
        client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
    except Exception as e:
        print(f"Failed to initialize Razorpay: {e}")


class OrderCreateRequest(BaseModel):
    plan_id: str
    amount: int
    currency: str = "USD"
    user_id: int = 1  # Mock user for now


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-order")
def create_order(request: OrderCreateRequest, db: Session = Depends(get_db)):
    """
    Create a Razorpay order for a subscription upgrade and save pending invoice.
    """
    invoice_id = f"INV-{uuid.uuid4().hex[:8].upper()}"

    if not client or "mock" in razorpay_key_id:
        mock_order_id = f"order_mock_{request.plan_id}_{uuid.uuid4().hex[:6]}"
        new_invoice = Invoice(
            id=invoice_id,
            user_id=request.user_id,
            amount=request.amount / 100.0,
            currency=request.currency,
            status="Pending",
            razorpay_order_id=mock_order_id
        )
        db.add(new_invoice)
        db.commit()
        return {
            "order_id": mock_order_id,
            "amount": request.amount,
            "currency": request.currency,
            "key_id": razorpay_key_id,
            "invoice_id": invoice_id
        }

    try:
        order_data = {
            "amount": request.amount,
            "currency": request.currency,
            "receipt": invoice_id,
            "payment_capture": 1
        }
        order = client.order.create(data=order_data)

        new_invoice = Invoice(
            id=invoice_id,
            user_id=request.user_id,
            amount=request.amount / 100.0,
            currency=request.currency,
            status="Pending",
            razorpay_order_id=order["id"]
        )
        db.add(new_invoice)
        db.commit()

        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": razorpay_key_id,
            "invoice_id": invoice_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay Order creation failed: {str(e)}")


@router.post("/verify-payment")
def verify_payment(request: VerifyPaymentRequest, db: Session = Depends(get_db)):
    """
    Verify the Razorpay signature after frontend checkout success.
    """
    if not client or "mock" in razorpay_key_id:
        invoice = db.query(Invoice).filter(
            Invoice.razorpay_order_id == request.razorpay_order_id).first()
        if invoice:
            invoice.status = "Paid"
            invoice.razorpay_payment_id = request.razorpay_payment_id
            invoice.razorpay_signature = request.razorpay_signature
            db.commit()
        return {"status": "success", "message": "Mock payment verified successfully."}

    try:
        params_dict = {
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        }

        client.utility.verify_payment_signature(params_dict)

        # Update invoice
        invoice = db.query(Invoice).filter(
            Invoice.razorpay_order_id == request.razorpay_order_id).first()
        if invoice:
            invoice.status = "Paid"
            invoice.razorpay_payment_id = request.razorpay_payment_id
            invoice.razorpay_signature = request.razorpay_signature
            db.commit()

        return {"status": "success", "message": "Payment verified successfully."}
    except razorpay.errors.SignatureVerificationError:
        invoice = db.query(Invoice).filter(
            Invoice.razorpay_order_id == request.razorpay_order_id).first()
        if invoice:
            invoice.status = "Failed"
            db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle async Razorpay webhooks (e.g., recurring payments).
    """
    payload = await request.body()
    signature = request.headers.get("x-razorpay-signature")

    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    try:
        # Note: in real production we use client.utility.verify_webhook_signature
        expected_sig = hmac.new(
            bytes(razorpay_webhook_secret, 'utf-8'),
            msg=payload,
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig,
                                   signature) and "mock" not in razorpay_webhook_secret:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

        data = await request.json()
        event = data.get("event")

        if event == "payment.captured":
            payment_obj = data["payload"]["payment"]["entity"]
            order_id = payment_obj.get("order_id")
            invoice = db.query(Invoice).filter(Invoice.razorpay_order_id == order_id).first()
            if invoice:
                invoice.status = "Paid"
                invoice.razorpay_payment_id = payment_obj.get("id")
                db.commit()

        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
