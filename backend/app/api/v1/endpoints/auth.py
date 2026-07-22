from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

class RegisterInitiateRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "clinic_admin"

@router.post("/register/initiate")
def initiate_registration(user_in: RegisterInitiateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
        
    import random
    from app.models.otp import OTPModel
    from app.core.email import send_email
    
    otp = str(random.randint(100000, 999999))
    db_otp = OTPModel(email=user_in.email, otp_code=otp, purpose="signup")
    db.add(db_otp)
    db.commit()
    
    html_body = f"""
    <h2>SBN Sentinel Clinic Registration</h2>
    <p>Your verification code is: <strong>{otp}</strong></p>
    <p>Please enter this code in the app to complete your registration.</p>
    """
    send_email(user_in.email, "SBN Sentinel - Verification Code", html_body, is_html=True)
    
    return {"message": "OTP sent successfully."}

class RegisterVerifyRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "clinic_admin"
    otp: str

@router.post("/register")
def register_user(user_in: RegisterVerifyRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="The user already exists.")
        
    from app.models.otp import OTPModel
    otp_record = db.query(OTPModel).filter(
        OTPModel.email == user_in.email, 
        OTPModel.otp_code == user_in.otp,
        OTPModel.purpose == "signup",
        OTPModel.is_used == False
    ).order_by(OTPModel.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user)
    otp_record.is_used = True
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login_access_token(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    # Audit log entry
    from app.models.audit import AuditLogModel
    db_audit = AuditLogModel(
        user_email=user.email,
        action="USER_LOGIN",
        resource="Dashboard Authentication",
        ip_address="127.0.0.1"
    )
    db.add(db_audit)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    db.commit()
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": "If that email is registered, a password reset OTP has been sent."}
    
    # Generate OTP
    import random
    from app.models.otp import OTPModel
    from app.core.email import send_email
    
    otp = str(random.randint(100000, 999999))
    db_otp = OTPModel(email=user.email, otp_code=otp, purpose="reset_password")
    db.add(db_otp)
    db.commit()
    
    # Send email
    html_body = f"""
    <h2>SBN Sentinel Reset Password</h2>
    <p>Your one-time password (OTP) is: <strong>{otp}</strong></p>
    <p>Please enter this code in the app to reset your password. It will expire soon.</p>
    """
    send_email(user.email, "SBN Sentinel - Reset Password OTP", html_body, is_html=True)
    
    return {"message": "If that email is registered, a password reset OTP has been sent."}

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    from app.models.otp import OTPModel
    otp_record = db.query(OTPModel).filter(
        OTPModel.email == payload.email, 
        OTPModel.otp_code == payload.otp,
        OTPModel.purpose == "reset_password",
        OTPModel.is_used == False
    ).order_by(OTPModel.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = get_password_hash(payload.new_password)
    otp_record.is_used = True
    db.commit()
    return {"message": "Password has been successfully reset."}

@router.post("/accept-invite")
def accept_invite(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    from app.models.otp import OTPModel
    otp_record = db.query(OTPModel).filter(
        OTPModel.email == payload.email, 
        OTPModel.otp_code == payload.otp,
        OTPModel.purpose == "invite",
        OTPModel.is_used == False
    ).order_by(OTPModel.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = get_password_hash(payload.new_password)
    user.is_active = True
    otp_record.is_used = True
    db.commit()
    return {"message": "Account has been successfully activated."}
