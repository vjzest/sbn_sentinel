from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.database import engine
from app.models.signal import Base
from app.models.user import User
from app.models.connector import ConnectorModel
from app.models.insurance import PatientInsuranceModel
from app.models.audit import AuditLogModel
from app.models.settings import SettingsModel
from app.models.encounter import EncounterModel
from app.models.integration import IntegrationModel
from app.models.otp import OTPModel

# Create tables in SQLite/PostgreSQL (if they don't exist)
Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    """
    SBN Sentinel Backend Factory.
    Initializes the FastAPI application with enterprise configurations.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        description="Core Intelligence Backend for SBN Sentinel Revenue Architecture."
    )

    # Set all CORS enabled origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all domains including Vercel
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount the v1 API router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/")
    def root():
        return {
            "message": "Welcome to SBN Sentinel Core Engine",
            "documentation": "/docs"
        }

    @app.on_event("startup")
    def seed_super_admin():
        """
        Auto-seed a super_admin account on first startup.
        Default credentials: superadmin@sbnsentinel.com / SBNAdmin@2024
        """
        from app.db.database import SessionLocal
        from app.core.security import get_password_hash
        db = SessionLocal()
        try:
            existing = db.query(User).filter(User.email == "superadmin@sbnsentinel.com").first()
            if not existing:
                admin = User(
                    email="superadmin@sbnsentinel.com",
                    hashed_password=get_password_hash("SBNAdmin@2024"),
                    full_name="SBN Super Admin",
                    role="super_admin",
                    is_active=True
                )
                db.add(admin)
                db.commit()
                print("✅ Super Admin seeded: superadmin@sbnsentinel.com / SBNAdmin@2024")
            else:
                print("✅ Super Admin already exists.")
        except Exception as e:
            print(f"⚠️ Could not seed super admin: {e}")
        finally:
            db.close()

    return app

app = create_app()
