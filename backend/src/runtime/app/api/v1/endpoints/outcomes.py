from fastapi import APIRouter, Depends
from typing import Any
from app.services.governance_registry import governance_registry
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/action/{action_id}")
async def get_outcome_by_action(
    action_id: str,
    current_user: Any = Depends(get_current_user)
):
    """
    SESR-007: Retrieve Governed Operational Outcome for an Action.
    """
    outcome = governance_registry.get_operational_outcome_by_action(action_id)
    if not outcome:
        return {"status": "NOT_FOUND"}

    return {
        "outcome_id": outcome.outcome_id,
        "action_id": outcome.action_id,
        "expected_outcome": outcome.expected_outcome,
        "observed_outcome": outcome.observed_outcome,
        "confirmation_state": outcome.confirmation_state.value,
        "resolution_state": outcome.resolution_state.value,
        "closure_reason": outcome.closure_reason,
        "confirmed_at": outcome.confirmed_at,
        "closed_at": outcome.closed_at
    }
