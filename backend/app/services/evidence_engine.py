"""
ARR-001 B-006: Evidence Engine — Independent Architectural Component

The Evidence Engine is the MANDATORY first step in Sentinel's processing pipeline.
It transforms Canonical Entities into governed Operational Evidence objects.

Responsibility: "What operational facts are currently available?"
It does NOT evaluate rules. It does NOT generate recommendations.

Pipeline Position:
    Canonical Model -> Evidence Engine -> Operational Evidence -> Decision Context Engine
"""
import logging
from datetime import datetime
from typing import Dict, Any, List
from dataclasses import dataclass, field
import uuid

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# OPERATIONAL EVIDENCE — The governed fact unit Sentinel Core works with
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class OperationalEvidence:
    """
    A single, governed operational fact extracted from a canonical entity.

    ARR-001 B-006 Rule 4: Evidence preserves its origin.
    ARR-001 B-006 Rule 5: Evidence is reusable across multiple recommendations.
    ARR-001 B-006 Rule 6: Evidence remains independent of business rules.
    """
    evidence_id: str
    evidence_type: str               # e.g. "AppointmentStatus", "InsuranceStatus"
    canonical_entity: str            # e.g. "Appointment", "Patient", "Insurance"
    fact_key: str                    # e.g. "status"
    fact_value: Any                  # e.g. "NO_SHOW", "INACTIVE", True
    source_connector: str            # e.g. "EHR", "Manual"
    retrieval_timestamp: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)


# ─────────────────────────────────────────────────────────────────────────────
# EVIDENCE PACKAGE — All evidence for one operational event
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class EvidencePackage:
    """
    A complete collection of Operational Evidence for a single event.
    This is what the Decision Context Engine receives — never raw business entities.
    """
    package_id: str
    event_id: str
    event_type: str                        # Canonical Sentinel concept (e.g. "EHR", "Phone")
    evidence_items: List[OperationalEvidence] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)

    def get_evidence_by_type(self, evidence_type: str) -> List[OperationalEvidence]:
        """Retrieve all evidence items of a specific type. Supports reuse."""
        return [e for e in self.evidence_items if e.evidence_type == evidence_type]

    def has_evidence(self, evidence_type: str) -> bool:
        """Check if specific evidence exists in this package."""
        return any(e.evidence_type == evidence_type for e in self.evidence_items)


# ─────────────────────────────────────────────────────────────────────────────
# EVIDENCE ENGINE — The standalone builder
# ─────────────────────────────────────────────────────────────────────────────
class EvidenceEngine:
    """
    ARR-001 B-006 Compliant Evidence Engine.

    Takes canonical event metadata and constructs an EvidencePackage.
    Downstream services (DCE, Policy, Rule, Recommendation) consume
    the EvidencePackage — never raw canonical entities.

    This engine:
    - Does NOT evaluate business rules.
    - Does NOT generate recommendations.
    - Does NOT call external connectors.
    - ONLY answers: "What operational facts are currently available?"
    """

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)

    def build_evidence_package(
        self,
        event_id: str,
        event_type: str,
        canonical_metadata: Dict[str, Any],
        source_connector: str = "Unknown"
    ) -> EvidencePackage:
        """
        Constructs a complete EvidencePackage from a canonical event payload.

        ARR-001 B-006 Rule 3: Evidence is standardized before entering the Decision Context.
        ARR-001 B-006 Rule 5: Evidence is constructed ONCE and reused downstream.
        """
        package_id = str(uuid.uuid4())
        evidence_items: List[OperationalEvidence] = []
        now = datetime.utcnow()

        detail = canonical_metadata.get("detail", "").lower()

        # ── EHR Event Evidence ────────────────────────────────────────────
        if event_type == "EHR":
            # Appointment Status Evidence
            if "no-show" in detail:
                evidence_items.append(OperationalEvidence(
                    evidence_id=str(uuid.uuid4()),
                    evidence_type="AppointmentStatus",
                    canonical_entity="Appointment",
                    fact_key="status",
                    fact_value="NO_SHOW",
                    source_connector=source_connector,
                    retrieval_timestamp=now,
                    metadata={"raw_detail": canonical_metadata.get("detail", "")}
                ))
            elif "wait time" in detail:
                evidence_items.append(OperationalEvidence(
                    evidence_id=str(uuid.uuid4()),
                    evidence_type="AppointmentStatus",
                    canonical_entity="Appointment",
                    fact_key="status",
                    fact_value="WAIT_TIME_EXCEEDED",
                    source_connector=source_connector,
                    retrieval_timestamp=now,
                    metadata={"threshold_minutes": 45}
                ))
            elif "booked" in detail or "appointment" in detail:
                evidence_items.append(OperationalEvidence(
                    evidence_id=str(uuid.uuid4()),
                    evidence_type="AppointmentStatus",
                    canonical_entity="Appointment",
                    fact_key="status",
                    fact_value="BOOKED",
                    source_connector=source_connector,
                    retrieval_timestamp=now,
                    metadata={"is_walk_in": "walk-in" in detail or "same-day" in detail}
                ))

        # ── Phone Event Evidence ──────────────────────────────────────────
        elif event_type == "Phone":
            if "missed call" in detail:
                evidence_items.append(OperationalEvidence(
                    evidence_id=str(uuid.uuid4()),
                    evidence_type="CommunicationStatus",
                    canonical_entity="PhoneInteraction",
                    fact_key="status",
                    fact_value="MISSED_CALL",
                    source_connector=source_connector,
                    retrieval_timestamp=now,
                    metadata={}
                ))

        # ── Email / Lab Event Evidence ────────────────────────────────────
        elif event_type == "Email":
            if "lab" in detail:
                evidence_items.append(OperationalEvidence(
                    evidence_id=str(uuid.uuid4()),
                    evidence_type="DocumentStatus",
                    canonical_entity="LabReport",
                    fact_key="status",
                    fact_value="PENDING_REVIEW",
                    source_connector=source_connector,
                    retrieval_timestamp=now,
                    metadata={}
                ))

        # Always add a source provenance evidence item
        evidence_items.append(OperationalEvidence(
            evidence_id=str(uuid.uuid4()),
            evidence_type="EventProvenance",
            canonical_entity="OperationalEvent",
            fact_key="source",
            fact_value=source_connector,
            source_connector=source_connector,
            retrieval_timestamp=now,
            metadata={"event_type": event_type}
        ))

        package = EvidencePackage(
            package_id=package_id,
            event_id=event_id,
            event_type=event_type,
            evidence_items=evidence_items,
            created_at=now
        )

        self.logger.info(
            f"[EvidenceEngine] Built EvidencePackage {package_id} for event {event_id} "
            f"with {len(evidence_items)} evidence items."
        )
        return package

evidence_engine = EvidenceEngine()
