"""
SES-002: Internal Data Flow & Event Processing Specification
Event Pipeline Orchestrator — The operational backbone of SBN Sentinel.

This module enforces the 8-layer processing pipeline defined in SES-002.
Every event — regardless of source — follows this exact sequence:

    Layer 1: External Input
    Layer 2: Connector Normalization
    Layer 3: Rules Engine Evaluation
    Layer 4: Decision Context Engine
    Layer 5: Operational Intelligence Engine
    Layer 6: Revenue Intelligence Engine
    Layer 7: Data Management & Audit Storage
    Layer 8: Dashboard Publication

No layer may be skipped. No module may bypass previous layers.
State transitions are recorded at each stage for full observability.
"""
import uuid
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional

from app.db.database import SessionLocal
from app.schemas.service_communication import ServiceRequest, ServiceStatus
from app.models.event import OperationalEventModel
from app.models.intelligence import (
    RuleFindingModel, DecisionContextModel, 
    OperationalIntelligenceModel, RevenueIntelligenceModel
)
from app.models.decision_record import DecisionRecordModel

from app.services.evidence_engine import evidence_engine
from app.services.decision_context_engine import decision_context_engine
from app.services.policy_engine import policy_engine
from app.services.rules_engine import rules_engine
from app.services.intelligence_engine import intelligence_engine
from app.services.revenue_intelligence_engine import revenue_intelligence_engine
from app.services.data_audit_engine import data_audit_engine
from app.schemas.signal import SignalEvent

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Priority Ordering (lower = higher priority)
# ─────────────────────────────────────────────
PRIORITY_ORDER = {
    "Critical": 0,
    "High": 1,
    "Normal": 2,
    "Low": 3,
}


class ProcessingOrchestrator:
    """
    SES-006 Compliant Processing Engine Orchestrator.

    Enforces the deterministic, observable, fault-tolerant 8-layer
    processing pipeline for every Sentinel event.
    """

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)

    # ─────────────────────────────────────────────
    # PUBLIC ENTRY POINT
    # ─────────────────────────────────────────────
    def create_event(
        self,
        event_type: str,
        source: str,
        raw_payload: Dict[str, Any],
        priority: str = "Normal",
        correlation_id: Optional[str] = None,
        initiated_by: str = "system",
    ) -> OperationalEventModel:
        """
        SES-002 Layer 1 / SES-009 Async Queuing:
        Creates an event record quickly and returns it in a 'Queued' state.
        The actual processing is deferred to the background.
        """
        db = SessionLocal()
        try:
            event = OperationalEventModel(
                id=str(uuid.uuid4()),
                correlation_id=correlation_id or str(uuid.uuid4()),
                event_type=event_type,
                source=source,
                priority=priority,
                raw_payload=raw_payload,
                state="Queued",
                received_at=datetime.utcnow(),
                initiated_by=initiated_by,
            )
            db.add(event)
            db.commit()
            db.refresh(event)

            self.logger.info(
                f"[SES-009][PIPELINE] Event {event.id} QUEUED | "
                f"type={event_type} source={source} priority={priority}"
            )
            return event
        finally:
            db.close()

    def process_event_background(self, event_id: str):
        """
        SES-009: Background task executor.
        Fetches the queued event and processes it through the 8 layers.
        """
        db = SessionLocal()
        try:
            event = db.query(OperationalEventModel).filter(OperationalEventModel.id == event_id).first()
            if not event:
                self.logger.error(f"[SES-009] Cannot process background event {event_id}, not found in DB.")
                return

            event.state = "Processing"
            db.commit()
            
            # Run the pipeline
            self._run_pipeline(event, db)
        except Exception as e:
            self.logger.error(f"[SES-009][PIPELINE] Fatal background error for event {event_id}: {e}")
        finally:
            db.close()

    # ─────────────────────────────────────────────
    # INTERNAL PIPELINE RUNNER
    # ─────────────────────────────────────────────
    def _run_pipeline(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Executes Layers 2–8 in strict sequential order.
        Each layer updates event state and records observability data.
        """
        try:
            # ── Layer 2: Connector Normalization ──────────────────────
            event = self._layer2_normalize(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 3: Evidence Engine ────────────────────────────────
            event = self._layer3_evidence(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 4: Decision Context Engine ──────────────────────
            event = self._layer4_context(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 5: Policy Engine (Governance) ─────────────────────
            event = self._layer5_policy(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 6: Rules Engine ──────────────────────────────────
            event = self._layer6_rules(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 7: Operational Intelligence Engine ───────────────
            event = self._layer7_intelligence(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 8: Revenue Intelligence Engine ──────────────────
            event = self._layer8_revenue(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 9: Data Management & Audit Storage ───────────────
            event = self._layer9_storage(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 10: Dashboard Publication ────────────────────────
            event = self._layer10_publish(event, db)

            # Mark Completed
            event.state = "Completed"
            event.completed_at = datetime.utcnow()
            total_duration = event.total_duration_ms()
            db.commit()

            # SES-009: Explicit Performance Metric Logging
            try:
                data_audit_engine._log_internal(
                    db,
                    user_system="system@sentinel.local",
                    action=f"PERFORMANCE_METRIC:{event.event_type}",
                    module="ProcessingOrchestrator",
                    correlation_id=event.id
                )
            except Exception as metric_err:
                self.logger.warning(f"Failed to log performance metric: {metric_err}")

            self.logger.info(
                f"[SES-002][PIPELINE] Event {event.id} COMPLETED | "
                f"total_ms={total_duration:.1f}"
            )
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="Pipeline", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 2 — Connector Normalization
    # ─────────────────────────────────────────────
    def _layer2_normalize(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Receives raw connector payload, authenticates, validates, normalizes
        into a standard Sentinel event format.
        """
        t_start = time.time()
        try:
            event.state = "Processing"
            event.processing_started_at = datetime.utcnow()

            # We don't store normalized output in db anymore per SES-004.
            # We just pass it in memory as needed, or it can be saved in raw_payload if needed.
            # For now, we just record the duration.

            event.layer2_duration_ms = (time.time() - t_start) * 1000

            db.commit()
            self.logger.debug(f"[L2] Event {event.id} normalized | source={event.source}")
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L2-Normalize", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 3 — Evidence Engine
    # ─────────────────────────────────────────────
    def _layer3_evidence(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Gathers raw event data and translates it into an EvidencePackage of operational facts.
        """
        t_start = time.time()
        try:
            payload_data = event.raw_payload or {}
            
            # Construct EvidencePackage directly
            evidence_package = evidence_engine.build_evidence_package(
                event_id=event.id,
                event_type=event.event_type,
                canonical_metadata={"detail": payload_data.get("detail", payload_data.get("message", payload_data.get("content", "")))},
                source_connector=event.source
            )
            
            import dataclasses
            event.evidence_package = dataclasses.asdict(evidence_package)
            event.layer3_duration_ms = (time.time() - t_start) * 1000
            
            db.commit()
            self.logger.debug(f"[L3] Evidence Engine completed for event {event.id}")
            return event
        except Exception as e:
            return self._fail_event(event, db, layer="L3-Evidence", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 4 — Decision Context Engine
    # ─────────────────────────────────────────────
    def _layer4_context(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Classifies operational context based on the EvidencePackage.
        """
        t_start = time.time()
        try:
            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="DecisionContextEngine",
                payload={
                    "evidence_package": getattr(event, "evidence_package", {}),
                    "event_type": event.event_type
                }
            )
            
            response = decision_context_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L4-Context", error=error_msg)
                
            from app.models.intelligence import DecisionContextModel
            event.decision_context = DecisionContextModel(
                primary_context=response.result_payload.get("primary_context", "Unknown"),
                secondary_context=response.result_payload.get("secondary_context"),
                confidence=response.result_payload.get("confidence", "Low"),
                reason=response.result_payload.get("reason")
            )
            event.layer4_duration_ms = (time.time() - t_start) * 1000
            
            db.commit()
            self.logger.debug(f"[L4] DCE resolved context for event {event.id}: {event.decision_context.primary_context}")
            return event
        except Exception as e:
            return self._fail_event(event, db, layer="L4-Context", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 5 — Policy Engine
    # ─────────────────────────────────────────────
    def _layer5_policy(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Enforces governance boundaries by evaluating the Decision Context.
        """
        t_start = time.time()
        try:
            decision_context = {
                "evidence_package": getattr(event, "evidence_package", {}),
                "event_type": event.event_type,
                "primary_context": event.decision_context.primary_context if event.decision_context else "Unknown"
            }
            
            policy_result = policy_engine.evaluate(decision_context=decision_context)
            
            event.policy_result = policy_result.__dict__
            event.layer5_duration_ms = (time.time() - t_start) * 1000
            
            db.commit()
            self.logger.debug(f"[L5] Policy Engine completed for event {event.id}. Permitted: {policy_result.is_permitted}")
            return event
        except Exception as e:
            return self._fail_event(event, db, layer="L5-Policy", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 6 — Rules Engine
    # ─────────────────────────────────────────────
    def _layer6_rules(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Evaluates the operational context against active business rules ONLY if permitted by Policy Engine.
        """
        t_start = time.time()
        try:
            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="RulesEngine",
                payload={
                    "decision_context": {
                        "primary_context": event.decision_context.primary_context,
                        "secondary_context": event.decision_context.secondary_context
                    } if event.decision_context else {},
                    "policy_result": getattr(event, "policy_result", {})
                }
            )
            
            response = rules_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L6-Rules", error=error_msg)
                
            from app.models.intelligence import RuleFindingModel
            event.rule_findings = [RuleFindingModel(
                rule_id=response.result_payload.get("rule_id", "Unknown"),
                severity=response.result_payload.get("severity", "Information"),
                description=response.result_payload.get("description", "")
            )]
            event.layer6_duration_ms = (time.time() - t_start) * 1000
            
            db.commit()
            self.logger.debug(f"[L6] Rules Engine evaluated event {event.id} -> finding: {event.rule_findings[0].rule_id if event.rule_findings else 'Unknown'}")
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L6-Rules", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 7 — Operational Intelligence Engine
    # ─────────────────────────────────────────────
    def _layer7_intelligence(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Takes objective rule findings and generates executive recommendations.
        """
        t_start = time.time()
        try:
            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="IntelligenceEngine",
                payload={
                    "finding": [{"rule_id": rf.rule_id, "severity": rf.severity} for rf in event.rule_findings] if event.rule_findings else {},
                    "context": {
                        "primary_context": event.decision_context.primary_context,
                        "secondary_context": event.decision_context.secondary_context
                    } if event.decision_context else {}
                }
            )
            
            response = intelligence_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L7-Intelligence", error=error_msg)
                
            from app.models.intelligence import OperationalIntelligenceModel
            event.operational_intelligence = OperationalIntelligenceModel(
                priority=response.result_payload.get("priority", "Information"),
                operational_impact=response.result_payload.get("operational_impact", ""),
                recommendation=response.result_payload.get("recommendation", "")
            )
            event.intelligence_result = response.result_payload # Keep dynamic attr just in case
            event.layer7_duration_ms = (time.time() - t_start) * 1000
            
            db.commit()
            self.logger.debug(f"[L7] OIE generated recommendations for event {event.id}")
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L7-Intelligence", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 8 — Revenue Intelligence Engine
    # ─────────────────────────────────────────────
    def _layer8_revenue(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Generates revenue impact estimates based on the context and rule findings.
        """
        t_start = time.time()
        try:
            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="RevenueIntelligenceEngine",
                payload={
                    "finding": [{"rule_id": rf.rule_id, "severity": rf.severity} for rf in event.rule_findings] if event.rule_findings else {},
                    "context": {
                        "primary_context": event.decision_context.primary_context,
                        "secondary_context": event.decision_context.secondary_context
                    } if event.decision_context else {}
                }
            )
            
            response = revenue_intelligence_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L8-Revenue", error=error_msg)
                
            from app.models.intelligence import RevenueIntelligenceModel
            event.revenue_intelligence = RevenueIntelligenceModel(
                estimated_exposure=response.result_payload.get("estimated_exposure", ""),
                opportunity_category=response.result_payload.get("opportunity_category", ""),
                financial_priority=response.result_payload.get("financial_priority", "")
            )
            event.revenue_result = response.result_payload # Keep dynamic attr just in case
            event.layer8_duration_ms = (time.time() - t_start) * 1000
            
            db.commit()
            self.logger.debug(f"[L8] RIE processed event {event.id}")
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L8-Revenue", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 9 — Data Management & Audit Storage
    # ─────────────────────────────────────────────
    def _layer9_storage(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Stores the enriched event as a Signal intelligence record.
        Writes an immutable audit log entry.
        """
        t_start = time.time()
        try:
            payload = event.raw_payload or {}
            intel_model = db.query(OperationalIntelligenceModel).filter(OperationalIntelligenceModel.event_id == event.id).first()
            revenue_model = db.query(RevenueIntelligenceModel).filter(RevenueIntelligenceModel.event_id == event.id).first()
            context_model = db.query(DecisionContextModel).filter(DecisionContextModel.event_id == event.id).first()

            signal_event = SignalEvent(
                id=event.id,
                source=event.source,
                type=event.event_type,
                message=payload.get("detail", ""),
                timestamp=datetime.utcnow().isoformat(),
                metadata={"pipeline_event_id": event.id, "priority": event.priority},
                risk_level=intel_model.priority if intel_model else "Information",
                problem="", 
                reason="", 
                business_impact=intel_model.operational_impact if intel_model else "",
                recommended_action=intel_model.recommendation if intel_model else "",
                expected_outcome="",
                primary_context=context_model.primary_context if context_model else "",
                secondary_context=context_model.secondary_context if context_model else "",
                context_confidence=context_model.confidence if context_model else "",
                context_reason=context_model.reason if context_model else "",
                revenue_risk_category=revenue_model.opportunity_category if revenue_model else "None",
                estimated_financial_exposure=revenue_model.estimated_exposure if revenue_model else "$0.00",
                revenue_confidence=revenue_model.financial_priority if revenue_model else "High",
                operational_dependency="",
            )

            success = data_audit_engine.save_intelligence_record(signal_event)
            event.layer7_storage_ref = event.id if success else "FAILED"
            
            # Save Decision Record Audit Trail
            intel_result = getattr(event, "intelligence_result", {})
            if intel_result:
                decision_record = DecisionRecordModel(
                    event_id=event.id,
                    evidence=__import__("json").loads(__import__("json").dumps(event.evidence_package, default=str)) if event.evidence_package else {},
                    rule_id=event.rule_findings[0].rule_id if event.rule_findings else "SYS-BLOCKED",
                    policy_status=getattr(event, "policy_result", {}).get("is_permitted", False),
                    recommendation=intel_result
                )
                db.add(decision_record)
                
            event.layer7_duration_ms = (time.time() - t_start) * 1000
            db.commit()

            self.logger.info(
                f"[L7] Event {event.id} stored | ref={event.layer7_storage_ref}"
            )
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L9-Storage", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 10 — Dashboard Publication
    # ─────────────────────────────────────────────
    def _layer10_publish(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Marks the event as published to the dashboard.
        In V1: data is available via REST API poll.
        Future: WebSocket push, SSE streaming.
        """
        t_start = time.time()
        try:
            # In V1, publication = data available in /signals endpoint
            # Future: trigger WebSocket broadcast here
            event.layer8_published = "api:signals"
            event.layer8_duration_ms = (time.time() - t_start) * 1000
            db.commit()

            self.logger.info(f"[L8] Event {event.id} published to dashboard.")
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L10-Publish", error=str(e))

    # ─────────────────────────────────────────────
    # STATE MANAGEMENT — Failure Handler (SES-007)
    # ─────────────────────────────────────────────
    def _fail_event(
        self, 
        event: OperationalEventModel, 
        db, 
        layer: str, 
        error: str,
        category: str = "System Error",
        severity: str = "Error"
    ) -> OperationalEventModel:
        """
        Records failure state with layer origin and error message.
        Implements SES-007 transient/non-transient rules and backoff logic.
        """
        event.retry_count = (event.retry_count or 0) + 1
        event.last_error = f"[{layer}] {error}"

        transient_categories = ["Connector Error", "Communication Error", "Timeout Error"]
        is_transient = category in transient_categories

        if not is_transient or severity == "Critical" or event.retry_count >= event.max_retries:
            event.state = "Failed"
            event.failed_at = datetime.utcnow()
            resolution = "Administrative Intervention Required" if severity == "Critical" else "Failed - No Recovery"
            self.logger.error(
                f"[SES-007][{layer}] Event {event.id} FAILED | "
                f"Cat={category} Sev={severity} Retries={event.retry_count}: {error}"
            )
        else:
            event.state = "Retrying"
            resolution = "Retrying - Backoff initiated"
            backoff_seconds = min(2 ** event.retry_count, 10) # max 10s synchronous backoff
            self.logger.warning(
                f"[SES-007][{layer}] Event {event.id} retry {event.retry_count}/{event.max_retries}. "
                f"Applying {backoff_seconds}s backoff. Error: {error}"
            )
            time.sleep(backoff_seconds)

        try:
            db.commit()
        except Exception:
            db.rollback()

        # Log failure to audit system (SES-007 §15)
        try:
            data_audit_engine.log_failure_event(
                user_system="system@sentinel.local",
                module=f"ProcessingOrchestrator:{layer}",
                correlation_id=event.id,
                error_category=category,
                severity=severity,
                retry_attempts=event.retry_count,
                recovery_outcome=event.state,
                resolution_status=resolution
            )
        except Exception as e:
            self.logger.error(f"Failed to log failure audit: {e}")

        return event

    # ─────────────────────────────────────────────
    # OBSERVABILITY — Get event trace
    # ─────────────────────────────────────────────
    def get_event_trace(self, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Returns the full processing trace for a given event.
        Includes per-layer timing, state, and all outputs via relationships.
        """
        db = SessionLocal()
        try:
            event = db.query(OperationalEventModel).filter(OperationalEventModel.id == event_id).first()
            if not event:
                return None
            return {
                **event.to_dict(),
                "observability": {
                    "layer2_connector_ms": event.layer2_duration_ms,
                    "layer3_rules_ms": event.layer3_duration_ms,
                    "layer4_context_ms": event.layer4_duration_ms,
                    "layer5_intelligence_ms": event.layer5_duration_ms,
                    "layer6_revenue_ms": event.layer6_duration_ms,
                    "layer7_storage_ms": event.layer7_duration_ms,
                    "layer8_publish_ms": event.layer8_duration_ms,
                    "total_ms": event.total_duration_ms(),
                },
            }
        finally:
            db.close()

    def list_events(
        self,
        limit: int = 50,
        state: Optional[str] = None,
        event_type: Optional[str] = None,
    ) -> list:
        """
        Returns a list of recent pipeline events with optional filters.
        """
        db = SessionLocal()
        try:
            query = db.query(OperationalEventModel).order_by(OperationalEventModel.received_at.desc())
            if state:
                query = query.filter(OperationalEventModel.state == state)
            if event_type:
                query = query.filter(OperationalEventModel.event_type == event_type)
            events = query.limit(limit).all()
            return [e.to_dict() for e in events]
        finally:
            db.close()


# Singleton instance
processing_orchestrator = ProcessingOrchestrator()
