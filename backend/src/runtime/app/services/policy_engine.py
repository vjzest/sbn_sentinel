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
from app.services.base_service import BaseService

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
class PolicyEngine(BaseService):
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
        from app.services.governance_registry import governance_registry
        self.registry = governance_registry

    @property
    def service_name(self) -> str:
        return "PolicyEngine"

    @property
    def version(self) -> str:
        return "v1.0"

    def _process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implementation of BaseService._process.
        Expects payload with 'decision_context'.
        Returns dict with PolicyResult.
        """
        result = self.evaluate(decision_context=payload.get("decision_context", {}))
        return {"policy_result": result}

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

        # Get Applicable Policies (SESR-003 PRR-003)
        from datetime import datetime
        now = datetime.utcnow()
        applicable_policies = self.registry.get_applicable_policies(eval_time=now)

        for policy in applicable_policies:
            evaluated.append(f"{policy.policy_id} / {policy.version}")
            
            if policy.policy_id == "POL-001":
                if not evidence_package or (not evidence_package.get("evidence_items") and not evidence_package.get("evidence_references")):
                    failed.append(f"{policy.policy_id} / {policy.version}")
                    notes.append("BLOCKED: No operational evidence available.")
                else:
                    notes.append(f"PASS: {policy.policy_id}")
            
            elif policy.policy_id == "POL-002":
                allowed_event_types = ["EHR", "Phone", "Email", "Manual"]
                if event_type not in allowed_event_types:
                    failed.append(f"{policy.policy_id} / {policy.version}")
                    notes.append(f"BLOCKED: Event type '{event_type}' not authorized.")
                else:
                    notes.append(f"PASS: {policy.policy_id}")

        is_permitted = len(failed) == 0 and len(applicable_policies) > 0

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
