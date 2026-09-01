from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID
from app.db.database import SessionLocal
from app.models.governance_storage import (
    RecommendationModel, HumanDecisionModel,
    OperationalActionModel, ExecutionAttemptModel, OperationalOutcomeModel
)
import logging

logger = logging.getLogger(__name__)

# ======================================================
# SESR-003: Core Governance Objects
# ======================================================


class LifecycleState(Enum):
    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    SUPERSEDED = "SUPERSEDED"
    RETIRED = "RETIRED"


@dataclass(frozen=True)
class PolicyVersion:
    """PRO-002: Policy Version Record"""
    policy_id: str
    version: str
    content: str
    lifecycle_state: LifecycleState
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    approval_state: str = "PENDING"
    approved_by: Optional[str] = None
    approval_timestamp: Optional[datetime] = None
    previous_version: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    scope: str = "Global"

    def is_applicable(self, eval_time: datetime) -> bool:
        if self.lifecycle_state != LifecycleState.ACTIVE:
            return False
        if self.effective_from and eval_time < self.effective_from:
            return False
        if self.effective_until and eval_time > self.effective_until:
            return False
        return True


@dataclass(frozen=True)
class RuleInputDefinition:
    """PRO-006: Rule Input Definition"""
    input_name: str
    input_type: str
    required: bool
    expected_source: str


@dataclass(frozen=True)
class RuleVersion:
    """PRO-004: Rule Version Record"""
    rule_id: str
    version: str
    logic_description: str
    lifecycle_state: LifecycleState
    inputs: List[RuleInputDefinition]
    allowed_outputs: List[str]
    governing_policy_id: str
    governing_policy_version: str
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    approval_state: str = "PENDING"
    approved_by: Optional[str] = None
    approval_timestamp: Optional[datetime] = None
    previous_version: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

    def is_applicable(self, eval_time: datetime) -> bool:
        if self.lifecycle_state != LifecycleState.ACTIVE:
            return False
        if self.effective_from and eval_time < self.effective_from:
            return False
        if self.effective_until and eval_time > self.effective_until:
            return False
        return True


@dataclass(frozen=True)
class RuleEvaluationRecord:
    """PRO-014: Rule Evaluation Record"""
    evaluation_id: str
    decision_context_id: str
    policy_id: str
    policy_version: str
    rule_id: str
    rule_version: str
    result: str
    evaluation_timestamp: datetime = field(default_factory=datetime.utcnow)
    input_values: Dict[str, Any] = field(default_factory=dict)
    # SESR-008: Journey identity — the correlation_id of the originating operational event
    journey_id: Optional[str] = None


# ======================================================
# SESR-004: Recommendation Governance Objects
# ======================================================

class RecommendationStatus(Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    INVALIDATED = "INVALIDATED"
    SUPERSEDED = "SUPERSEDED"


class AuthorityRequirement(Enum):
    INFORMATIONAL = "INFORMATIONAL"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"


@dataclass(frozen=True)
class RecommendationMapping:
    """RCO-002: Recommendation Mapping Record"""
    mapping_id: str
    version: str
    applicable_rule_id: str
    eligible_result: str
    recommendation_template: str
    authority_requirement: AuthorityRequirement
    priority: str
    lifecycle_state: LifecycleState
    business_impact_template: str = ""
    expected_outcome_template: str = ""
    problem_template: str = ""
    effective_from: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

    def is_applicable(self, eval_time: datetime) -> bool:
        if self.lifecycle_state != LifecycleState.ACTIVE:
            return False
        if self.effective_from and eval_time < self.effective_from:
            return False
        return True


@dataclass(frozen=True)
class RecommendationRecord:
    """RCO-001: Recommendation Record"""
    recommendation_id: str
    mapping_id: str
    mapping_version: str
    decision_context_id: str
    rule_evaluation_id: str
    recommendation_content: str
    status: RecommendationStatus
    authority_requirement: AuthorityRequirement
    priority: str
    business_impact: str = ""
    expected_outcome: str = ""
    problem: str = ""
    generated_at: datetime = field(default_factory=datetime.utcnow)
    # SESR-008: Journey identity
    journey_id: Optional[str] = None


# ======================================================
# SESR-005: Human Decision Governance Objects
# ======================================================

class DecisionType(Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    OVERRIDDEN = "OVERRIDDEN"
    RETURNED_FOR_REVIEW = "RETURNED_FOR_REVIEW"


class DecisionStatus(Enum):
    RECORDED = "RECORDED"
    SUPERSEDED = "SUPERSEDED"
    INVALIDATED = "INVALIDATED"


@dataclass(frozen=True)
class AuthorityConfiguration:
    """ADG-006: Deterministic Authority Configuration"""
    role: str
    allowed_decisions: List[DecisionType]
    can_override: bool = False
    requires_reason_for: List[DecisionType] = field(
        default_factory=lambda: [
            DecisionType.REJECTED,
            DecisionType.OVERRIDDEN])


@dataclass(frozen=True)
class HumanDecisionRecord:
    """HDO-001: Human Decision Record"""
    decision_id: str
    recommendation_id: str
    actor_id: str
    decision_type: DecisionType
    authority_basis: str
    status: DecisionStatus
    reason: Optional[str] = None
    override_indicator: bool = False
    decision_timestamp: datetime = field(default_factory=datetime.utcnow)
    # SESR-008: Journey identity
    journey_id: Optional[str] = None


# ======================================================
# SESR-006: Operational Action Governance Objects
# ======================================================

class ActionType(Enum):
    RESCHEDULE_APPOINTMENT = "RESCHEDULE_APPOINTMENT"
    SEND_NOTIFICATION = "SEND_NOTIFICATION"
    UPDATE_OPERATIONAL_STATUS = "UPDATE_OPERATIONAL_STATUS"
    CREATE_FOLLOWUP_TASK = "CREATE_FOLLOWUP_TASK"


class ActionStatus(Enum):
    CREATED = "CREATED"
    READY = "READY"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    BLOCKED = "BLOCKED"


class ExecutionResult(Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"
    UNKNOWN = "UNKNOWN"
    NOT_ATTEMPTED = "NOT_ATTEMPTED"


@dataclass(frozen=True)
class OperationalActionRecord:
    """AEX-001: Operational Action Record"""
    action_id: str
    action_type: ActionType
    target_reference: str
    authorization_reference: str
    parameters: Dict[str, Any]
    status: ActionStatus = ActionStatus.READY
    current_result: ExecutionResult = ExecutionResult.NOT_ATTEMPTED
    execute_by: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    # SESR-008: Journey identity
    journey_id: Optional[str] = None


@dataclass(frozen=True)
class ExecutionAttemptRecord:
    """AEX-014: Execution Attempt Record"""
    attempt_id: str
    action_id: str
    attempt_number: int
    connector: str
    result: ExecutionResult
    request_reference: Optional[str] = None
    response_reference: Optional[str] = None
    error_message: Optional[str] = None
    attempt_timestamp: datetime = field(default_factory=datetime.utcnow)
    # SESR-008: Journey identity
    journey_id: Optional[str] = None

# ======================================================
# SESR-007: Operational Outcome Governance Objects
# ======================================================


class OutcomeConfirmationState(Enum):
    CONFIRMED = "CONFIRMED"
    MISMATCH = "MISMATCH"
    PENDING = "PENDING"
    UNKNOWN = "UNKNOWN"


class OutcomeResolutionState(Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"
    UNRESOLVED = "UNRESOLVED"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED"


@dataclass(frozen=True)
class OperationalOutcomeRecord:
    """OOC-001: Operational Outcome Record"""
    outcome_id: str
    action_id: str
    expected_outcome: Any
    observed_outcome: Any
    confirmation_state: OutcomeConfirmationState = OutcomeConfirmationState.UNKNOWN
    resolution_state: OutcomeResolutionState = OutcomeResolutionState.OPEN
    closure_reason: Optional[str] = None
    source_reference: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    reopened_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    # SESR-008: Journey identity
    journey_id: Optional[str] = None

# ======================================================
# SESR-008: Continuity Violation Error
# ======================================================


class ContinuityViolationError(Exception):
    """
    SESR-008 CFR-001 / CVC-031: Raised when a governed record cannot be associated
    with its required upstream parent, or when journey_id values do not match.
    This error must never be silenced — it signals a broken operational chain.
    """


# ======================================================
# IN-MEMORY REGISTRIES
# ======================================================

class GovernanceRegistry:
    """
    In-memory registry to demonstrate SESR-003, SESR-004, and SESR-005 compliance.
    Acts as the Single Source of Truth for engine processing.
    """

    def __init__(self):
        loaded = self._load()
        if loaded:
            self.__dict__.update(loaded)
        else:
            self._policies: List[PolicyVersion] = []
            self._rules: List[RuleVersion] = []
            self._evaluations: List[RuleEvaluationRecord] = []
            self._recommendation_mappings: List[RecommendationMapping] = []
            self._recommendations: List[RecommendationRecord] = []
            self._human_decisions: List[HumanDecisionRecord] = []
            self._authority_configs: Dict[str, AuthorityConfiguration] = {}
            self._operational_actions: List[OperationalActionRecord] = []
            self._execution_attempts: List[ExecutionAttemptRecord] = []
            self._operational_outcomes: List[OperationalOutcomeRecord] = []

    def _load(self) -> Optional[dict]:
        from app.db.database import SessionLocal
        from app.models.governance_storage import GovernanceStorageModel
        from app.core.json_utils import loads

        db = SessionLocal()
        try:
            record = db.query(GovernanceStorageModel).filter(
                GovernanceStorageModel.id == "singleton").first()
            if record and record.state_json:
                return loads(record.state_json)
        except Exception as e:
            logger.error(f"[GovernanceRegistry] Failed to load registry from DB: {e}")
        finally:
            db.close()
        return None

    def _save(self):
        from app.db.database import SessionLocal
        from app.models.governance_storage import GovernanceStorageModel
        from app.core.json_utils import dumps

        state = {
            '_policies': self._policies,
            '_rules': self._rules,
            '_evaluations': self._evaluations,
            '_recommendation_mappings': self._recommendation_mappings,
            '_recommendations': self._recommendations,
            '_human_decisions': self._human_decisions,
            '_authority_configs': self._authority_configs,
            '_operational_actions': self._operational_actions,
            '_execution_attempts': self._execution_attempts,
            '_operational_outcomes': self._operational_outcomes,
        }

        db = SessionLocal()
        try:
            state_str = dumps(state)
            record = db.query(GovernanceStorageModel).filter(
                GovernanceStorageModel.id == "singleton").first()
            if record:
                record.state_json = state_str
            else:
                record = GovernanceStorageModel(id="singleton", state_json=state_str)
                db.add(record)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"[GovernanceRegistry] Failed to save registry to DB: {e}")
            from app.core.exceptions import PersistenceError
            raise PersistenceError("Database connection failed during Governance Registry commit.")
        finally:
            db.close()

    def register_policy(self, policy: PolicyVersion):
        self._policies.append(policy)
        self._save()

    def register_rule(self, rule: RuleVersion):
        self._rules.append(rule)
        self._save()

    def record_evaluation(self, record: RuleEvaluationRecord):
        self._evaluations.append(record)
        self._save()
        logger.debug(
            f"[GovernanceRegistry] Recorded evaluation {record.evaluation_id} -> {record.result}")

    def register_recommendation_mapping(self, mapping: RecommendationMapping):
        self._recommendation_mappings.append(mapping)
        self._save()

    def record_recommendation(self, record: RecommendationRecord):

        self._recommendations.append(record)
        self._save()
        try:
            db = SessionLocal()
            db.add(RecommendationModel(
                recommendation_id=record.recommendation_id,
                decision_context_id=record.decision_context_id,
                rule_evaluation_id=record.rule_evaluation_id,
                journey_id=record.journey_id or "UNKNOWN",
                mapping_id=record.mapping_id,
                mapping_version=record.mapping_version,
                content=record.recommendation_content,
                status=record.status.value,
                priority=record.priority,
                generated_at=record.generated_at.isoformat()
            ))
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"DB Error saving recommendation: {e}")
            if 'db' in locals():
                db.close()
        logger.debug(f"[GovernanceRegistry] Recorded recommendation {record.recommendation_id}")

    def get_recommendation(self, recommendation_id: str) -> Optional[RecommendationRecord]:
        for r in self._recommendations:
            if r.recommendation_id == recommendation_id:
                return r
        return None

    def register_authority_config(self, config: AuthorityConfiguration):
        self._authority_configs[config.role] = config
        self._save()

    def get_authority_config(self, role: str) -> Optional[AuthorityConfiguration]:
        return self._authority_configs.get(role)

    def record_human_decision(self, decision: HumanDecisionRecord):

        self._human_decisions.append(decision)
        self._save()
        try:
            db = SessionLocal()
            db.add(HumanDecisionModel(
                decision_id=decision.decision_id,
                recommendation_id=decision.recommendation_id,
                journey_id=decision.journey_id or "UNKNOWN",
                actor_id=decision.actor_id,
                decision_type=decision.decision_type.value,
                status=decision.status.value,
                decision_timestamp=decision.decision_timestamp.isoformat()
            ))
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"DB Error saving decision: {e}")
            if 'db' in locals():
                db.close()
        logger.debug(
            f"[GovernanceRegistry] Recorded human decision {
                decision.decision_id} by {
                decision.actor_id}")

    def get_human_decision(self, decision_id: str) -> Optional[HumanDecisionRecord]:
        for d in self._human_decisions:
            if d.decision_id == decision_id:
                return d
        return None

    def record_operational_action(self, action: OperationalActionRecord):

        self._operational_actions.append(action)
        self._save()
        try:
            db = SessionLocal()
            db.add(OperationalActionModel(
                action_id=action.action_id,
                authorization_reference=action.authorization_reference,
                journey_id=action.journey_id or "UNKNOWN",
                action_type=action.action_type.value,
                target_reference=action.target_reference,
                status=action.status.value,
                created_at=action.created_at.isoformat()
            ))
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"DB Error saving action: {e}")
            if 'db' in locals():
                db.close()
        logger.debug(f"[GovernanceRegistry] Recorded operational action {action.action_id}")

    def get_operational_action(self, action_id: str) -> Optional[OperationalActionRecord]:
        for a in self._operational_actions:
            if a.action_id == action_id:
                return a
        return None

    def update_operational_action(
            self,
            action_id: str,
            new_status: ActionStatus,
            new_result: ExecutionResult):
        for i, a in enumerate(self._operational_actions):
            if a.action_id == action_id:
                # Replace with new frozen dataclass instance
                import dataclasses
                updated = dataclasses.replace(a, status=new_status, current_result=new_result)
                self._operational_actions[i] = updated
                self._save()
                return updated
        return None

    def record_execution_attempt(self, attempt: ExecutionAttemptRecord):

        self._execution_attempts.append(attempt)
        self._save()
        try:
            db = SessionLocal()
            db.add(ExecutionAttemptModel(
                attempt_id=attempt.attempt_id,
                action_id=attempt.action_id,
                journey_id=attempt.journey_id or "UNKNOWN",
                result=attempt.result.value,
                attempt_timestamp=attempt.attempt_timestamp.isoformat()
            ))
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"DB Error saving attempt: {e}")
            if 'db' in locals():
                db.close()
        logger.debug(
            f"[GovernanceRegistry] Recorded execution attempt {
                attempt.attempt_id} for action {
                attempt.action_id}")

    def get_execution_attempts(self, action_id: str) -> List[ExecutionAttemptRecord]:
        return [a for a in self._execution_attempts if a.action_id == action_id]

    def record_operational_outcome(self, outcome: OperationalOutcomeRecord):

        self._operational_outcomes.append(outcome)
        self._save()
        try:
            db = SessionLocal()
            db.add(OperationalOutcomeModel(
                outcome_id=outcome.outcome_id,
                attempt_id=outcome.attempt_id,
                journey_id=outcome.journey_id or "UNKNOWN",
                operational_status=outcome.operational_status.value,
                closure_status=outcome.closure_status.value,
                timestamp=outcome.timestamp.isoformat()
            ))
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"DB Error saving outcome: {e}")
            if 'db' in locals():
                db.close()
        logger.debug(f"[GovernanceRegistry] Recorded operational outcome {outcome.outcome_id}")

    def get_operational_outcome(self, outcome_id: str) -> Optional[OperationalOutcomeRecord]:
        for o in self._operational_outcomes:
            if o.outcome_id == outcome_id:
                return o
        return None

    def get_operational_outcome_by_action(
            self, action_id: str) -> Optional[OperationalOutcomeRecord]:
        for o in self._operational_outcomes:
            if o.action_id == action_id:
                return o
        return None

    # ======================================================
    # SESR-008: Continuity Validation
    # ======================================================

    def validate_upstream_continuity(
        self,
        child_journey_id: Optional[str],
        parent_id: str,
        parent_type: str,
    ) -> None:
        """
        SESR-008 CFR-001: Validates that:
          1. A parent record with `parent_id` actually exists in the registry.
          2. The child's `journey_id` matches the parent's `journey_id`.

        Args:
            child_journey_id: The journey_id being assigned to the child record.
            parent_id: The ID of the required upstream parent record.
            parent_type: One of 'evaluation', 'recommendation', 'decision', 'action', 'outcome'.

        Raises:
            ContinuityViolationError: If parent is not found or journey_ids do not match.
        """
        parent_record = None
        parent_journey_id = None

        if parent_type == "evaluation":
            parent_record = next(
                (r for r in self._evaluations if r.evaluation_id == parent_id), None)
            if parent_record:
                parent_journey_id = parent_record.journey_id
        elif parent_type == "recommendation":
            parent_record = next(
                (r for r in self._recommendations if r.recommendation_id == parent_id), None)
            if parent_record:
                parent_journey_id = parent_record.journey_id
        elif parent_type == "decision":
            parent_record = next(
                (d for d in self._human_decisions if d.decision_id == parent_id), None)
            if parent_record:
                parent_journey_id = parent_record.journey_id
        elif parent_type == "action":
            parent_record = next(
                (a for a in self._operational_actions if a.action_id == parent_id), None)
            if parent_record:
                parent_journey_id = parent_record.journey_id
        elif parent_type == "outcome":
            parent_record = next(
                (o for o in self._operational_outcomes if o.outcome_id == parent_id), None)
            if parent_record:
                parent_journey_id = parent_record.journey_id
        else:
            raise ContinuityViolationError(
                f"[SESR-008] Unknown parent_type '{parent_type}'. "
                f"Continuity validation requires a known record type."
            )

        if parent_record is None:
            raise ContinuityViolationError(
                f"[SESR-008] CVC-031: Parent record '{parent_id}' of type '{parent_type}' "
                f"does not exist in the registry. Cannot establish continuity."
            )

        # Both must carry a journey_id, and they must match
        if child_journey_id is None or parent_journey_id is None:
            raise ContinuityViolationError(
                f"[SESR-008] CVC-031: journey_id is missing. "
                f"child_journey_id={child_journey_id}, parent_journey_id={parent_journey_id}. "
                f"Every governed record must carry an explicit journey_id."
            )

        if child_journey_id != parent_journey_id:
            raise ContinuityViolationError(
                f"[SESR-008] CVC-031: Journey identity mismatch. "
                f"child_journey_id='{child_journey_id}' does not match "
                f"parent_journey_id='{parent_journey_id}' (parent_id='{parent_id}')."
            )

        logger.debug(
            f"[SESR-008] Continuity validated: parent={parent_id} (type={parent_type}), "
            f"journey_id={child_journey_id}"
        )

    def update_operational_outcome(self, outcome_id: str, **kwargs):
        from app.core.exceptions import PersistenceError
        if kwargs.pop("simulate_persistence_error", False):
            raise PersistenceError("Database connection failed during Operational Outcome commit.")

        for i, o in enumerate(self._operational_outcomes):
            if o.outcome_id == outcome_id:
                import dataclasses
                updated = dataclasses.replace(o, **kwargs)
                self._operational_outcomes[i] = updated
                self._save()
                return updated
        return None

    def get_applicable_recommendation_mapping(
            self,
            rule_id: str,
            result: str,
            eval_time: datetime) -> Optional[RecommendationMapping]:
        """RGV-005: Deterministic Mapping Resolution"""
        applicable = []
        for m in self._recommendation_mappings:
            if m.applicable_rule_id == rule_id and m.eligible_result == result and m.is_applicable(
                    eval_time):
                applicable.append(m)
        if not applicable:
            return None
        if len(applicable) > 1:
            raise ValueError(
                f"GOVERNANCE_AMBIGUITY: Multiple active recommendation mappings found for rule {rule_id}")
        return applicable[0]

    def get_applicable_policies(self, eval_time: datetime) -> List[PolicyVersion]:
        """PRR-003: Resolve Applicable Policy Version"""
        applicable = []
        # Find latest active policy per policy_id that is effective
        for p_id in set(p.policy_id for p in self._policies):
            versions = [p for p in self._policies if p.policy_id ==
                        p_id and p.is_applicable(eval_time)]
            if len(versions) > 1:
                raise ValueError(f"GOVERNANCE_AMBIGUITY: Multiple active policies found for {p_id}")
            if versions:
                applicable.append(versions[0])
        return applicable

    def get_applicable_rules_for_policy(
            self,
            policy_id: str,
            policy_version: str,
            eval_time: datetime) -> List[RuleVersion]:
        """PRR-004: Resolve Applicable Rule Version"""
        applicable = []
        mapped_rules = [r for r in self._rules if r.governing_policy_id ==
                        policy_id and r.governing_policy_version == policy_version]
        for r_id in set(r.rule_id for r in mapped_rules):
            versions = [r for r in mapped_rules if r.rule_id == r_id and r.is_applicable(eval_time)]
            if len(versions) > 1:
                raise ValueError(f"GOVERNANCE_AMBIGUITY: Multiple active rules found for {r_id}")
            if versions:
                applicable.append(versions[0])
        return applicable

    def get_policy_by_version(self, policy_id: str, version: str) -> Optional[PolicyVersion]:
        for p in self._policies:
            if p.policy_id == policy_id and p.version == version:
                return p
        return None

    def get_rule_by_version(self, rule_id: str, version: str) -> Optional[RuleVersion]:
        for r in self._rules:
            if r.rule_id == rule_id and r.version == version:
                return r
        return None

    def get_recommendation_mapping_by_version(
            self,
            mapping_id: str,
            version: str) -> Optional[RecommendationMapping]:
        for m in self._recommendation_mappings:
            if m.mapping_id == mapping_id and m.version == version:
                return m
        return None


governance_registry = GovernanceRegistry()

# ======================================================
# SEED INITIAL GOVERNED DATA
# ======================================================


def initialize_registry_seeds():
    # 1. Evidence Availability Policy
    if governance_registry.get_policy_by_version("POL-001", "V1"):
        return
    governance_registry.register_policy(PolicyVersion(
        policy_id="POL-001",
        version="V1",
        content="Recommendations require operational evidence.",
        lifecycle_state=LifecycleState.ACTIVE,
        effective_from=datetime.utcnow() - timedelta(days=30),
        approval_state="APPROVED",
        approved_by="USR-001"
    ))

    # 2. Event Type Authority Policy
    governance_registry.register_policy(PolicyVersion(
        policy_id="POL-002",
        version="V1",
        content="Only EHR, Phone, Email, Manual events are authorized.",
        lifecycle_state=LifecycleState.ACTIVE,
        effective_from=datetime.utcnow() - timedelta(days=30),
        approval_state="APPROVED",
        approved_by="USR-001"
    ))

    # 3. Production Source Authority Policy (Item 18)
    governance_registry.register_policy(PolicyVersion(
        policy_id="POL-003",
        version="V1",
        content="Production execution is restricted to Practice Fusion sources.",
        lifecycle_state=LifecycleState.ACTIVE,
        effective_from=datetime.utcnow() - timedelta(days=30),
        approval_state="APPROVED",
        approved_by="USR-001"
    ))

    # 3. Clinic No-Show Rule
    governance_registry.register_rule(RuleVersion(
        rule_id="RULE-SCH-001",
        version="V1",
        logic_description="Flag patient no-show gaps in schedule.",
        lifecycle_state=LifecycleState.ACTIVE,
        governing_policy_id="POL-001",
        governing_policy_version="V1",
        inputs=[
            RuleInputDefinition("primary_context", "str", True, "DecisionContext"),
            RuleInputDefinition("secondary_context", "str", True, "DecisionContext"),
            RuleInputDefinition("event_type", "str", True, "DecisionContext")
        ],
        allowed_outputs=["CONDITION_MET", "CONDITION_NOT_MET", "NOT_EVALUABLE"],
        effective_from=datetime.utcnow() - timedelta(days=30),
        approval_state="APPROVED",
        approved_by="USR-001"
    ))

    # 4. Clinic Wait Time Rule
    governance_registry.register_rule(RuleVersion(
        rule_id="RULE-SCH-002",
        version="V1",
        logic_description="Flag wait times exceeding threshold.",
        lifecycle_state=LifecycleState.ACTIVE,
        governing_policy_id="POL-001",
        governing_policy_version="V1",
        inputs=[
            RuleInputDefinition("primary_context", "str", True, "DecisionContext"),
            RuleInputDefinition("secondary_context", "str", True, "DecisionContext")
        ],
        allowed_outputs=["CONDITION_MET", "CONDITION_NOT_MET", "NOT_EVALUABLE"],
        effective_from=datetime.utcnow() - timedelta(days=30),
        approval_state="APPROVED",
        approved_by="USR-001"
    ))

    # 5. System Blocked Rule (PF-Only)
    governance_registry.register_rule(RuleVersion(
        rule_id="RULE-SYS-BLOCKED",
        version="V1",
        logic_description="Blocks action if source is not Practice Fusion in Production.",
        lifecycle_state=LifecycleState.ACTIVE,
        governing_policy_id="POL-003",
        governing_policy_version="V1",
        inputs=[
            RuleInputDefinition("source_connector", "str", True, "DecisionContext")
        ],
        allowed_outputs=["NOT_EVALUABLE", "BLOCKED"],
        effective_from=datetime.utcnow() - timedelta(days=30),
        approval_state="APPROVED",
        approved_by="USR-001"
    ))

    # 6. Recommendation Mappings (SESR-004)
    governance_registry.register_recommendation_mapping(
        RecommendationMapping(
            mapping_id="REC-MAP-001",
            version="V1",
            applicable_rule_id="RULE-SCH-001",
            eligible_result="CONDITION_MET",
            recommendation_template="Consider sending an SMS reschedule link and dispatching a $25 fee claim.",
            authority_requirement=AuthorityRequirement.APPROVAL_REQUIRED,
            priority="Moderate",
            business_impact_template="-$150.00 estimated revenue loss.",
            expected_outcome_template="Recovery of $25 fee and rescheduled visit.",
            problem_template="Patient No-Show",
            lifecycle_state=LifecycleState.ACTIVE,
            effective_from=datetime.utcnow() -
            timedelta(
                days=30)))

    governance_registry.register_recommendation_mapping(
        RecommendationMapping(
            mapping_id="REC-MAP-002",
            version="V1",
            applicable_rule_id="RULE-SCH-002",
            eligible_result="CONDITION_MET",
            recommendation_template="Suggest re-routing to next available Room and notifying the Clinic Administrator.",
            authority_requirement=AuthorityRequirement.REVIEW_REQUIRED,
            priority="High",
            business_impact_template="High risk of patient satisfaction drop and negative reviews.",
            expected_outcome_template="Wait time mitigated, patient informed.",
            problem_template="Extended Patient Wait Time",
            lifecycle_state=LifecycleState.ACTIVE,
            effective_from=datetime.utcnow() -
            timedelta(
                days=30)))

    governance_registry.register_recommendation_mapping(RecommendationMapping(
        mapping_id="REC-MAP-003",
        version="V1",
        applicable_rule_id="RULE-SYS-BLOCKED",
        eligible_result="NOT_EVALUABLE",
        recommendation_template="Review policy rules.",
        authority_requirement=AuthorityRequirement.INFORMATIONAL,
        priority="Information",
        business_impact_template="Ensured compliance and security.",
        expected_outcome_template="Maintained system integrity.",
        problem_template="Action Blocked by Governance",
        lifecycle_state=LifecycleState.ACTIVE,
        effective_from=datetime.utcnow() - timedelta(days=30)
    ))

    governance_registry.register_recommendation_mapping(RecommendationMapping(
        mapping_id="REC-MAP-004",
        version="V1",
        applicable_rule_id="RULE-SCH-001",
        eligible_result="NOT_EVALUABLE",
        recommendation_template="Request Human Review for incomplete schedule data.",
        authority_requirement=AuthorityRequirement.REVIEW_REQUIRED,
        priority="Information",
        business_impact_template="None",
        expected_outcome_template="Data integrity maintained.",
        problem_template="Unverifiable Schedule Context",
        lifecycle_state=LifecycleState.ACTIVE,
        effective_from=datetime.utcnow() - timedelta(days=30)
    ))

    # 6. Authority Configurations (SESR-005)
    governance_registry.register_authority_config(
        AuthorityConfiguration(
            role="Clinic Manager",
            allowed_decisions=[
                DecisionType.APPROVED,
                DecisionType.REJECTED,
                DecisionType.OVERRIDDEN,
                DecisionType.RETURNED_FOR_REVIEW],
            can_override=True,
            requires_reason_for=[
                DecisionType.REJECTED,
                DecisionType.OVERRIDDEN]))

    governance_registry.register_authority_config(AuthorityConfiguration(
        role="Front Desk",
        allowed_decisions=[DecisionType.APPROVED, DecisionType.REJECTED],
        can_override=False,
        requires_reason_for=[DecisionType.REJECTED]
    ))
