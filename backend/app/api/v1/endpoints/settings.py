from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.settings import SettingsModel
from app.models.user import User
from app.models.integration import IntegrationModel
from app.schemas.settings import SettingsUpdate, SettingsResponse
from app.core.security import get_password_hash
from app.core.email import send_email

router = APIRouter()

@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """
    Retrieve clinical settings. If none exist in the database,
    initialize and return default settings.
    """
    settings = db.query(SettingsModel).first()
    if not settings:
        settings = SettingsModel(
            practice_name="Sentinel Health Urgent Care",
            practice_phone="(555) 019-2834",
            timezone="Eastern Time (US & Canada)",
            open_time="08:00",
            close_time="20:00",
            language="en",
            theme_mode="system",
            scheduling_aggressiveness=2,
            auto_outreach=True,
            confidence_threshold="85% (Recommended)",
            ai_model="gpt-4o",
            notify_sms=True,
            notify_email=False,
            notify_desktop=True,
            notify_copay=True,
            reminder_interval="24h",
            active_plan="professional",
            payment_card="Visa ending in 4242"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.post("", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    """
    Update clinical settings. Creates a default record first if none exists.
    """
    settings = db.query(SettingsModel).first()
    if not settings:
        settings = SettingsModel()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Update only the provided fields
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings

@router.get("/team")
def get_team_members(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Retrieve all clinic users (except super admins)."""
    users = db.query(User).filter(User.role != "super_admin").all()
    return [
        {
            "id": str(u.id),
            "name": u.full_name or "Unknown",
            "email": u.email,
            "role": u.role,
            "status": "Active" if u.is_active else "Inactive"
        }
        for u in users
    ]

@router.post("/team/invite")
def invite_team_member(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Invite a new staff member to the clinic."""
    email = payload.get("email")
    name = payload.get("name", "New Staff")
    role = payload.get("role", "staff")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = User(
        email=email,
        full_name=name,
        role=role,
        hashed_password=get_password_hash("Sentinel@123"), # Default password
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send invitation email
    login_url = "http://localhost:3000"
    html_content = f"""
    <html>
        <body>
            <h2>Welcome to SBN Sentinel!</h2>
            <p>Hi {name},</p>
            <p>You have been invited to join the SBN Sentinel Clinic Management platform.</p>
            <p>Your account has been created with the following temporary credentials:</p>
            <ul>
                <li><strong>Email:</strong> {email}</li>
                <li><strong>Password:</strong> Sentinel@123</li>
            </ul>
            <p>Please log in and update your password immediately.</p>
            <br/>
            <a href="{login_url}">Click here to log in</a>
        </body>
    </html>
    """
    send_email(to_email=email, subject="You are invited to SBN Sentinel", body=html_content, is_html=True)
    
    return {
        "id": str(new_user.id),
        "name": new_user.full_name,
        "email": new_user.email,
        "role": new_user.role,
        "status": "Active"
    }

@router.delete("/team/{user_id}")
def revoke_team_member(user_id: int, db: Session = Depends(get_db)):
    """Revoke access for a team member."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot revoke super admin")
        
    user.is_active = False
    db.commit()
    return {"message": "Access revoked successfully"}

@router.get("/integrations")
def get_integrations(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get clinic integrations status."""
    integrations = db.query(IntegrationModel).all()
    if not integrations:
        default_integrations = [
            IntegrationModel(id='practice-fusion', name='Practice Fusion EHR', type='Clinical Integration', connected=True, lastSync='1 hr ago'),
            IntegrationModel(id='gmail', name='Google Workspace Gmail', type='Secure Communication', connected=True, lastSync='30 mins ago'),
            IntegrationModel(id='twilio', name='Twilio Outbound Gateway', type='Voice & SMS API', connected=True, lastSync='10 mins ago'),
            IntegrationModel(id='clearinghouse', name='Approved Clearinghouse API', type='Billing Integration', connected=True, lastSync='2 hrs ago'),
            IntegrationModel(id='openai', name='OpenAI Intelligence Engine', type='AI Service (Approved V1)', connected=True, lastSync='5 mins ago')
        ]
        db.add_all(default_integrations)
        db.commit()
        integrations = default_integrations
        
    return [
        {
            "id": i.id,
            "name": i.name,
            "type": i.type,
            "connected": i.connected,
            "lastSync": i.lastSync
        }
        for i in integrations
    ]

@router.post("/integrations/{integration_id}/toggle")
def toggle_integration(integration_id: str, db: Session = Depends(get_db)):
    """Toggle the connected status of an integration."""
    integration = db.query(IntegrationModel).filter(IntegrationModel.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    integration.connected = not integration.connected
    integration.lastSync = 'Just now' if integration.connected else 'Never'
    db.commit()
    db.refresh(integration)
    
    return {
        "id": integration.id,
        "connected": integration.connected,
        "lastSync": integration.lastSync
    }
