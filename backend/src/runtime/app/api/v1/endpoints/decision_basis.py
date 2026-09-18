"""
D4 — Decision Basis Read-Only Projection Endpoint
GET /api/v1/decision-basis/{signal_id}

Assembles a DecisionBasisDTO from existing authoritative persisted records.
NEVER evaluates evidence, chooses policy, executes rules, generates
recommendations, or changes state. READ-ONLY.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Any, Optional
import json

from app.api.deps import get_current_user, RoleChecker
from app.db.database import get_db
from app.models.signal import SignalModel
from app.models.user import UserRole
from app.models.governance_storage import (
    RuleEvaluationModel,
    GovernedPolicyVersionModel,
)
from app.models.decision_context_models import (
    ContextMissingEvidenceModel,
    ContextConflictsModel,
    ContextFreshnessModel,
    ContextEvidenceModel,
    ContextProvenanceModel,
)

router = APIRouter()

# Roles permitted to read the Decision Basis
_ALLOWED_ROLES = [
    UserRole.CLINIC_MANAGER.value,
    UserRole.ORGANIZATION_ADMINISTRATOR.value,
    UserRole.SYSTEM_ADMINISTRATOR.value,
]


def _build_object_ref(signal: SignalModel) -> dict:
    return {
        "object_type": "Signal",
        "object_id": signal.id,
    }


def _build_decision_context(signal: SignalModel) -> dict:
    """
    Derives the Decision Context identity from the signal's stored
    authoritative fields. Mode is read from metadata.is_historical only;
    never inferred from status fields.
    """
    metadata: dict = signal.metadata_data or {}
    is_historical: Optional[bool] = metadata.get("is_historical")
    mode = "historical" if is_historical is True else "current"

    # context_id and evaluated_at come from stored metadata if backend embedded them.
    context_id: Optional[str] = metadata.get("context_id") or metadata.get("decision_context_id")
    evaluated_at: Optional[str] = metadata.get("context_evaluated_at")

    return {
        "context_id": context_id,
        "status": signal.primary_context,
        "sufficiency_status": metadata.get("sufficiency_status"),
        "evaluated_at": evaluated_at or (
            signal.timestamp.isoformat() if signal.timestamp else None
        ),
        "mode": mode,
    }


def _build_evidence(signal: SignalModel, db: Session) -> dict:
    """
    Assembles evidence sections from persisted AIS-002 records
    (ContextEvidenceModel, ContextMissingEvidenceModel, etc.).
    Returns null-safe lists — never invents content.
    """
    metadata: dict = signal.metadata_data or {}
    context_id: Optional[str] = (
        metadata.get("context_id") or metadata.get("decision_context_id")
    )

    used: list = []
    missing: list = []
    conflicts: list = []
    freshness: list = []

    if context_id:
        # Used evidence
        ev_rows = db.query(ContextEvidenceModel).filter(
            ContextEvidenceModel.context_id == context_id
        ).all()
        for ev in ev_rows:
            used.append({
                "evidence_id": ev.id,
                "type": ev.evidence_type,
                "value": ev.evidence_value,
                "retrieved_at": ev.added_at.isoformat() if ev.added_at else None,
                "retrieval_status": "RETRIEVED",
            })

        # Missing evidence
        miss_rows = db.query(ContextMissingEvidenceModel).filter(
            ContextMissingEvidenceModel.context_id == context_id
        ).all()
        for m in miss_rows:
            missing.append({
                "evidence_id": m.id,
                "type": m.expected_evidence_type,
                "impact_level": m.impact_level,
                "retrieval_status": "MISSING",
            })

        # Conflicts
        conf_rows = db.query(ContextConflictsModel).filter(
            ContextConflictsModel.context_id == context_id
        ).all()
        for c in conf_rows:
            conflicts.append({
                "conflict_id": c.id,
                "evidence_a_id": c.evidence_a_id,
                "evidence_b_id": c.evidence_b_id,
                "description": c.conflict_description,
                "resolution_status": c.resolution_status,
            })

        # Freshness
        fresh_rows = db.query(ContextFreshnessModel).filter(
            ContextFreshnessModel.context_id == context_id
        ).all()
        for f in fresh_rows:
            freshness.append({
                "evidence_id": f.evidence_id,
                "age_seconds": f.age_seconds,
                "is_stale": f.is_stale,
                "freshness_status": "STALE" if f.is_stale else "CURRENT",
            })

    # Fallback: if no context_id records exist, surface what the signal knows.
    # This is the V1 common case: records are in the signal row itself.
    if not used and not context_id:
        source_label = signal.source or "Unknown"
        used.append({
            "evidence_id": f"sig-ev-{signal.id}",
            "type": signal.type or "Unknown",
            "value": signal.primary_context or "Unknown",
            "retrieved_at": signal.timestamp.isoformat() if signal.timestamp else None,
            "retrieval_status": "RETRIEVED",
            "source": source_label,
        })

    return {
        "used": used,
        "missing": missing,
        "conflicts": conflicts,
        "freshness": freshness,
    }


def _build_policy(signal: SignalModel, db: Session) -> Optional[dict]:
    """
    Returns policy basis from the most recent ACTIVE GovernedPolicyVersionModel
    associated with the journey (if available). Returns None — never falls back
    to newest version silently; unavailability is explicit.
    """
    metadata: dict = signal.metadata_data or {}
    journey_id: Optional[str] = metadata.get("journey_id") or getattr(signal, "correlation_id", None)
    policy_id: Optional[str] = metadata.get("policy_id")

    if not policy_id:
        return None

    policy_version: Optional[str] = metadata.get("policy_version")

    if policy_version:
        # Retrieve exact pinned version
        row = db.query(GovernedPolicyVersionModel).filter(
            GovernedPolicyVersionModel.policy_id == policy_id,
            GovernedPolicyVersionModel.version == policy_version,
        ).first()
    else:
        row = None

    if not row:
        return None

    return {
        "policy_id": row.policy_id,
        "version": row.version,
        "lifecycle_state": row.lifecycle_state,
        "effective_from": row.effective_from,
        "effective_until": row.effective_until,
    }


def _build_rules(signal: SignalModel, db: Session) -> list:
    """
    Retrieves RuleEvaluationRecords for this signal's journey from the DB.
    Returns backend results as-is — never re-evaluates or infers.
    """
    metadata: dict = signal.metadata_data or {}
    journey_id: Optional[str] = (
        metadata.get("journey_id")
        or metadata.get("correlation_id")
        or getattr(signal, "correlation_id", None)
    )

    if not journey_id:
        return []

    rows = db.query(RuleEvaluationModel).filter(
        RuleEvaluationModel.journey_id == journey_id
    ).all()

    return [
        {
            "evaluation_id": r.evaluation_id,
            "rule_id": r.rule_id,
            "rule_version": r.rule_version,
            "policy_id": r.policy_id,
            "policy_version": r.policy_version,
            "result": r.result,
            "evaluation_timestamp": r.evaluation_timestamp,
        }
        for r in rows
    ]


def _build_provenance(signal: SignalModel, db: Session) -> Optional[dict]:
    """
    Level-3 provenance: exact context ID, timestamps, source system refs.
    Null-safe — returns None if no provenance records exist.
    """
    metadata: dict = signal.metadata_data or {}
    context_id: Optional[str] = (
        metadata.get("context_id") or metadata.get("decision_context_id")
    )

    if not context_id:
        return None

    prov_rows = db.query(ContextProvenanceModel).filter(
        ContextProvenanceModel.context_id == context_id
    ).all()

    provenance_items = [
        {
            "evidence_id": p.evidence_id,
            "source_system": p.source_system,
            "ingestion_timestamp": (
                p.ingestion_timestamp.isoformat() if p.ingestion_timestamp else None
            ),
        }
        for p in prov_rows
    ]

    return {
        "context_id": context_id,
        "provenance_items": provenance_items,
    }


@router.get("/{signal_id}")
def get_decision_basis(
    signal_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(RoleChecker(_ALLOWED_ROLES)),
):
    """
    D4 — Read-only Decision Basis projection for a governed Signal.

    Returns authoritative evidence, context, policy and rule records
    already persisted by the processing pipeline. No evaluation,
    calculation, inference, or mutation is performed here.
    """
    signal = db.query(SignalModel).filter(SignalModel.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail=f"Signal '{signal_id}' not found.")

    metadata: dict = signal.metadata_data or {}

    # Determine technical_state
    technical_state = "ready"
    if not signal:
        technical_state = "unavailable"

    try:
        evidence = _build_evidence(signal, db)
        policy = _build_policy(signal, db)
        rules = _build_rules(signal, db)
        provenance = _build_provenance(signal, db)
    except Exception:
        technical_state = "unavailable"
        evidence = {"used": [], "missing": [], "conflicts": [], "freshness": []}
        policy = None
        rules = []
        provenance = None

    return {
        "object_ref": _build_object_ref(signal),
        "journey_id": (
            metadata.get("journey_id")
            or metadata.get("correlation_id")
        ),
        "decision_context": _build_decision_context(signal),
        "evidence": evidence,
        "policy": policy,
        "rules": rules,
        "provenance": provenance,
        "technical_state": technical_state,
    }
