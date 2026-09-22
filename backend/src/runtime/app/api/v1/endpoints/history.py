from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.db.database import get_db

from app.api.deps import get_current_user
from app.models.user import User
from app.models.governance_storage import (
    RecommendationModel,
    RuleEvaluationModel,
    HumanDecisionModel,
    OperationalActionModel,
    ExecutionAttemptModel,
    OperationalOutcomeModel
)
from app.models.event import OperationalEventModel
from app.services.reconstruction_engine import reconstruction_engine

router = APIRouter()

@router.get("/recommendations/{recommendation_id}")
def get_historical_recommendation(
    recommendation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Returns exact historical bindings for a specific recommendation.
    """
    rec = db.query(RecommendationModel).filter(RecommendationModel.recommendation_id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    return _build_historical_lifecycle(rec, db)

@router.get("/journeys/{journey_id}")
def get_historical_journey(
    journey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Returns ordered collection of historical recommendations for a journey.
    """
    recs = db.query(RecommendationModel).filter(RecommendationModel.journey_id == journey_id).order_by(RecommendationModel.generated_at.asc()).all()
    if not recs:
        raise HTTPException(status_code=404, detail="No historical records found for journey")

    # If ambiguous (multiple recommendations), the spec says:
    # "Multiple historical recommendations + journey-only request => ambiguous, not arbitrary selection."
    if len(recs) > 1:
        return {
            "anchor": {
                "object_type": "journey",
                "object_id": journey_id,
                "journey_id": journey_id,
                "mode": "historical"
            },
            "bindings": _empty_bindings(),
            "technical_state": "ambiguous"
        }

    return _build_historical_lifecycle(recs[0], db)

@router.get("/recommendations/{recommendation_id}/reproduction")
def get_reproduction(
    recommendation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Executes the deterministic reconstruction engine and returns the D8 ReproductionResult.
    """
    # Call reconstruction engine
    result = reconstruction_engine.reproduce_decision(recommendation_id)
    
    # Return as dict
    return {
        "status": result.status,
        "recommendation_id": result.recommendation_id,
        "original": result.original,
        "reproduced": result.reproduced,
        "differences": result.differences,
        "diagnostic": {
            "stage": result.diagnostic_stage,
            "code": result.diagnostic_code,
            "missing_dependency": result.missing_dependency
        } if result.diagnostic_code else None
    }

def _empty_bindings():
    return {
        "evidence_refs": [],
        "decision_context_id": None,
        "policy": None,
        "rule_evaluations": [],
        "recommendations": [],
        "decisions": [],
        "actions": []
    }

def _build_historical_lifecycle(rec: RecommendationModel, db: Session) -> Dict[str, Any]:
    # Event / Evidence
    event = db.query(OperationalEventModel).filter(OperationalEventModel.id == rec.journey_id).first()
    
    # Policy / Rule evaluations
    evals = []
    policy = None
    if rec.rule_evaluation_id:
        rule_eval = db.query(RuleEvaluationModel).filter(RuleEvaluationModel.evaluation_id == rec.rule_evaluation_id).first()
        if rule_eval:
            evals.append({
                "evaluation_id": rule_eval.evaluation_id,
                "rule_id": rule_eval.rule_id,
                "rule_version": rule_eval.rule_version,
                "policy_id": rule_eval.policy_id,
                "policy_version": rule_eval.policy_version,
                "evaluated_at": rule_eval.evaluation_timestamp if rule_eval.evaluation_timestamp else None
            })
            policy = {
                "policy_id": rule_eval.policy_id,
                "version": rule_eval.policy_version
            }

    # Recommendations
    recs_out = [{
        "recommendation_id": rec.recommendation_id,
        "mapping_id": rec.mapping_id,
        "mapping_version": rec.mapping_version,
        "status": rec.status,
        "generated_at": rec.generated_at + "Z" if rec.generated_at else None
    }]

    # Decisions
    decisions_out = []
    decisions = db.query(HumanDecisionModel).filter(HumanDecisionModel.recommendation_id == rec.recommendation_id).all()
    for d in decisions:
        decisions_out.append({
            "decision_id": d.id,
            "decision_type": d.decision_type,
            "status": d.status
        })

    # Actions
    actions_out = []
    # Find actions linked to this decision/recommendation
    # Usually ActionModel has a decision_record_id
    for d in decisions:
        actions = db.query(OperationalActionModel).filter(OperationalActionModel.decision_id == d.id).all()
        for a in actions:
            attempts_out = []
            attempts = db.query(ExecutionAttemptModel).filter(ExecutionAttemptModel.action_id == a.id).all()
            for att in attempts:
                attempts_out.append({
                    "attempt_id": att.id,
                    "attempt_number": att.attempt_number,
                    "result": att.result
                })
            
            outcome_out = None
            outcome = db.query(OperationalOutcomeModel).filter(OperationalOutcomeModel.action_id == a.id).first()
            if outcome:
                outcome_out = {
                    "outcome_id": outcome.id,
                    "confirmation_state": outcome.confirmation_state,
                    "resolution_state": outcome.resolution_state
                }
            
            actions_out.append({
                "action_id": a.id,
                "attempts": attempts_out,
                "outcome": outcome_out
            })

    return {
        "anchor": {
            "object_type": "recommendation",
            "object_id": rec.recommendation_id,
            "journey_id": rec.journey_id,
            "mode": "historical"
        },
        "bindings": {
            "evidence_refs": [{"evidence_id": event.evidence_id, "version": None}] if event and getattr(event, 'evidence_id', None) else [],
            "decision_context_id": event.context_id if event and getattr(event, 'context_id', None) else None,
            "policy": policy,
            "rule_evaluations": evals,
            "recommendations": recs_out,
            "decisions": decisions_out,
            "actions": actions_out
        },
        "technical_state": "ready"
    }
