import logging
import uuid
from typing import Dict, Any
from datetime import datetime
from app.services.base_service import BaseService
from app.services.governance_registry import (
    governance_registry,
    ActionType, ActionStatus, ExecutionResult,
    OperationalActionRecord, ExecutionAttemptRecord, DecisionStatus,
    ContinuityViolationError
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class OperationalExecutionEngine(BaseService):
    """
    SESR-006 Compliant Operational Execution Engine.
    Validates eligibility and attempts governed execution.
    """

    @property
    def service_name(self) -> str:
        return "OperationalExecutionEngine"

    @property
    def version(self) -> str:
        return "v1.0"

    def _process(self, input_data: Any) -> Any:
        # Required by BaseService
        return None

    def create_action(self, decision_id: str, action_type_str: str, target_reference: str,
                      parameters: Dict[str, Any], initiator_scope: Dict[str, Any] = None) -> Dict[str, Any]:
        """Creates an operational action based on an approved decision."""
        # Validate decision exists and is RECORDED
        decision = governance_registry.get_human_decision(decision_id)
        if not decision:
            return {"status": "ERROR", "message": f"Decision {decision_id} not found."}

        if decision.status != DecisionStatus.RECORDED:
            return {
                "status": "ERROR",
                "message": f"Decision is not in a valid state for action creation. Status: {
                    decision.status.value}"}

        from app.services.governance_registry import DecisionType
        if decision.decision_type in [DecisionType.REJECTED, DecisionType.RETURNED_FOR_REVIEW]:
            return {
                "status": "ERROR",
                "message": f"Cannot create action for decision type: {
                    decision.decision_type.value}"}

        try:
            action_type = ActionType(action_type_str.upper())
        except ValueError:
            return {"status": "ERROR", "message": f"Invalid action type: {action_type_str}"}

        # P0-05 / P0-06 / SESR-005: Trusted Scope Enforcement (Item 3)
        if initiator_scope:
            org_scope = initiator_scope.get("org_id")
            if org_scope and org_scope != "SYSTEM_GLOBAL":
                from app.db.database import SessionLocal
                from app.models.governance_storage import RecommendationModel, RuleEvaluationModel
                import json
                
                db = SessionLocal()
                try:
                    # Issue #2 Fix: Resolve true ownership from persisted DB record, NOT client parameters.
                    rec = db.query(RecommendationModel).filter(
                        RecommendationModel.recommendation_id == decision.recommendation_id).first()
                    
                    if not rec:
                        return {"status": "ERROR", "message": "AUTHORIZATION_FAILURE: Orphaned decision."}
                    
                    # Instead of parsing prose recommendation text, go to the source of truth:
                    # The rule evaluation inputs that triggered this recommendation.
                    eval_record = db.query(RuleEvaluationModel).filter(
                        RuleEvaluationModel.evaluation_id == rec.rule_evaluation_id).first()
                        
                    if not eval_record:
                         return {"status": "ERROR", "message": "AUTHORIZATION_FAILURE: Missing evaluation context."}
                         
                    inputs = json.loads(eval_record.input_values_json) if eval_record.input_values_json else {}
                    true_org_id = inputs.get("org_id") or inputs.get("event", {}).get("org_id")
                    
                    if not true_org_id or true_org_id != org_scope:
                        return {
                            "status": "ERROR",
                            "message": f"AUTHORIZATION_SCOPE_MISMATCH: Action target (true_org={true_org_id}) is outside user's governed scope ({org_scope})."}
                finally:
                    db.close()

        # SESR-008: Inherit journey_id from the authorizing decision
        journey_id = decision.journey_id

        # SESR-008: Validate continuity chain (action must belong to the same
        # journey as the decision)
        try:
            governance_registry.validate_upstream_continuity(
                child_journey_id=journey_id,
                parent_id=decision_id,
                parent_type="decision"
            )
        except ContinuityViolationError as cve:
            logger.error(
                f"[SESR-008][OperationalExecutionEngine] Continuity violation on create_action: {cve}")
            return {"status": "ERROR", "message": f"CONTINUITY_VIOLATION: {str(cve)}"}

        action_id = f"ACT-{uuid.uuid4().hex[:8].upper()}"
        action = OperationalActionRecord(
            action_id=action_id,
            action_type=action_type,
            target_reference=target_reference,
            authorization_reference=decision_id,
            parameters=parameters,
            status=ActionStatus.READY,
            current_result=ExecutionResult.NOT_ATTEMPTED,
            # SESR-008: Propagate journey identity
            journey_id=journey_id
        )

        governance_registry.record_operational_action(action)
        return {"status": "SUCCESS", "action_id": action_id}

    def _pre_execution_validation(self, action: OperationalActionRecord) -> Dict[str, Any]:
        """EXV-001 to EXV-039: Execution Eligibility Controls"""

        # EXV-003: Validate current state
        if action.status not in [ActionStatus.CREATED, ActionStatus.READY, ActionStatus.FAILED]:
            return {
                "eligible": False,
                "reason": f"ACTION_NOT_READY (Current status: {
                    action.status.value})"}

        if action.current_result in [ExecutionResult.SUCCESS, ExecutionResult.UNKNOWN]:
            return {"eligible": False, "reason": f"PREVIOUS_RESULT_{action.current_result.value}"}

        # EXV-004: Validate required authorization
        decision = governance_registry.get_human_decision(action.authorization_reference)
        if not decision:
            return {"eligible": False, "reason": "AUTHORIZATION_INVALID"}

        # EXV-007: Invalidated Authorization
        if decision.status != DecisionStatus.RECORDED:
            return {
                "eligible": False,
                "reason": f"AUTHORIZATION_NOT_RECORDED (Status: {
                    decision.status.value})"}

        # EXV-009: Action expiration
        if action.execute_by and datetime.utcnow() > action.execute_by:
            return {"eligible": False, "reason": "ACTION_EXPIRED"}

        return {"eligible": True}

    def execute_action(self, action_id: str) -> Dict[str, Any]:
        """
        Attempts to execute the action if eligible.
        """
        action = governance_registry.get_operational_action(action_id)
        if not action:
            return {"status": "ERROR", "message": f"Action {action_id} not found."}

        # 1. Pre-execution Validation
        eligibility = self._pre_execution_validation(action)
        if not eligibility["eligible"]:
            governance_registry.update_operational_action(
                action_id, ActionStatus.BLOCKED, ExecutionResult.NOT_ATTEMPTED)
            return {"status": "BLOCKED", "message": f"Execution blocked: {eligibility['reason']}"}

        # Update state to EXECUTING
        action = governance_registry.update_operational_action(
            action_id, ActionStatus.EXECUTING, action.current_result)

        # 2. Execution Attempt
        attempts = governance_registry.get_execution_attempts(action_id)
        attempt_number = len(attempts) + 1
        attempt_id = f"ATT-{uuid.uuid4().hex[:6].upper()}"

        logger.info(
            f"[{self.service_name}] Executing Attempt {attempt_number} for Action {action_id}")

        # MOCK CONNECTOR EXECUTION (AEX-020 to AEX-024)
        if getattr(settings, "SYNTHETIC_TEST_ENABLED", False):
            mock_result = self._mock_connector_call(action)
        else:
            # In V1 production, real connector logic goes here.
            # If not implemented, it fails securely rather than spoofing success.
            # Audit 3 Item 5: Use NOT_ATTEMPTED/BLOCKED for missing executors
            mock_result = {
                "result": ExecutionResult.NOT_ATTEMPTED,
                "error": "NOT_IMPLEMENTED",
                "message": "Real connector not implemented for V1 production."}

        # Record Attempt
        attempt = ExecutionAttemptRecord(
            attempt_id=attempt_id,
            action_id=action_id,
            attempt_number=attempt_number,
            connector="MOCK_PRACTICE_FUSION_CONNECTOR",
            result=mock_result["result"],
            error_message=mock_result.get("error"),
            # SESR-008: Propagate journey identity from action
            journey_id=action.journey_id
        )
        governance_registry.record_execution_attempt(attempt)

        # 3. Handle Result & Update Action State
        if mock_result["result"] == ExecutionResult.SUCCESS:
            new_status = ActionStatus.COMPLETED
        elif mock_result["result"] == ExecutionResult.FAILED:
            new_status = ActionStatus.FAILED
        elif mock_result["result"] == ExecutionResult.NOT_ATTEMPTED and mock_result.get("error") == "NOT_IMPLEMENTED":
            new_status = ActionStatus.BLOCKED
        else:  # UNKNOWN
            # SESR-009: UNKNOWN means the connection timed out, but the system might have processed it.
            # We MUST leave it in EXECUTING state for reconciliation, not FAILED, to
            # prevent unsafe retries.
            new_status = ActionStatus.EXECUTING

        governance_registry.update_operational_action(action_id, new_status, mock_result["result"])

        return {
            "status": new_status.value,
            "execution_result": mock_result["result"].value,
            "attempt_id": attempt_id,
            "message": mock_result.get("message", "Execution finished.")
        }

    def _mock_connector_call(self, action: OperationalActionRecord) -> Dict[str, Any]:
        """
        Simulates an external API call that might succeed, fail, or time out (UNKNOWN).
        """
        # We can use the action target to deterministically mock failures for testing.
        target = action.target_reference

        if target.endswith("-FAIL"):
            return {
                "result": ExecutionResult.FAILED,
                "error": "TARGET_REJECTED",
                "message": "External system rejected the operation."}
        elif target.endswith("-UNKNOWN"):
            return {"result": ExecutionResult.UNKNOWN, "error": "CONNECTION_TIMEOUT",
                    "message": "Connection lost before response was received."}
        elif target.endswith("-UNAVAILABLE"):
            return {
                "result": ExecutionResult.FAILED,
                "error": "CONNECTOR_UNAVAILABLE",
                "message": "Connector is offline."}
        else:
            return {"result": ExecutionResult.SUCCESS,
                    "message": "Operation successfully confirmed."}


operational_execution_engine = OperationalExecutionEngine()
