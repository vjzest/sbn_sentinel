"""
D6.4: Action Lifecycle Read Contract
GET /api/v1/actions/lifecycle/{decision_id}

Assembles the full ActionLifecycleDTO for a given Human Decision:
  - The Human Decision record (authorization source)
  - All Governed Operational Actions authorized by that decision
  - All Execution Attempts per action
  - Operational Outcome per action (if any)
  - Computed capability signals: can_create, can_execute, can_retry, blocked_reason

CORE INVARIANT: All state comes from authoritative DB records.
Nothing is inferred or fabricated. Missing = UNKNOWN / NOT_PRESENT.
"""

import logging
from typing import Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.governance_storage import (
    HumanDecisionModel,
    OperationalActionModel,
    ExecutionAttemptModel,
    OperationalOutcomeModel,
)
from app.services.governance_registry import (
    ActionStatus,
    ExecutionResult,
    OutcomeConfirmationState,
    OutcomeResolutionState,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Internal helpers — all read from DB session, never from in-memory cache
# ---------------------------------------------------------------------------

def _safe_action_status(raw: Optional[str]) -> str:
    try:
        return ActionStatus(raw).value if raw else "UNKNOWN"
    except (ValueError, KeyError):
        return "UNKNOWN"


def _safe_execution_result(raw: Optional[str]) -> str:
    try:
        return ExecutionResult(raw).value if raw else "NOT_ATTEMPTED"
    except (ValueError, KeyError):
        return "UNKNOWN"


def _safe_confirmation_state(raw: Optional[str]) -> str:
    try:
        return OutcomeConfirmationState(raw).value if raw else "UNKNOWN"
    except (ValueError, KeyError):
        return "UNKNOWN"


def _safe_resolution_state(raw: Optional[str]) -> str:
    try:
        return OutcomeResolutionState(raw).value if raw else "UNKNOWN"
    except (ValueError, KeyError):
        return "UNKNOWN"


def _build_attempt_dto(r: ExecutionAttemptModel, idx: int) -> dict:
    """D6.3: Restore exact durable fields; legacy NULL rows degrade gracefully."""
    raw_num = getattr(r, "attempt_number", None)
    try:
        num = int(raw_num) if raw_num is not None else (idx + 1)
    except (ValueError, TypeError):
        num = idx + 1

    return {
        "attempt_id": r.attempt_id,
        "attempt_number": num,
        "connector": getattr(r, "connector", None) or "UNKNOWN",
        "result": _safe_execution_result(r.result),
        "request_reference": getattr(r, "request_reference", None),
        "response_reference": getattr(r, "response_reference", None),
        "error_message": getattr(r, "error_message", None),
        "attempt_timestamp": r.attempt_timestamp,
        "journey_id": r.journey_id,
    }


def _build_outcome_dto(o: Optional[OperationalOutcomeModel]) -> Optional[dict]:
    if o is None:
        return None
    import json
    try:
        expected = json.loads(o.expected_outcome_json) if getattr(o, "expected_outcome_json", None) else None
    except Exception:
        expected = None
    try:
        observed = json.loads(o.observed_outcome_json) if getattr(o, "observed_outcome_json", None) else None
    except Exception:
        observed = None

    return {
        "outcome_id": o.outcome_id,
        "action_id": o.action_id,
        "expected_outcome": expected,
        "observed_outcome": observed,
        "confirmation_state": _safe_confirmation_state(o.confirmation_state),
        "resolution_state": _safe_resolution_state(o.resolution_state),
        "source_reference": getattr(o, "source_reference", None),
        "closure_reason": getattr(o, "closure_reason", None),
        "confirmed_at": getattr(o, "confirmed_at", None),
        "closed_at": getattr(o, "closed_at", None),
        "reopened_at": getattr(o, "reopened_at", None),
        "created_at": o.created_at,
        "journey_id": o.journey_id,
    }


def _compute_capabilities(action: OperationalActionModel, attempts: list) -> dict:
    """
    Computes current capability signals from authoritative DB state.
    These are READ signals — they tell the frontend what is currently possible.
    They do NOT create, execute, or mutate anything.
    """
    status = _safe_action_status(action.status)
    result = _safe_execution_result(action.current_result)

    # can_execute: action must be in READY or CREATED state
    can_execute = status in ("READY", "CREATED")

    # can_retry: last attempt failed, action is not CANCELLED/COMPLETED/EXPIRED
    terminal_statuses = {"COMPLETED", "CANCELLED", "EXPIRED", "BLOCKED"}
    can_retry = (
        status not in terminal_statuses
        and result in ("FAILED", "PARTIAL", "UNKNOWN")
        and len(attempts) > 0
    )

    # blocked_reason: explicit block state from DB, never inferred
    blocked_reason: Optional[str] = None
    if status == "BLOCKED":
        blocked_reason = "Action is in BLOCKED state — review governance constraints before retrying."
    elif status == "EXPIRED":
        blocked_reason = "Action has expired — a new action must be authorized via a new Human Decision."
    elif status == "CANCELLED":
        blocked_reason = "Action was cancelled and cannot be executed."

    return {
        "can_execute": can_execute,
        "can_retry": can_retry,
        "blocked_reason": blocked_reason,
    }


def _build_action_dto(
    action: OperationalActionModel,
    db: Session
) -> dict:
    import json

    # Attempts — ordered by timestamp
    attempts_rows = (
        db.query(ExecutionAttemptModel)
        .filter(ExecutionAttemptModel.action_id == action.action_id)
        .order_by(ExecutionAttemptModel.attempt_timestamp)
        .all()
    )
    attempts = [_build_attempt_dto(r, idx) for idx, r in enumerate(attempts_rows)]

    # Outcome — at most one per action
    outcome_row = (
        db.query(OperationalOutcomeModel)
        .filter(OperationalOutcomeModel.action_id == action.action_id)
        .first()
    )
    outcome = _build_outcome_dto(outcome_row)

    capabilities = _compute_capabilities(action, attempts)

    try:
        params = json.loads(action.parameters_json) if getattr(action, "parameters_json", None) else {}
    except Exception:
        params = {}

    return {
        "action_id": action.action_id,
        "action_type": action.action_type,
        "target_reference": action.target_reference,
        "authorization_reference": action.authorization_reference,
        "status": _safe_action_status(action.status),
        "current_result": _safe_execution_result(action.current_result),
        "parameters": params,
        "created_at": action.created_at,
        "execute_by": getattr(action, "execute_by", None),
        "journey_id": action.journey_id,
        "attempts": attempts,
        "outcome": outcome,
        **capabilities,
    }


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.get("/lifecycle/{decision_id}")
async def get_action_lifecycle(
    decision_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
):
    """
    D6.4: Action Lifecycle Read Contract.

    Returns full ActionLifecycleDTO for the given Human Decision ID.
    All data comes from authoritative DB records only.
    Capability signals (can_execute, can_retry) computed from actual DB state.
    """
    unavailable = {
        "object_ref": {"object_type": "HumanDecision", "object_id": decision_id},
        "journey_id": None,
        "decision": None,
        "creation": {"state": "UNKNOWN", "allowed_action_types": []},
        "actions": [],
        "can_create": False,
        "technical_state": "unavailable",
    }

    # Step 1: Resolve the Human Decision record
    decision_row = (
        db.query(HumanDecisionModel)
        .filter(HumanDecisionModel.decision_id == decision_id)
        .first()
    )
    if not decision_row:
        return unavailable

    # Step 2: Only APPROVED decisions can authorize Actions (D6 invariant)
    # We still return the full DTO — UI decides what to do with non-APPROVED state.
    decision_type = decision_row.decision_type or "UNKNOWN"
    decision_status = decision_row.status or "UNKNOWN"

    is_approved = (decision_type == "APPROVED" and decision_status == "RECORDED")

    # Step 3: Resolve all Actions authorized by this decision
    action_rows = (
        db.query(OperationalActionModel)
        .filter(OperationalActionModel.authorization_reference == decision_id)
        .order_by(OperationalActionModel.created_at)
        .all()
    )

    actions_dtos = [_build_action_dto(a, db) for a in action_rows]

    # Step 4: Compute creation capability
    # can_create is ONLY true if:
    # - decision is APPROVED+RECORDED
    # - no action exists yet that is non-terminal for a given type
    # (simplified: if no COMPLETED action exists of same type, can_create)
    existing_terminal = {a.action_type for a in action_rows if _safe_action_status(a.status) in ("COMPLETED",)}
    allowed_types = ["RESCHEDULE_APPOINTMENT", "SEND_NOTIFICATION", "UPDATE_OPERATIONAL_STATUS", "CREATE_FOLLOWUP_TASK"]
    available_to_create = [t for t in allowed_types if t not in existing_terminal]

    can_create = is_approved and len(available_to_create) > 0

    creation = {
        "state": "ELIGIBLE" if can_create else ("NOT_APPROVED" if not is_approved else "EXHAUSTED"),
        "allowed_action_types": available_to_create if can_create else [],
    }

    return {
        "object_ref": {"object_type": "HumanDecision", "object_id": decision_id},
        "journey_id": decision_row.journey_id,
        "decision": {
            "decision_id": decision_row.decision_id,
            "recommendation_id": decision_row.recommendation_id,
            "actor_id": decision_row.actor_id,
            "decision_type": decision_type,
            "status": decision_status,
            "decision_timestamp": decision_row.decision_timestamp,
        },
        "creation": creation,
        "actions": actions_dtos,
        "can_create": can_create,
        "technical_state": "ready",
    }
