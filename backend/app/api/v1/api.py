from fastapi import APIRouter
# Import subsystem routers here when created
from app.api.v1.endpoints import reality_connectors, signals, auth, insurance, audit, settings, encounters, super_admin, billing
api_router = APIRouter()
# Register Phase 2 Subsystems
api_router.include_router(auth.router, prefix="/auth", tags=["00_Authentication"])
api_router.include_router(reality_connectors.router, prefix="/reality", tags=["000_Reality_Connectors"])
api_router.include_router(signals.router, prefix="/signals", tags=["001_Signal_Layer"])
api_router.include_router(insurance.router, prefix="/insurance", tags=["002_Insurance_Eligibility"])
api_router.include_router(audit.router, prefix="/audit", tags=["003_Audit_Trails"])
api_router.include_router(settings.router, prefix="/settings", tags=["004_Settings"])
api_router.include_router(encounters.router, prefix="/encounters", tags=["005_Patient_Encounters"])
api_router.include_router(super_admin.router, prefix="/super-admin", tags=["006_Super_Admin"])
api_router.include_router(billing.router, prefix="/billing", tags=["007_Billing"])

@api_router.get("/health")
def health_check():
    return {"status": "SBN Sentinel Core is running", "phase": 2}
