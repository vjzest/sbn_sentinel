"""
SESR-001: Evidence Engine — Core Architecture Governance
Mandatory Implementation Standards for the Evidence Engine.

Runtime Sequence:
External Evidence -> ERP -> ERRM -> EVP -> Classification -> EOS-003 -> Decision Context Engine
"""
import logging
import hashlib
import pickle
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
from app.services.base_service import BaseService
import uuid

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# EOS-001: EVIDENCE OBJECT
# ─────────────────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class OperationalEvidence:
    """
    EOS-001: Evidence Object
    Immutable representation of an operational fact.
    """
    evidence_id: str
    canonical_entity: str
    fact_key: str
    fact_value: Any
    source_connector: str
    retrieval_timestamp: datetime
    evidence_type: Optional[str] = None # Assigned during Classification
    metadata: Dict[str, Any] = field(default_factory=dict)
    version: int = 1
    previous_version_id: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# EOS-002: EVIDENCE REPOSITORY (ERRM)
# ─────────────────────────────────────────────────────────────────────────────
class EvidenceRepository:
    """
    EOS-002: Single source of truth for Evidence Objects.
    Manages storage and versioning.
    """
    def __init__(self):
        self._storage_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'evidence_repo.pkl')
        self._storage: Dict[str, OperationalEvidence] = self._load()

    def _load(self) -> Dict[str, OperationalEvidence]:
        if os.path.exists(self._storage_file):
            try:
                with open(self._storage_file, 'rb') as f:
                    return pickle.load(f)
            except Exception as e:
                logger.error(f"[ERRM] Failed to load evidence repository: {e}")
        return {}

    def _save(self):
        os.makedirs(os.path.dirname(self._storage_file), exist_ok=True)
        try:
            with open(self._storage_file, 'wb') as f:
                pickle.dump(self._storage, f)
        except Exception as e:
            logger.error(f"[ERRM] Failed to save evidence repository: {e}")

    def store(self, evidence: OperationalEvidence):
        self._storage[evidence.evidence_id] = evidence
        self._save()
        logger.debug(f"[ERRM] Stored evidence {evidence.evidence_id}")

    def retrieve(self, evidence_id: str) -> Optional[OperationalEvidence]:
        return self._storage.get(evidence_id)


evidence_repository = EvidenceRepository()


# ─────────────────────────────────────────────────────────────────────────────
# EOS-003: EVIDENCE STATUS PACKAGE
# ─────────────────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class EvidenceStatusPackage:
    """
    EOS-003: Evidence Status Package
    The ONLY output of the Evidence Engine. Sent to DCE.
    """
    package_id: str
    event_id: str
    evidence_references: List[str] # List of evidence_ids
    validation_results: Dict[str, bool]
    classification_results: Dict[str, str]
    processing_status: str
    created_at: datetime = field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────────────────────────────────────
# EVIDENCE ENGINE RUNTIME
# ─────────────────────────────────────────────────────────────────────────────
class EvidenceEngine(BaseService):
    """
    SESR-001 Compliant Evidence Engine.
    Executes the strict runtime: ERP -> ERRM -> EVP -> Classification -> EOS-003.
    """
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.repository = evidence_repository

    @property
    def service_name(self) -> str:
        return "EvidenceEngine"
        
    @property
    def version(self) -> str:
        return "v1.0"

    def _process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Entry point from processing_orchestrator.
        """
        canonical_event_data = payload.get("canonical_event", {})
        
        # ERP: Evidence Registration Pipeline
        raw_evidence_list = self._erp_registration(canonical_event_data)
        
        # ERRM: Evidence Repository Runtime Management
        for ev in raw_evidence_list:
            self.repository.store(ev)

        # EVP: Evidence Validation Pipeline
        validation_results = self._evp_validation(raw_evidence_list)

        # Classification (ETR)
        classified_evidence_list = self._classify_evidence(raw_evidence_list)

        # Update Repository with classified versions (Versioning Strategy)
        final_references = []
        classification_results = {}
        for ev in classified_evidence_list:
            self.repository.store(ev)
            final_references.append(ev.evidence_id)
            classification_results[ev.evidence_id] = ev.evidence_type

        # Generate EOS-003
        eos_003 = EvidenceStatusPackage(
            package_id=str(uuid.uuid4()),
            event_id=canonical_event_data.get("event_id", "UNKNOWN"),
            evidence_references=final_references,
            validation_results=validation_results,
            classification_results=classification_results,
            processing_status="Success"
        )
        
        self.logger.info(f"[EvidenceEngine] Generated EOS-003 Package: {eos_003.package_id}")
        
        # We return this dictionary mapping for the downstream orchestrator
        # The orchestrator will pass this to DCE
        return {"eos_003_package": eos_003}

    # --- Runtime Pipelines ---

    def _erp_registration(self, canonical_data: dict) -> List[OperationalEvidence]:
        """Creates initial EOS-001 objects."""
        evidence_items = []
        now = datetime.utcnow()
        source = canonical_data.get("source_system", "Unknown")
        metadata = canonical_data.get("canonical_metadata", {})
        detail = metadata.get("detail", "").lower()
        event_type = canonical_data.get("event_type", "Unknown")

        if event_type == "EHR":
            if "no-show" in detail:
                evidence_items.append(self._create_eos_001("Appointment", "status", "NO_SHOW", source, now))
            elif "wait time" in detail:
                evidence_items.append(self._create_eos_001("Appointment", "status", "WAIT_TIME_EXCEEDED", source, now))
            elif "booked" in detail or "appointment" in detail:
                evidence_items.append(self._create_eos_001("Appointment", "status", "BOOKED", source, now))
        
        elif event_type == "Phone":
            if "missed call" in detail:
                evidence_items.append(self._create_eos_001("PhoneInteraction", "status", "MISSED_CALL", source, now))
        
        elif event_type == "Email":
            if "lab" in detail:
                evidence_items.append(self._create_eos_001("LabReport", "status", "PENDING_REVIEW", source, now))

        # Provenance
        evidence_items.append(self._create_eos_001("OperationalEvent", "source", source, source, now))
        
        return evidence_items

    def _create_eos_001(self, entity: str, key: str, value: Any, source: str, ts: datetime) -> OperationalEvidence:
        return OperationalEvidence(
            evidence_id=str(uuid.uuid4()),
            canonical_entity=entity,
            fact_key=key,
            fact_value=value,
            source_connector=source,
            retrieval_timestamp=ts
        )

    def _evp_validation(self, evidence_list: List[OperationalEvidence]) -> Dict[str, bool]:
        """Validates structural completeness."""
        results = {}
        for ev in evidence_list:
            is_valid = bool(ev.canonical_entity and ev.fact_key and ev.source_connector)
            results[ev.evidence_id] = is_valid
            if not is_valid:
                self.logger.warning(f"[EVP] Validation failed for {ev.evidence_id}")
        return results

    def _classify_evidence(self, evidence_list: List[OperationalEvidence]) -> List[OperationalEvidence]:
        """Assigns EvidenceType from ETR and creates new versions."""
        classified = []
        for ev in evidence_list:
            ev_type = "OperationalEvent"
            if ev.canonical_entity == "Appointment":
                ev_type = "AppointmentStatus"
            elif ev.canonical_entity == "PhoneInteraction":
                ev_type = "CommunicationStatus"
            elif ev.canonical_entity == "LabReport":
                ev_type = "DocumentStatus"
            elif ev.canonical_entity == "OperationalEvent":
                ev_type = "EventProvenance"
                
            # Create new version (Immutability pattern)
            new_ev = OperationalEvidence(
                evidence_id=str(uuid.uuid4()),
                canonical_entity=ev.canonical_entity,
                fact_key=ev.fact_key,
                fact_value=ev.fact_value,
                source_connector=ev.source_connector,
                retrieval_timestamp=ev.retrieval_timestamp,
                evidence_type=ev_type,
                metadata=ev.metadata,
                version=ev.version + 1,
                previous_version_id=ev.evidence_id
            )
            classified.append(new_ev)
            
        return classified

evidence_engine = EvidenceEngine()
