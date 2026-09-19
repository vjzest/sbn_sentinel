from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.services.human_decision_engine import human_decision_engine
from app.services.governance_registry import governance_registry, DecisionStatus
from app.api.deps import get_current_user, get_db
from app.models.signal import SignalModel
from app.models.decision_record import DecisionRecordModel
from app.models.governance_storage import RuleEvaluationModel

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


@router.get("/review/{signal_id}")
async def get_recommendation_review(
    signal_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """
    D5.0: Read contract for the Recommendation Review workspace.
    Returns authoritative Recommendation + current Human Decision based on exact Signal relationship.
    """
    signal = db.query(SignalModel).filter(SignalModel.id == signal_id).first()
    
    unavailable_resp = {
        "object_ref": {"object_type": "Signal", "object_id": signal_id},
        "journey_id": None,
        "recommendation": None,
        "authority": {
            "state": "AUTHORITY_UNKNOWN",
            "allowed_decisions": [],
            "reason_required_for": []
        },
        "current_decision": None,
        "technical_state": "unavailable"
    }

    if not signal:
        return unavailable_resp

    journey_id = signal.metadata_data.get("correlation_id") or signal.metadata_data.get("pipeline_event_id")
    unavailable_resp["journey_id"] = journey_id
    
    # 1. Resolve exact governed recommendation via DecisionRecordModel OR RuleEvaluationModel
    # D4 logic uses RuleEvaluationModel directly; we should mirror the exact same authoritative check.
    evals = db.query(RuleEvaluationModel).filter(RuleEvaluationModel.journey_id == journey_id).all()
    if not evals:
        return unavailable_resp

    # Check for ambiguity (same as D4)
    context_id = evals[0].decision_context_id
    policy_id = evals[0].policy_id
    policy_version = evals[0].policy_version
    
    for r in evals:
        if (
            r.decision_context_id != context_id or
            r.policy_id != policy_id or
            r.policy_version != policy_version
        ):
            unavailable_resp["technical_state"] = "ambiguous"
            return unavailable_resp

    # Recommendation identity is often bound via rule evaluations, but let's see if 
    # the governance_registry has a formal recommendation linked to this journey.
    # We find all recommendations for this journey in the registry
    recs = [r for r in governance_registry._recommendations if getattr(r, "journey_id", None) == journey_id]
    
    if not recs:
        # Fallback to DecisionRecordModel if not in registry
        decision_record = db.query(DecisionRecordModel).filter(
            DecisionRecordModel.event_id == signal.metadata_data.get("pipeline_event_id")
        ).first()
        
        if not decision_record or not decision_record.recommendation:
            return unavailable_resp
            
        # Parse recommendation payload
        rec_data = decision_record.recommendation
        if isinstance(rec_data, dict):
            rec_id = rec_data.get("id") or rec_data.get("recommendation_id")
            rec_content = rec_data.get("description") or rec_data.get("content", "")
            rec_status = rec_data.get("status", "ACTIVE")
            rec_priority = rec_data.get("priority", "Medium")
        else:
            return unavailable_resp
            
        recommendation_obj = {
            "recommendation_id": str(rec_id),
            "decision_context_id": context_id,
            "rule_evaluation_id": evals[0].evaluation_id,
            "mapping_id": "map-default",
            "mapping_version": "1.0",
            "content": rec_content,
            "status": rec_status,
            "priority": rec_priority,
            "generated_at": decision_record.created_at.isoformat()
        }
    else:
        # Exact authoritative recommendation from registry
        authoritative_rec = recs[0]
        recommendation_obj = {
            "recommendation_id": authoritative_rec.recommendation_id,
            "decision_context_id": authoritative_rec.decision_context_id,
            "rule_evaluation_id": authoritative_rec.rule_evaluation_id,
            "mapping_id": authoritative_rec.mapping_id,
            "mapping_version": authoritative_rec.mapping_version,
            "content": authoritative_rec.recommendation_content,
            "status": authoritative_rec.status.value,
            "priority": authoritative_rec.priority,
            "generated_at": authoritative_rec.generated_at.isoformat()
        }

    # 2. Extract Authority
    auth_config = governance_registry.get_authority_config(current_user.role)
    authority = {
        "state": "AUTHORIZED" if auth_config else "NOT_AUTHORIZED",
        "allowed_decisions": [d.value for d in auth_config.allowed_decisions] if auth_config else [],
        "reason_required_for": [d.value for d in auth_config.requires_reason_for] if auth_config else []
    }

    # 3. Extract Current Human Decision
    current_decision_obj = None
    existing_decisions = [
        d for d in governance_registry._human_decisions 
        if d.recommendation_id == recommendation_obj["recommendation_id"] and d.status == DecisionStatus.RECORDED
    ]
    if existing_decisions:
        d = existing_decisions[0]
        current_decision_obj = {
            "decision_id": d.decision_id,
            "recommendation_id": d.recommendation_id,
            "decision_type": d.decision_type.value,
            "status": d.status.value,
            "actor_id": d.actor_id,
            "decision_timestamp": d.decision_timestamp.isoformat() if d.decision_timestamp else None
        }

    return {
        "object_ref": {"object_type": "Signal", "object_id": signal_id},
        "journey_id": journey_id,
        "recommendation": recommendation_obj,
        "authority": authority,
        "current_decision": current_decision_obj,
        "technical_state": "ready"
    }
