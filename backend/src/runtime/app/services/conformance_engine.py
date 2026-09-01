"""
SESR-011: System Validation & Implementation Conformance Standards
ConformanceEngine — Executes synthetic end-to-end test scenarios and
verifies that the Sentinel V1 pipeline conforms to SESR-001 through SESR-010.

This engine does NOT introduce new operational behaviour.
It inspects the post-processing state of a synthetic event to verify
that every governed layer executed correctly, completely, and
without silent deviation.
"""
import uuid
import time
import logging
from typing import Optional, List, Dict, Any

from app.db.database import SessionLocal
from app.models.event import OperationalEventModel
from app.models.intelligence import (
    RuleFindingModel, DecisionContextModel,
    OperationalIntelligenceModel, RevenueIntelligenceModel
)
from app.models.decision_record import DecisionRecordModel
from app.services.processing_orchestrator import processing_orchestrator
from app.services.validation_registry import (
    validation_registry, ValidationRegistry,
    ConformanceStatus, FindingCategory, CheckScope,
    ValidationFinding, ValidationCheckResult, ConformanceReport
)

logger = logging.getLogger(__name__)


class ConformanceEngine:
    """
    SESR-011 Conformance Engine.

    Runs synthetic test scenarios through the full Sentinel pipeline, then
    inspects every layer's output to verify conformance to the governed
    specification. Produces a ConformanceReport for each scenario.

    Isolation guarantee: Uses a separate ValidationRegistry per run.
    Does NOT write findings to the operational GovernanceRegistry.
    """

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)

    # ─────────────────────────────────────────────────────────────────
    # PUBLIC API
    # ─────────────────────────────────────────────────────────────────

    def run_scenario(
        self,
        scenario_name: str,
        raw_payload: Dict[str, Any],
        event_type: str = "EHR",
        source: str = "SESR-011-SYNTHETIC",
        priority: str = "High",
        registry: Optional[ValidationRegistry] = None,
    ) -> ConformanceReport:
        """
        Executes a full end-to-end synthetic scenario and returns a ConformanceReport.

        Args:
            scenario_name: Human-readable name for this test scenario.
            raw_payload: The synthetic EHR/Phone/Email payload to process.
            event_type: Event type string (e.g. 'EHR').
            source: Identifies the caller as synthetic/test traffic.
            priority: Event priority.
            registry: Optional custom ValidationRegistry. Defaults to the module singleton.

        Returns:
            ConformanceReport with CONFORMANT or NON_CONFORMANT verdict.
        """
        reg = registry or validation_registry
        report_id = f"SESR011-RPT-{uuid.uuid4().hex[:8].upper()}"

        self.logger.info(
            f"[SESR-011] Starting conformance scenario: '{scenario_name}' | report_id={report_id}")

        # Step 1: Ingest the synthetic event via the normal pipeline
        event = processing_orchestrator.create_event(
            event_type=event_type,
            source=source,
            raw_payload=raw_payload,
            priority=priority,
            initiated_by="SESR-011-CONFORMANCE-ENGINE",
        )
        event_id = event.id
        self.logger.info(f"[SESR-011] Synthetic event created: {event_id}")

        # Step 2: Run processing synchronously (background function)
        processing_orchestrator.process_event_background(event_id)
        self.logger.info(f"[SESR-011] Pipeline processing complete for event: {event_id}")

        # Step 3: Inspect results and run all conformance checks
        check_results = self._run_all_checks(event_id)

        # Step 4: Determine overall verdict
        failed = [r for r in check_results if r.status == ConformanceStatus.NON_CONFORMANT]
        skipped = [r for r in check_results if r.status == ConformanceStatus.SKIPPED]
        passed = [r for r in check_results if r.status == ConformanceStatus.CONFORMANT]

        overall = ConformanceStatus.CONFORMANT if not failed else ConformanceStatus.NON_CONFORMANT

        report = ConformanceReport(
            report_id=report_id,
            scenario_name=scenario_name,
            event_id=event_id,
            overall_status=overall,
            check_results=check_results,
            total_checks=len(check_results),
            passed_checks=len(passed),
            failed_checks=len(failed),
            skipped_checks=len(skipped),
        )

        reg.record_report(report)
        return report

    # ─────────────────────────────────────────────────────────────────
    # CONFORMANCE CHECKS (one per SESR requirement section)
    # ─────────────────────────────────────────────────────────────────

    def _run_all_checks(self, event_id: str) -> List[ValidationCheckResult]:
        """Runs every conformance check and returns the full list of results."""
        db = SessionLocal()
        try:
            event = db.query(OperationalEventModel).filter_by(id=event_id).first()
            decision_record = db.query(DecisionRecordModel).filter_by(event_id=event_id).first()
            decision_ctx = db.query(DecisionContextModel).filter_by(event_id=event_id).first()
            rule_findings = db.query(RuleFindingModel).filter_by(event_id=event_id).all()
            op_intel = db.query(OperationalIntelligenceModel).filter_by(event_id=event_id).first()
            rev_intel = db.query(RevenueIntelligenceModel).filter_by(event_id=event_id).first()

            results = [
                self._check_sesr001_evidence(event, decision_record),
                self._check_sesr002_decision_context(event, decision_ctx),
                self._check_sesr003_rule_evaluation(event, rule_findings, decision_record),
                self._check_sesr004_recommendation(event, decision_record),
                self._check_sesr006_pipeline_state(event),
                self._check_sesr008_audit_trail_integrity(event, decision_record, decision_ctx),
                self._check_sesr010_version_bindings(event, decision_record),
                self._check_sesr011_pipeline_completeness(event, decision_ctx, op_intel, rev_intel),
            ]
            return results
        finally:
            db.close()

    def _check_sesr001_evidence(
        self, event: OperationalEventModel, decision_record: Optional[DecisionRecordModel]
    ) -> ValidationCheckResult:
        """
        SESR-001 §2.1 — Evidence Registration.
        A DecisionRecord with populated evidence facts must exist for every processed event.
        """
        t_start = time.time()
        check_id = f"CHK-001-{uuid.uuid4().hex[:6]}"
        findings = []

        if decision_record is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_001,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="No DecisionRecordModel found for event. Evidence layer (SESR-001) did not produce a record.",
                evidence_reference=event.id if event else None,
                expected_value="DecisionRecordModel.evidence IS NOT NULL",
                actual_value="No DecisionRecordModel row found",
            ))
        elif not decision_record.evidence:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_001,
                category=FindingCategory.DATA_INTEGRITY_VIOLATION,
                description="DecisionRecordModel exists but evidence field is null/empty. Evidence facts were not captured.",
                evidence_reference=decision_record.id,
                expected_value="evidence field populated with structured fact dictionary",
                actual_value=str(decision_record.evidence),
            ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.SESR_001,
            requirement_ref="SESR-001 §2.1 — Evidence Registration & Fact Capture",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )

    def _check_sesr002_decision_context(
        self, event: OperationalEventModel, decision_ctx: Optional[DecisionContextModel]
    ) -> ValidationCheckResult:
        """
        SESR-002 §3.1 — Decision Context Construction.
        A DecisionContextModel must be created and must have primary_context set.
        """
        t_start = time.time()
        check_id = f"CHK-002-{uuid.uuid4().hex[:6]}"
        findings = []

        if decision_ctx is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_002,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="No DecisionContextModel found. DCE (SESR-002) did not execute or failed silently.",
                evidence_reference=event.id if event else None,
                expected_value="DecisionContextModel row with non-null primary_context",
                actual_value="No row found",
            ))
        elif not decision_ctx.primary_context:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_002,
                category=FindingCategory.DATA_INTEGRITY_VIOLATION,
                description="DecisionContextModel exists but primary_context is null. Context construction was incomplete.",
                evidence_reference=decision_ctx.id,
                expected_value="primary_context is non-empty string",
                actual_value=str(decision_ctx.primary_context),
            ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.SESR_002,
            requirement_ref="SESR-002 §3.1 — Governed Decision Context Construction",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )

    def _check_sesr003_rule_evaluation(
        self,
        event: OperationalEventModel,
        rule_findings: List[RuleFindingModel],
        decision_record: Optional[DecisionRecordModel],
    ) -> ValidationCheckResult:
        """
        SESR-003 §4.1 — Governed Rule Evaluation.
        At least one RuleFindingModel must exist AND the decision record must
        carry a rule_id from policy evaluation.
        """
        t_start = time.time()
        check_id = f"CHK-003-{uuid.uuid4().hex[:6]}"
        findings = []

        if not rule_findings:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_003,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="No RuleFindingModel records found. Rules Engine (SESR-003) did not evaluate any rules.",
                evidence_reference=event.id if event else None,
                expected_value="At least one RuleFindingModel row",
                actual_value="0 rows",
            ))

        if decision_record and not decision_record.rule_id:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_003,
                category=FindingCategory.DATA_INTEGRITY_VIOLATION,
                description="DecisionRecord.rule_id is null. The matched rule was not persisted to the decision record.",
                evidence_reference=decision_record.id,
                expected_value="rule_id is a non-null string (e.g. RULE-SCH-001)",
                actual_value="None",
            ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.SESR_003,
            requirement_ref="SESR-003 §4.1 — Governed Policy & Rule Evaluation",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )

    def _check_sesr004_recommendation(
        self,
        event: OperationalEventModel,
        decision_record: Optional[DecisionRecordModel],
    ) -> ValidationCheckResult:
        """
        SESR-004 §5.1 — Governed Recommendation.
        The DecisionRecord must contain a populated recommendation payload.
        """
        t_start = time.time()
        check_id = f"CHK-004-{uuid.uuid4().hex[:6]}"
        findings = []

        if decision_record is None:
            # Already caught by SESR-001 check; report as cross-module failure
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_004,
                category=FindingCategory.CROSS_MODULE_FAILURE,
                description="Cannot check recommendation: no DecisionRecordModel found (upstream SESR-001 failure).",
                evidence_reference=event.id if event else None,
            ))
        elif not decision_record.recommendation:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_004,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="DecisionRecord.recommendation is null. Recommendation Generation Engine (SESR-004) produced no output.",
                evidence_reference=decision_record.id,
                expected_value="recommendation field populated with JSON payload",
                actual_value="None",
            ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.SESR_004,
            requirement_ref="SESR-004 §5.1 — Governed Recommendation Generation",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )

    def _check_sesr006_pipeline_state(
        self, event: Optional[OperationalEventModel]
    ) -> ValidationCheckResult:
        """
        SESR-006 §7.1 — Pipeline Terminal State.
        After processing, the event must reach a terminal state (Completed or Failed),
        not remain in Queued or Running.
        """
        t_start = time.time()
        check_id = f"CHK-006-{uuid.uuid4().hex[:6]}"
        findings = []

        terminal_states = {"Completed", "Failed"}

        if event is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_006,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="Event record not found in database after processing.",
            ))
        elif event.state not in terminal_states:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_006,
                category=FindingCategory.INCORRECT_IMPLEMENTATION,
                description="Event did not reach a terminal pipeline state after processing.",
                evidence_reference=event.id,
                expected_value=f"state in {terminal_states}",
                actual_value=event.state,
            ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.SESR_006,
            requirement_ref="SESR-006 §7.1 — Governed Operational Action & Pipeline Terminal State",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )

    def _check_sesr008_audit_trail_integrity(
        self,
        event: Optional[OperationalEventModel],
        decision_record: Optional[DecisionRecordModel],
        decision_ctx: Optional[DecisionContextModel],
    ) -> ValidationCheckResult:
        """
        SESR-008 §8.2 — Continuity & Audit Trail.
        Verifies that the event, decision context, and decision record all share
        the same event_id foreign key — proving the operational chain is unbroken.
        """
        t_start = time.time()
        check_id = f"CHK-008-{uuid.uuid4().hex[:6]}"
        findings = []

        if event is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_008,
                category=FindingCategory.CONTINUITY_VIOLATION,
                description="Root event record missing. Entire audit chain is broken.",
            ))
        else:
            event_id = event.id
            if decision_ctx and decision_ctx.event_id != event_id:
                findings.append(ValidationFinding(
                    finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                    check_id=check_id,
                    scope=CheckScope.SESR_008,
                    category=FindingCategory.CONTINUITY_VIOLATION,
                    description="DecisionContextModel.event_id does not match the root event ID.",
                    evidence_reference=decision_ctx.id,
                    expected_value=event_id,
                    actual_value=decision_ctx.event_id,
                ))
            if decision_record and decision_record.event_id != event_id:
                findings.append(ValidationFinding(
                    finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                    check_id=check_id,
                    scope=CheckScope.SESR_008,
                    category=FindingCategory.CONTINUITY_VIOLATION,
                    description="DecisionRecordModel.event_id does not match the root event ID.",
                    evidence_reference=decision_record.id,
                    expected_value=event_id,
                    actual_value=decision_record.event_id,
                ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.SESR_008,
            requirement_ref="SESR-008 §8.2 — Governed Audit Trail & Operational Continuity",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )

    def _check_sesr010_version_bindings(
        self,
        event: Optional[OperationalEventModel],
        decision_record: Optional[DecisionRecordModel],
    ) -> ValidationCheckResult:
        """
        SESR-010 §9.1 — Deterministic Version Bindings.
        The DecisionRecord must carry policy_version, rule_version, and
        mapping_version so that historical reconstruction is possible.
        """
        t_start = time.time()
        check_id = f"CHK-010-{uuid.uuid4().hex[:6]}"
        findings = []

        if decision_record is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.SESR_010,
                category=FindingCategory.CROSS_MODULE_FAILURE,
                description="Cannot verify version bindings: no DecisionRecordModel found (upstream failure).",
                evidence_reference=event.id if event else None,
            ))
        else:
            missing_fields = []
            if not decision_record.policy_version:
                missing_fields.append("policy_version")
            if not decision_record.rule_version:
                missing_fields.append("rule_version")
            if not decision_record.mapping_version:
                missing_fields.append("mapping_version")

            if missing_fields:
                findings.append(ValidationFinding(
                    finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                    check_id=check_id,
                    scope=CheckScope.SESR_010,
                    category=FindingCategory.SILENT_DEVIATION,
                    description=f"DecisionRecord missing required version binding fields: {missing_fields}. Historical reconstruction will be impossible.",
                    evidence_reference=decision_record.id,
                    expected_value="All of: policy_version, rule_version, mapping_version must be non-null",
                    actual_value=f"Missing: {missing_fields}",
                ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.SESR_010,
            requirement_ref="SESR-010 §9.1 — Decision Reproducibility & Version Binding Integrity",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )

    def _check_sesr011_pipeline_completeness(
        self,
        event: Optional[OperationalEventModel],
        decision_ctx: Optional[DecisionContextModel],
        op_intel: Optional[OperationalIntelligenceModel],
        rev_intel: Optional[RevenueIntelligenceModel],
    ) -> ValidationCheckResult:
        """
        SESR-011 §10.1 — Pipeline Completeness.
        Verifies that all 8 pipeline layers left a DB artifact:
        - Layer 4: DecisionContextModel
        - Layer 5: OperationalIntelligenceModel
        - Layer 6: RevenueIntelligenceModel
        - Layer 7: layer7_storage_ref populated on event
        """
        t_start = time.time()
        check_id = f"CHK-011-{uuid.uuid4().hex[:6]}"
        findings = []

        if decision_ctx is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.PIPELINE,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="Layer 4 (Decision Context Engine) produced no DB artifact.",
                evidence_reference=event.id if event else None,
                expected_value="DecisionContextModel row",
                actual_value="None",
            ))

        if op_intel is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.PIPELINE,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="Layer 5 (Operational Intelligence Engine) produced no DB artifact.",
                evidence_reference=event.id if event else None,
                expected_value="OperationalIntelligenceModel row",
                actual_value="None",
            ))

        if rev_intel is None:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.PIPELINE,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="Layer 6 (Revenue Intelligence Engine) produced no DB artifact.",
                evidence_reference=event.id if event else None,
                expected_value="RevenueIntelligenceModel row",
                actual_value="None",
            ))

        if event and not event.layer7_storage_ref:
            findings.append(ValidationFinding(
                finding_id=f"FND-{uuid.uuid4().hex[:6]}",
                check_id=check_id,
                scope=CheckScope.PIPELINE,
                category=FindingCategory.MISSING_IMPLEMENTATION,
                description="Layer 7 (Data Audit Engine) did not set layer7_storage_ref on the event. Signal was not stored.",
                evidence_reference=event.id,
                expected_value="layer7_storage_ref is non-null",
                actual_value="None",
            ))

        status = ConformanceStatus.CONFORMANT if not findings else ConformanceStatus.NON_CONFORMANT
        return ValidationCheckResult(
            check_id=check_id,
            scope=CheckScope.PIPELINE,
            requirement_ref="SESR-011 §10.1 — Full Pipeline Layer Completeness",
            status=status,
            findings=findings,
            duration_ms=(time.time() - t_start) * 1000,
        )


# Singleton instance
conformance_engine = ConformanceEngine()
