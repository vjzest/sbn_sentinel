from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.api import api_router
from app.db.database import engine
from app.models.signal import Base
from app.models.user import User, UserRole
from app.models.otp import OTPModel  # noqa

# Create tables in SQLite/PostgreSQL (if they don't exist)
Base.metadata.create_all(bind=engine)

# SES-010: Initialize structured JSON logging for observability
setup_logging(settings.LOG_LEVEL if hasattr(settings, "LOG_LEVEL") else "INFO")


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
    def seed_data():
        """
        Auto-seed a super_admin account on first startup and initialize governance seeds.
        """
        from app.services.governance_registry import initialize_registry_seeds
        initialize_registry_seeds()
        # Auto-seed a super_admin account on first startup.
        # Default credentials: superadmin@sbnsentinel.com / SBNAdmin@2024
        from app.db.database import SessionLocal
        from app.core.security import get_password_hash
        db = SessionLocal()
        try:
            existing = db.query(User).filter(User.email == "superadmin@sbnsentinel.com").first()
            if not existing:
                admin = User(
                    email="superadmin@sbnsentinel.com",
                    hashed_password=get_password_hash(settings.BOOTSTRAP_ADMIN_PASSWORD),
                    full_name="SBN Super Admin",
                    role=UserRole.SYSTEM_ADMINISTRATOR.value,
                    is_active=True
                )
                db.add(admin)
                db.commit()
                print("[SUCCESS] Super Admin seeded: superadmin@sbnsentinel.com / [HIDDEN]")
            else:
                print("[SUCCESS] Super Admin already exists.")

            # Do not create a production-ready PF connector at startup.
            from app.models.connector import ConnectorModel
            import logging
            logger = logging.getLogger(__name__)
            pf_conn = db.query(ConnectorModel).filter(
                ConnectorModel.name.ilike("%Practice Fusion%")
            ).first()
            if not pf_conn:
                import uuid
                from app.core.encryption import encrypt_value
                pf_conn = ConnectorModel(
                    id=str(uuid.uuid4()),
                    name="Practice Fusion Demo",
                    type="EHR",
                    status="Healthy",
                    config={"base_url": "https://api.practicefusion.com"},
                    access_token=encrypt_value("mock-demo-token-for-d2")
                )
                db.add(pf_conn)
                db.commit()
                logger.info("Practice Fusion connector seeded for D2 compliance.")
        except Exception as e:
            print(f"[WARNING] Could not seed bootstrap data: {e}")
        finally:
            db.close()

    seed_data()

    return app


app = create_app()
