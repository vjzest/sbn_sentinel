"""
SESR-011: System Validation & Implementation Conformance Standards
ValidationRegistry — In-memory store for conformance findings and reports.

This registry is the authoritative record of every conformance check executed
against the Sentinel V1 governed architecture (SESR-001 through SESR-010).
It does NOT mutate any operational state — it only observes and records.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


# ======================================================
# SESR-011: Conformance Classification Enums
# ======================================================

class ConformanceStatus(Enum):
    """Top-level conformance verdict for a single check."""
    CONFORMANT = "CONFORMANT"
    NON_CONFORMANT = "NON_CONFORMANT"
    SKIPPED = "SKIPPED"  # Precondition not met; check was safely skipped


class FindingCategory(Enum):
    """
    SESR-011 Chapter 3: Classification of non-conformance finding types.
    """
    MISSING_IMPLEMENTATION = "MISSING_IMPLEMENTATION"    # Required step was never executed
    INCORRECT_IMPLEMENTATION = "INCORRECT_IMPLEMENTATION"  # Step executed but produced wrong result
    # A downstream failure caused by an upstream defect
    CROSS_MODULE_FAILURE = "CROSS_MODULE_FAILURE"
    # Step ran but silently diverged from specification
    SILENT_DEVIATION = "SILENT_DEVIATION"
    DATA_INTEGRITY_VIOLATION = "DATA_INTEGRITY_VIOLATION"  # Required data field missing or corrupt
    CONTINUITY_VIOLATION = "CONTINUITY_VIOLATION"        # SESR-008 journey linkage broken


class CheckScope(Enum):
    """Which SESR specification does this check validate?"""
    SESR_001 = "SESR-001"  # Governed Evidence
    SESR_002 = "SESR-002"  # Governed Decision Context
    SESR_003 = "SESR-003"  # Governed Policy / Rule Evaluation
    SESR_004 = "SESR-004"  # Governed Recommendation
    SESR_005 = "SESR-005"  # Governed Human Decision & Authority
    SESR_006 = "SESR-006"  # Governed Operational Action & Execution
    SESR_007 = "SESR-007"  # Governed Operational Outcome & Closure
    SESR_008 = "SESR-008"  # Governed Operational Continuity
    SESR_009 = "SESR-009"  # Governed Failure Isolation & Degraded Operation
    SESR_010 = "SESR-010"  # Decision Reproducibility & Deterministic Reconstruction
    PIPELINE = "PIPELINE"  # End-to-end pipeline integrity


# ======================================================
# SESR-011: Conformance Data Records
# ======================================================

@dataclass
class ValidationFinding:
    """
    CVF-001: A single non-conformance finding.
    Captured when a conformance check determines that the system has
    deviated from the governed specification.
    """
    finding_id: str
    check_id: str
    scope: CheckScope
    category: FindingCategory
    description: str
    evidence_reference: Optional[str] = None   # ID of the record that caused the finding
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    detected_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class ValidationCheckResult:
    """
    CVR-001: The result of a single conformance check.
    Each check covers exactly one SESR requirement or sub-requirement.
    """
    check_id: str
    scope: CheckScope
    requirement_ref: str          # e.g. "SESR-001 §2.3 — Evidence Registration"
    status: ConformanceStatus
    findings: List[ValidationFinding] = field(default_factory=list)
    checked_at: datetime = field(default_factory=datetime.utcnow)
    duration_ms: float = 0.0
    notes: Optional[str] = None


@dataclass
class ConformanceReport:
    """
    CRP-001: The aggregated conformance report for one test run.
    Contains all check results and the overall verdict.
    """
    report_id: str
    scenario_name: str
    event_id: Optional[str]        # The synthetic event ID that was processed
    overall_status: ConformanceStatus
    check_results: List[ValidationCheckResult] = field(default_factory=list)
    generated_at: datetime = field(default_factory=datetime.utcnow)
    total_checks: int = 0
    passed_checks: int = 0
    failed_checks: int = 0
    skipped_checks: int = 0

    def summarize(self) -> str:
        sep = "=" * 57
        lines = [
            sep,
            "  SESR-011 CONFORMANCE REPORT",
            f"  Report ID  : {
                self.report_id}",
            f"  Scenario   : {
                self.scenario_name}",
            f"  Event ID   : {
                self.event_id or 'N/A'}",
            f"  Overall    : {
                self.overall_status.value}",
            f"  Checks     : {
                self.passed_checks} passed / {
                self.failed_checks} failed / {
                self.skipped_checks} skipped (total: {
                self.total_checks})",
            f"  Generated  : {
                self.generated_at.isoformat()}",
            sep,
        ]
        for result in self.check_results:
            if result.status == ConformanceStatus.CONFORMANT:
                icon = "PASS"
            elif result.status == ConformanceStatus.SKIPPED:
                icon = "SKIP"
            else:
                icon = "FAIL"
            lines.append(
                f"  [{icon}] [{result.scope.value}] {result.requirement_ref} -> {result.status.value}")
            for f in result.findings:
                lines.append(f"        |-> [{f.category.value}] {f.description}")
                if f.expected_value:
                    lines.append(f"          Expected : {f.expected_value}")
                if f.actual_value:
                    lines.append(f"          Actual   : {f.actual_value}")
        lines.append(sep)
        return "\n".join(lines)


# ======================================================
# SESR-011: ValidationRegistry
# ======================================================

class ValidationRegistry:
    """
    SESR-011 Conformance Registry.
    Stores all conformance check results and reports for a given test session.
    This is isolated from the GovernanceRegistry and the operational database.
    """

    def __init__(self):
        self._reports: List[ConformanceReport] = []
        self._check_results: List[ValidationCheckResult] = []
        self._findings: List[ValidationFinding] = []

    def record_report(self, report: ConformanceReport) -> None:
        self._reports.append(report)
        logger.info(
            f"[SESR-011] Report recorded: {report.report_id} | "
            f"overall={report.overall_status.value} | "
            f"{report.passed_checks}/{report.total_checks} checks passed"
        )

    def record_check_result(self, result: ValidationCheckResult) -> None:
        self._check_results.append(result)

    def record_finding(self, finding: ValidationFinding) -> None:
        self._findings.append(finding)

    def get_report(self, report_id: str) -> Optional[ConformanceReport]:
        return next((r for r in self._reports if r.report_id == report_id), None)

    def get_all_reports(self) -> List[ConformanceReport]:
        return list(self._reports)

    def get_findings_for_check(self, check_id: str) -> List[ValidationFinding]:
        return [f for f in self._findings if f.check_id == check_id]

    def get_non_conformant_reports(self) -> List[ConformanceReport]:
        return [r for r in self._reports if r.overall_status == ConformanceStatus.NON_CONFORMANT]

    def clear(self) -> None:
        """Resets the registry. Used between test runs to prevent state pollution."""
        self._reports.clear()
        self._check_results.clear()
        self._findings.clear()
        logger.debug("[SESR-011] ValidationRegistry cleared.")


# Singleton instance
validation_registry = ValidationRegistry()
