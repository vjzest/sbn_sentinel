from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.services.operational_execution_engine import operational_execution_engine
from app.api.deps import RoleChecker
from app.models.user import UserRole

router = APIRouter()


class CreateActionRequest(BaseModel):
    decision_id: str
    action_type: str
    target_reference: str
    parameters: Dict[str, Any]


class ExecuteActionRequest(BaseModel):
    action_id: str


@router.post("/")
async def create_operational_action(request: CreateActionRequest, current_user: Any = Depends(RoleChecker(
        [UserRole.SYSTEM_ADMINISTRATOR.value, UserRole.CLINIC_MANAGER.value, UserRole.FRONT_DESK.value]))):
    """
    SESR-006: Create a Governed Operational Action based on a Human Decision.
    """
    result = operational_execution_engine.create_action(
        decision_id=request.decision_id,
        action_type_str=request.action_type,
        target_reference=request.target_reference,
        parameters=request.parameters,
        initiator_scope={
            "user_id": current_user.id,
            "org_id": getattr(current_user, "org_id", None),
            "clinic_id": getattr(current_user, "clinic_id", None)
        } if hasattr(current_user, "id") else None)

    if result["status"] == "ERROR":
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.post("/execute")
async def execute_operational_action(request: ExecuteActionRequest, current_user: Any = Depends(
        RoleChecker([UserRole.SYSTEM_ADMINISTRATOR.value, UserRole.CLINIC_MANAGER.value]))):
    """
    SESR-006: Validate execution eligibility and attempt action.
    """
    result = operational_execution_engine.execute_action(action_id=request.action_id)

    if result["status"] == "ERROR":
        raise HTTPException(status_code=400, detail=result.get("message", "Execution failed"))
    if result["status"] == "BLOCKED":
        raise HTTPException(status_code=409, detail=result.get("message", "Execution blocked"))

    return result
