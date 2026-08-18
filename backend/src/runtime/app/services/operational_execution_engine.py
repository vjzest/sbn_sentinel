import logging
import uuid
import random
from typing import Dict, Any, Optional
from datetime import datetime
from app.services.base_service import BaseService
from app.services.governance_registry import (
    governance_registry,
    ActionType, ActionStatus, ExecutionResult,
    OperationalActionRecord, ExecutionAttemptRecord, DecisionStatus,
    ContinuityViolationError
)

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
        
    def create_action(self, decision_id: str, action_type_str: str, target_reference: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Creates an operational action based on an approved decision."""
        # Validate decision exists and is RECORDED
        decision = governance_registry.get_human_decision(decision_id)
        if not decision:
            return {"status": "ERROR", "message": f"Decision {decision_id} not found."}
            
        if decision.status != DecisionStatus.RECORDED:
            return {"status": "ERROR", "message": f"Decision is not in a valid state for action creation. Status: {decision.status.value}"}
            
        try:
            action_type = ActionType(action_type_str.upper())
        except ValueError:
            return {"status": "ERROR", "message": f"Invalid action type: {action_type_str}"}

        # SESR-008: Inherit journey_id from the authorizing decision
        journey_id = decision.journey_id

        # SESR-008: Validate continuity chain (action must belong to the same journey as the decision)
        try:
            governance_registry.validate_upstream_continuity(
                child_journey_id=journey_id,
                parent_id=decision_id,
                parent_type="decision"
            )
        except ContinuityViolationError as cve:
            logger.error(f"[SESR-008][OperationalExecutionEngine] Continuity violation on create_action: {cve}")
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
            return {"eligible": False, "reason": f"ACTION_NOT_READY (Current status: {action.status.value})"}
            
        if action.current_result in [ExecutionResult.SUCCESS, ExecutionResult.UNKNOWN]:
            return {"eligible": False, "reason": f"PREVIOUS_RESULT_{action.current_result.value}"}

        # EXV-004: Validate required authorization
        decision = governance_registry.get_human_decision(action.authorization_reference)
        if not decision:
            return {"eligible": False, "reason": "AUTHORIZATION_INVALID"}
            
        # EXV-007: Invalidated Authorization
        if decision.status != DecisionStatus.RECORDED:
            return {"eligible": False, "reason": f"AUTHORIZATION_NOT_RECORDED (Status: {decision.status.value})"}

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
            governance_registry.update_operational_action(action_id, ActionStatus.BLOCKED, ExecutionResult.NOT_ATTEMPTED)
            return {"status": "BLOCKED", "message": f"Execution blocked: {eligibility['reason']}"}
            
        # Update state to EXECUTING
        action = governance_registry.update_operational_action(action_id, ActionStatus.EXECUTING, action.current_result)
        
        # 2. Execution Attempt
        attempts = governance_registry.get_execution_attempts(action_id)
        attempt_number = len(attempts) + 1
        attempt_id = f"ATT-{uuid.uuid4().hex[:6].upper()}"
        
        logger.info(f"[{self.service_name}] Executing Attempt {attempt_number} for Action {action_id}")
        
        # MOCK CONNECTOR EXECUTION (AEX-020 to AEX-024)
        mock_result = self._mock_connector_call(action)
        
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
        else: # UNKNOWN
            new_status = ActionStatus.FAILED  # Or a specialized PENDING_RECONCILIATION state
            
        governance_registry.update_operational_action(action_id, new_status, mock_result["result"])
        
        return {
            "status": "COMPLETED",
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
            return {"result": ExecutionResult.FAILED, "error": "TARGET_REJECTED", "message": "External system rejected the operation."}
        elif target.endswith("-UNKNOWN"):
            return {"result": ExecutionResult.UNKNOWN, "error": "CONNECTION_TIMEOUT", "message": "Connection lost before response was received."}
        elif target.endswith("-UNAVAILABLE"):
            return {"result": ExecutionResult.FAILED, "error": "CONNECTOR_UNAVAILABLE", "message": "Connector is offline."}
        else:
            return {"result": ExecutionResult.SUCCESS, "message": "Operation successfully confirmed."}

operational_execution_engine = OperationalExecutionEngine()
