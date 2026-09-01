from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Any
from app.services.human_decision_engine import human_decision_engine
from app.api.deps import get_current_user

router = APIRouter()


class DecisionRequest(BaseModel):
    recommendation_id: str
    decision_type: str
    reason: Optional[str] = None


@router.post("/")
async def record_human_decision(
    request: DecisionRequest,
    current_user: Any = Depends(get_current_user)
):
    """
    SESR-005: Record a Governed Human Decision.
    Authority is extracted from current_user, not the request payload (ADG-023).
    """
    payload = {
        "actor_id": str(current_user.id),
        "actor_role": current_user.role,
        "recommendation_id": request.recommendation_id,
        "decision_type": request.decision_type,
        "reason": request.reason
    }

    result = human_decision_engine._process(payload)

    if result["status"] == "ERROR":
        raise HTTPException(
            status_code=403 if "AUTHORIZ" in result.get(
                "message",
                "") else 400,
            detail=result["message"])

    return result
