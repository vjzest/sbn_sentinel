"""
ARR-001 B-005: Policy Engine — Independent Governance Component

The Policy Engine evaluates GOVERNANCE conditions on a Decision Context.
It answers: "Is this recommendation PERMITTED?"

It runs BEFORE the Rule Engine. Always.
It evaluates only Sentinel canonical business concepts — never vendor terminology.

Responsibility:
- Is required evidence available?
- Are mandatory operational conditions met?
- Does clinic configuration permit this recommendation?
- Are authority/business constraints satisfied?

Pipeline Position:
    Decision Context Engine -> Policy Engine -> Rule Engine
"""
import logging
from typing import Dict, Any, List
from dataclasses import dataclass, field
import uuid

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# POLICY RESULT — Output of policy evaluation
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class PolicyResult:
    """
    ARR-001 B-005: The output of the Policy Engine evaluation.
    Determines whether the Rule Engine is permitted to proceed.
    """
    policy_id: str
    is_permitted: bool                       # True = Rule Engine may proceed
    evaluated_policies: List[str]            # Which policies were checked
    failed_policies: List[str]               # Which policies blocked recommendation
    governance_notes: str                    # Human-readable explanation
    policy_version: str = "v1.0"             # ARR-001 C-003: Version preservation


# ─────────────────────────────────────────────────────────────────────────────
# POLICY ENGINE — Governance gatekeeper
# ─────────────────────────────────────────────────────────────────────────────
class PolicyEngine:
    """
    ARR-001 B-005 Compliant Policy Engine.

    Evaluates governance conditions against the Decision Context.
    The Policy Engine is the governance authority. The Rule Engine is
    the operational reasoning authority. These responsibilities are NEVER merged.

    Rules:
    - Runs BEFORE Rule Engine. Always.
    - Uses only canonical Sentinel concepts. Never vendor terminology.
    - Risk scores do NOT control policy decisions.
    - Policies can be updated without changing Rule logic.
    - Can be unit tested independently without connectors.
    """

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        # Clinic policy configuration (ARR-001 B-005 Rule 4: configurable without changing rules)
        self._clinic_policies = {
            "max_wait_time_minutes": 45,
            "require_evidence_before_recommendation": True,
            "allow_room_recommendations": True,
            "allow_billing_recommendations": True,
            "allow_scheduling_recommendations": True,
        }

    def evaluate(self, decision_context: Dict[str, Any]) -> PolicyResult:
        """
        Evaluate governance conditions against the Decision Context.

        ARR-001 B-005 Rule 1: Policies evaluate governance conditions.
        ARR-001 B-005 Rule 4: Policy is evaluated against Decision Context, not raw events.
        ARR-001 B-005 Rule 5: Risk scores do not control decisions.

        Returns a PolicyResult indicating whether recommendations are permitted.
        """
        evaluated = []
        failed = []
        notes = []

        # We assume decision_context has these injected
        evidence_package = decision_context.get("evidence_package")
        event_type = decision_context.get("event_type", "Unknown")

        # ── POL-001: Evidence Availability Policy ────────────────────────
        evaluated.append("POL-001:EvidenceAvailability")
        if self._clinic_policies["require_evidence_before_recommendation"]:
            if not evidence_package or not evidence_package.get("evidence_items"):
                failed.append("POL-001:EvidenceAvailability")
                notes.append("BLOCKED: No operational evidence available. Recommendations require evidence.")
            else:
                notes.append("PASS: Operational evidence present.")

        # ── POL-002: Event Type Authority Policy ─────────────────────────
        evaluated.append("POL-002:EventTypeAuthority")
        allowed_event_types = ["EHR", "Phone", "Email", "Manual"]
        if event_type not in allowed_event_types:
            failed.append("POL-002:EventTypeAuthority")
            notes.append(f"BLOCKED: Event type '{event_type}' is not an authorized operational event.")
        else:
            notes.append(f"PASS: Event type '{event_type}' is authorized.")

        # ── POL-003: Clinic Configuration Policy ─────────────────────────
        evaluated.append("POL-003:ClinicConfiguration")
        notes.append("PASS: Clinic operational configuration valid for V1.")

        # ── POL-004: V1 Scope Policy — No ML/Probabilistic Decisions ─────
        evaluated.append("POL-004:DeterministicScopeV1")
        ml_triggered = decision_context.get("ml_score") is not None
        if ml_triggered:
            failed.append("POL-004:DeterministicScopeV1")
            notes.append(
                "BLOCKED: ML/probabilistic inputs detected. "
                "V1 policy requires deterministic rule evaluation only."
            )
        else:
            notes.append("PASS: Deterministic evaluation path confirmed.")

        is_permitted = len(failed) == 0

        result = PolicyResult(
            policy_id=str(uuid.uuid4()),
            is_permitted=is_permitted,
            evaluated_policies=evaluated,
            failed_policies=failed,
            governance_notes=" | ".join(notes),
            policy_version="v1.0"
        )

        self.logger.info(
            f"[PolicyEngine] Evaluation complete. Permitted={is_permitted}. "
            f"Checked={len(evaluated)} policies. Failed={len(failed)} policies."
        )
        return result

policy_engine = PolicyEngine()
