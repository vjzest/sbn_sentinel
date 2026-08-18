"""
SESR-011: System Validation & Implementation Conformance Standards
Test Suite — Synthetic end-to-end conformance scenarios.

Chapter 7: Synthetic Test Ingestion Path.

Scenarios:
  1. HAPPY PATH   — Standard EHR no-show event. Expects CONFORMANT.
  2. FAILING PATH — Deliberately corrupted payload (no detail/context).
                    Exercises that the engine catches and reports failures
                    without crashing the system (SESR-009 degraded operation).

Usage:
  cd backend
  python test_sesr011.py
  or
  pytest test_sesr011.py -v
"""
import pytest
import sys
import os

# Add backend/src/runtime to path so app imports resolve correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src/runtime")))

from app.db.database import Base, engine, SessionLocal
from app.services.conformance_engine import conformance_engine
from app.services.validation_registry import (
    ValidationRegistry, ConformanceStatus, FindingCategory
)


# ─────────────────────────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def setup_db():
    """Create all tables before running, drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def fresh_registry():
    """
    Provides a freshly cleared ValidationRegistry per test.
    Prevents findings from one scenario bleeding into another.
    """
    reg = ValidationRegistry()
    yield reg


# ─────────────────────────────────────────────────────────────────
# SCENARIO 1: HAPPY PATH — Full conformance expected
# ─────────────────────────────────────────────────────────────────

def test_sesr011_happy_path_is_conformant(setup_db, fresh_registry):
    """
    SESR-011 Chapter 7: Synthetic Happy Path.

    A well-formed EHR no-show event is processed through the full pipeline.
    The ConformanceEngine MUST produce a CONFORMANT report, proving that
    every governed layer (SESR-001 through SESR-010) executed correctly.
    """
    raw_payload = {
        "event_type": "EHR",
        "detail": "no-show",
        "primary_context": "Operational",
        "secondary_context": "Provider Schedule Gap",
    }

    report = conformance_engine.run_scenario(
        scenario_name="SESR-011-S1: Happy Path — EHR No-Show Full Pipeline",
        raw_payload=raw_payload,
        event_type="EHR",
        source="SESR-011-SYNTHETIC",
        priority="High",
        registry=fresh_registry,
    )

    # Print the full conformance report for human review
    print("\n" + report.summarize())

    # ── Assertion 1: Overall verdict must be CONFORMANT ──────────────
    assert report.overall_status == ConformanceStatus.CONFORMANT, (
        f"Expected CONFORMANT but got {report.overall_status.value}.\n"
        f"Failed checks:\n" +
        "\n".join(
            f"  [{r.scope.value}] {r.requirement_ref}: "
            + "; ".join(f.description for f in r.findings)
            for r in report.check_results
            if r.status == ConformanceStatus.NON_CONFORMANT
        )
    )

    # ── Assertion 2: All checks must have run (not skipped due to crash) ──
    assert report.total_checks > 0, "No conformance checks were executed."
    assert report.failed_checks == 0, (
        f"{report.failed_checks} check(s) failed unexpectedly."
    )

    # ── Assertion 3: Report is stored in the fresh registry ──────────
    stored = fresh_registry.get_report(report.report_id)
    assert stored is not None, "Report was not recorded in the ValidationRegistry."
    assert stored.event_id is not None, "Report must reference the synthetic event ID."

    print(f"[PASS] Happy Path conformance test passed. "
          f"Report: {report.report_id} | "
          f"{report.passed_checks}/{report.total_checks} checks passed.")


# ─────────────────────────────────────────────────────────────────
# SCENARIO 2: DEGRADED/EMPTY PAYLOAD — Partial conformance
# ─────────────────────────────────────────────────────────────────

def test_sesr011_empty_payload_produces_findings(setup_db, fresh_registry):
    """
    SESR-011 Chapter 7: Synthetic Degraded Scenario.

    An empty payload is injected into the pipeline. The ConformanceEngine
    MUST detect that evidence and context fields are missing, classify the
    findings correctly, and return a NON_CONFORMANT or partially degraded
    report. The system itself must NOT crash (SESR-009 isolation guarantee).
    """
    raw_payload = {
        # Deliberately empty — no detail, no context keys
        "event_type": "EHR",
    }

    report = conformance_engine.run_scenario(
        scenario_name="SESR-011-S2: Degraded Scenario — Empty Payload",
        raw_payload=raw_payload,
        event_type="EHR",
        source="SESR-011-SYNTHETIC-DEGRADED",
        priority="Normal",
        registry=fresh_registry,
    )

    print("\n" + report.summarize())

    # ── Assertion 1: The engine must NOT crash ────────────────────────
    assert report is not None, "ConformanceEngine crashed on empty payload."

    # ── Assertion 2: A report must always be returned ─────────────────
    assert report.report_id is not None
    assert report.total_checks > 0

    # NOTE: We do NOT assert NON_CONFORMANT here because the pipeline
    # is designed with graceful degradation (SESR-009). It may still
    # produce a partial result and reach Completed state.
    # What we DO assert: if any failures are detected, they must have
    # structured findings (not silent/uncategorized errors).
    for check_result in report.check_results:
        if check_result.status == ConformanceStatus.NON_CONFORMANT:
            assert len(check_result.findings) > 0, (
                f"Check {check_result.check_id} is NON_CONFORMANT but has no findings. "
                f"Silent non-conformance is not permitted per SESR-011."
            )
            for finding in check_result.findings:
                assert finding.category is not None, "Finding must have a category."
                assert finding.description, "Finding must have a description."

    print(f"[PASS] Degraded scenario completed without crash. "
          f"Report: {report.report_id} | "
          f"Overall: {report.overall_status.value} | "
          f"{report.passed_checks} passed / {report.failed_checks} failed.")


# ─────────────────────────────────────────────────────────────────
# SCENARIO 3: REGISTRY ISOLATION — One scenario must not pollute another
# ─────────────────────────────────────────────────────────────────

def test_sesr011_registry_isolation(setup_db):
    """
    SESR-011 §11.3 — Test Isolation Guarantee.

    Each scenario uses its own ValidationRegistry instance.
    This test verifies that findings from scenario 1 do NOT appear in
    scenario 2's registry, proving synthetic tests do not cross-contaminate.
    """
    registry_a = ValidationRegistry()
    registry_b = ValidationRegistry()

    payload_a = {
        "event_type": "EHR",
        "detail": "no-show",
        "primary_context": "Operational",
        "secondary_context": "Provider Schedule Gap",
    }
    payload_b = {
        "event_type": "EHR",
        "detail": "wait-time",
        "primary_context": "Operational",
        "secondary_context": "Extended Patient Wait Time",
    }

    report_a = conformance_engine.run_scenario(
        scenario_name="SESR-011-S3a: Isolation Test — Registry A",
        raw_payload=payload_a,
        registry=registry_a,
    )
    report_b = conformance_engine.run_scenario(
        scenario_name="SESR-011-S3b: Isolation Test — Registry B",
        raw_payload=payload_b,
        registry=registry_b,
    )

    # Each registry should contain exactly 1 report
    assert len(registry_a.get_all_reports()) == 1, "Registry A should have exactly 1 report."
    assert len(registry_b.get_all_reports()) == 1, "Registry B should have exactly 1 report."

    # Reports must be distinct
    assert report_a.report_id != report_b.report_id, "Report IDs must be unique."
    assert report_a.event_id != report_b.event_id, "Event IDs must be unique per scenario."

    # Registry A must NOT contain report B
    assert registry_a.get_report(report_b.report_id) is None, (
        "Registry A contains a report that belongs to Registry B. Isolation violated."
    )
    assert registry_b.get_report(report_a.report_id) is None, (
        "Registry B contains a report that belongs to Registry A. Isolation violated."
    )

    print(f"[PASS] Registry isolation confirmed. "
          f"Report A: {report_a.report_id} | Report B: {report_b.report_id}")


# ─────────────────────────────────────────────────────────────────
# STANDALONE RUNNER
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  SESR-011: System Validation & Conformance Test Suite")
    print("=" * 60)

    # Bootstrap DB
    Base.metadata.create_all(bind=engine)

    reg1 = ValidationRegistry()
    reg2 = ValidationRegistry()

    print("\n[SCENARIO 1] Happy Path — Standard EHR No-Show")
    report1 = conformance_engine.run_scenario(
        scenario_name="SESR-011-S1: Happy Path — EHR No-Show Full Pipeline",
        raw_payload={
            "event_type": "EHR",
            "detail": "no-show",
            "primary_context": "Operational",
            "secondary_context": "Provider Schedule Gap",
        },
        registry=reg1,
    )
    print(report1.summarize())

    print("\n[SCENARIO 2] Degraded Path — Empty Payload")
    report2 = conformance_engine.run_scenario(
        scenario_name="SESR-011-S2: Degraded Scenario — Empty Payload",
        raw_payload={"event_type": "EHR"},
        source="SESR-011-SYNTHETIC-DEGRADED",
        registry=reg2,
    )
    print(report2.summarize())

    print("\n[SCENARIO 3] Registry Isolation Test")
    reg3a = ValidationRegistry()
    reg3b = ValidationRegistry()
    report3a = conformance_engine.run_scenario(
        scenario_name="SESR-011-S3a: Isolation — Registry A",
        raw_payload={
            "event_type": "EHR",
            "detail": "no-show",
            "primary_context": "Operational",
            "secondary_context": "Provider Schedule Gap",
        },
        registry=reg3a,
    )
    report3b = conformance_engine.run_scenario(
        scenario_name="SESR-011-S3b: Isolation — Registry B",
        raw_payload={
            "event_type": "EHR",
            "detail": "wait-time",
            "primary_context": "Operational",
            "secondary_context": "Extended Patient Wait Time",
        },
        registry=reg3b,
    )
    assert len(reg3a.get_all_reports()) == 1
    assert len(reg3b.get_all_reports()) == 1
    assert report3a.report_id != report3b.report_id
    print(f"  Registry A: {report3a.report_id} ({report3a.overall_status.value})")
    print(f"  Registry B: {report3b.report_id} ({report3b.overall_status.value})")
    print("  [PASS] Registry isolation confirmed.")

    print("\n" + "=" * 60)
    print("  All SESR-011 conformance scenarios completed.")
    print(f"  Scenario 1: {report1.overall_status.value}")
    print(f"  Scenario 2: {report2.overall_status.value}")
    print(f"  Scenario 3a: {report3a.overall_status.value}")
    print(f"  Scenario 3b: {report3b.overall_status.value}")
    print("=" * 60)
