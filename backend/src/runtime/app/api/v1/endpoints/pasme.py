from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
import time
import psutil
import os

from app.db.database import get_db
from app.api.deps import RoleChecker
from app.api.deps import RoleChecker  # noqa
from app.models.user import User, UserRole
from app.models.rule import RuleModel
from app.services.data_audit_engine import data_audit_engine

router = APIRouter()

# Global maintenance mode flag (in-memory for V1)
MAINTENANCE_MODE = False

# WebSocket Connection Manager for PASME Real-Time Chat


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@router.websocket("/chat/ws")
async def websocket_chat(websocket: WebSocket):
    """
    PASME Real-Time WebSocket for cross-browser Team Messaging.
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.get("/health")
def get_platform_health(current_user: User = Depends(
        RoleChecker([UserRole.SYSTEM_ADMINISTRATOR.value]))):
    """
    Returns PASME Platform Health monitoring metrics.
    """
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()

    return {
        "status": "healthy" if not MAINTENANCE_MODE else "maintenance",
        "maintenance_mode": MAINTENANCE_MODE,
        "metrics": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_usage_mb": round(memory_info.rss / 1024 / 1024, 2),
            "uptime_seconds": round(time.time() - process.create_time(), 2)
        },
        "modules": {
            "connector_engine": "online",
            "rules_engine": "online",
            "context_engine": "online",
            "dmae": "online",
            "siame": "online"
        }
    }


@router.get("/rules")
def get_all_rules(db: Session = Depends(get_db), current_user: User = Depends(
        RoleChecker([UserRole.SYSTEM_ADMINISTRATOR.value]))):
    """
    Retrieve all business rules for PASME administration.
    """
    rules = db.query(RuleModel).all()
    if not rules:
        # Seed rules if they don't exist yet
        seed_rules(db)
        rules = db.query(RuleModel).all()

    return [
        {
            "id": r.id,
            "rule_id": r.rule_id,
            "name": r.name,
            "category": r.category,
            "severity": r.severity,
            "is_active": r.is_active,
            "description": r.description
        }
        for r in rules
    ]


@router.patch("/rules/{rule_id}/toggle")
def toggle_rule(rule_id: str, db: Session = Depends(get_db), current_user: User = Depends(
        RoleChecker([UserRole.SYSTEM_ADMINISTRATOR.value]))):
    """
    Toggle a rule's active state. Audited by DMAE.
    """
    rule = db.query(RuleModel).filter(RuleModel.rule_id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    previous_state = rule.is_active  # noqa
    rule.is_active = not rule.is_active

    # MS-012/MS-010 Audit Requirement: Administrative actions are permanently traceable
    data_audit_engine._log_internal(
        db,
        user_system=current_user.email,
        action=f"{'Enabled' if rule.is_active else 'Disabled'} Rule",
        module=f"Rule: {rule.rule_id}"
    )

    db.commit()
    return {"rule_id": rule.rule_id, "is_active": rule.is_active}


@router.post("/maintenance/toggle")
def toggle_maintenance_mode(db: Session = Depends(get_db), current_user: User = Depends(
        RoleChecker([UserRole.SYSTEM_ADMINISTRATOR.value]))):
    """
    Toggle global maintenance mode.
    """
    global MAINTENANCE_MODE
    MAINTENANCE_MODE = not MAINTENANCE_MODE

    # Audit log
    data_audit_engine._log_internal(
        db,
        user_system=current_user.email,
        action=f"{'Enabled' if MAINTENANCE_MODE else 'Disabled'} Maintenance Mode",
        module="Platform System"
    )

    return {"maintenance_mode": MAINTENANCE_MODE}


def seed_rules(db: Session):
    """Seed initial rules matching the V1 requirements if empty."""
    initial_rules = [
        RuleModel(
            rule_id="SCH-001",
            name="Patient No-Show Detected",
            category="Scheduling",
            severity="High",
            description="Patient did not arrive for scheduled appointment.",
            is_active=True),
        RuleModel(
            rule_id="SCH-002",
            name="Wait Time Threshold Exceeded",
            category="Scheduling",
            severity="Critical",
            description="Patient wait time exceeded threshold (45 mins).",
            is_active=True),
        RuleModel(
            rule_id="SCH-003",
            name="New Appointment Scheduled",
            category="Scheduling",
            severity="Information",
            description="New appointment booked in EHR.",
            is_active=True),
        RuleModel(
            rule_id="OPS-001",
            name="Front Desk Unreachable (Missed Call)",
            category="Operational Capacity",
            severity="Moderate",
            description="Patient couldn't reach the front desk.",
            is_active=True),
        RuleModel(
            rule_id="CLIN-001",
            name="Clinical Documentation Pending Review",
            category="Clinical Workflow",
            severity="Moderate",
            description="Lab results pending review.",
            is_active=True)]
    db.bulk_save_objects(initial_rules)
    db.commit()
