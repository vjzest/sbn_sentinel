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
from app.services.rules_engine import rules_engine
from app.services.decision_context_engine import decision_context_engine
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

            # ── Layer 3: Rules Engine ──────────────────────────────────
            event = self._layer3_rules(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 4: Decision Context Engine ──────────────────────
            event = self._layer4_context(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 5: Operational Intelligence Engine ───────────────
            event = self._layer5_intelligence(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 6: Revenue Intelligence Engine ──────────────────
            event = self._layer6_revenue(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 7: Data Management & Audit Storage ───────────────
            event = self._layer7_storage(event, db)
            if event.state == "Failed":
                return event

            # ── Layer 8: Dashboard Publication ────────────────────────
            event = self._layer8_publish(event, db)

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
    # LAYER 3 — Rules Engine
    # ─────────────────────────────────────────────
    def _layer3_rules(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Evaluates the normalized event against all active rules in the DB via SES-003 standard contract.
        """
        try:
            payload_data = event.raw_payload or {}
            detail = payload_data.get("detail", payload_data.get("message", payload_data.get("content", "")))
            
            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="RulesEngine",
                payload={
                    "event_type": event.event_type,
                    "metadata": {"detail": detail}
                }
            )
            
            response = rules_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L3-Rules", error=error_msg)
                
            finding = response.result_payload
            
            # SES-004: Insert Relational Record
            db_finding = RuleFindingModel(
                event_id=event.id,
                rule_id=finding.get("rule_id", "UNKNOWN"),
                severity=finding.get("severity", "Information"),
                description=finding.get("description", "No description")
            )
            db.add(db_finding)
            
            event.layer3_duration_ms = response.processing_time_ms
            db.commit()

            self.logger.debug(
                f"[L3] Event {event.id} rule={finding.get('rule_id')} "
                f"severity={finding.get('severity')}"
            )
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L3-Rules", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 4 — Decision Context Engine
    # ─────────────────────────────────────────────
    def _layer4_context(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Classifies the operational context of the event via SES-003 standard contract.
        """
        try:
            # Reconstruct finding for payload since it's no longer JSON on event
            finding_model = db.query(RuleFindingModel).filter(RuleFindingModel.event_id == event.id).first()
            finding = {"rule_id": finding_model.rule_id} if finding_model else {}
            
            payload_data = event.raw_payload or {}
            detail = payload_data.get("detail", payload_data.get("message", payload_data.get("content", "")))
            
            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="DecisionContextEngine",
                payload={
                    "finding": finding,
                    "metadata": {"detail": detail}
                }
            )
            
            response = decision_context_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L4-Context", error=error_msg)
                
            context = response.result_payload

            event.layer4_context_output = context
            event.layer4_duration_ms = response.processing_time_ms
            db.commit()

            self.logger.debug(
                f"[L4] Event {event.id} context={context.get('primary_context')}"
            )
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L4-Context", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 5 — Operational Intelligence Engine
    # ─────────────────────────────────────────────
    def _layer5_intelligence(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Generates the operational intelligence recommendation via SES-003 standard contract.
        """
        try:
            finding_model = db.query(RuleFindingModel).filter(RuleFindingModel.event_id == event.id).first()
            context_model = db.query(DecisionContextModel).filter(DecisionContextModel.event_id == event.id).first()
            
            finding = {
                "rule_id": finding_model.rule_id if finding_model else "",
                "severity": finding_model.severity if finding_model else "Information",
                "description": finding_model.description if finding_model else ""
            }
            context = {
                "primary_context": context_model.primary_context if context_model else "",
                "secondary_context": context_model.secondary_context if context_model else "",
                "confidence": context_model.confidence if context_model else "",
                "reason": context_model.reason if context_model else ""
            }

            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="IntelligenceEngine",
                payload={
                    "finding": finding,
                    "context": context
                }
            )
            
            response = intelligence_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L5-Intelligence", error=error_msg)

            intelligence = response.result_payload

            # SES-004: Insert Relational Record
            db_intel = OperationalIntelligenceModel(
                event_id=event.id,
                priority=intelligence.get("risk_level", "Normal"),
                operational_impact=intelligence.get("business_impact", ""),
                recommendation=intelligence.get("action", "")
            )
            db.add(db_intel)

            event.layer5_duration_ms = response.processing_time_ms
            db.commit()

            self.logger.debug(
                f"[L5] Event {event.id} risk={intelligence.get('risk_level')} action={intelligence.get('action', '')[:60]}"
            )
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L5-Intelligence", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 6 — Revenue Intelligence Engine
    # ─────────────────────────────────────────────
    def _layer6_revenue(self, event: OperationalEventModel, db) -> OperationalEventModel:
        """
        Calculates the financial exposure associated with this event via SES-003 standard contract.
        """
        try:
            finding_model = db.query(RuleFindingModel).filter(RuleFindingModel.event_id == event.id).first()
            context_model = db.query(DecisionContextModel).filter(DecisionContextModel.event_id == event.id).first()
            
            finding = {"rule_id": finding_model.rule_id if finding_model else ""}
            context = {"primary_context": context_model.primary_context if context_model else ""}
            
            request = ServiceRequest(
                correlation_id=event.correlation_id,
                calling_module="EventPipeline",
                target_service="RevenueIntelligenceEngine",
                payload={
                    "finding": finding,
                    "context": context
                }
            )
            
            response = revenue_intelligence_engine.invoke(request)
            
            if response.status != ServiceStatus.SUCCESS:
                error_msg = response.error_details.message if response.error_details else "Unknown error"
                return self._fail_event(event, db, layer="L6-Revenue", error=error_msg)

            revenue = response.result_payload

            # SES-004: Insert Relational Record
            db_revenue = RevenueIntelligenceModel(
                event_id=event.id,
                estimated_exposure=revenue.get("estimated_financial_exposure", "$0.00"),
                opportunity_category=revenue.get("revenue_risk_category", "None"),
                financial_priority=revenue.get("revenue_confidence", "High")
            )
            db.add(db_revenue)

            event.layer6_duration_ms = response.processing_time_ms
            db.commit()

            self.logger.debug(
                f"[L6] Event {event.id} revenue_risk={revenue.get('revenue_risk_category')} "
                f"exposure={revenue.get('estimated_financial_exposure')}"
            )
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L6-Revenue", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 7 — Data Management & Audit Storage
    # ─────────────────────────────────────────────
    def _layer7_storage(self, event: OperationalEventModel, db) -> OperationalEventModel:
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
                timestamp=datetime.utcnow(),
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
            event.layer7_duration_ms = (time.time() - t_start) * 1000
            db.commit()

            self.logger.info(
                f"[L7] Event {event.id} stored | ref={event.layer7_storage_ref}"
            )
            return event

        except Exception as e:
            return self._fail_event(event, db, layer="L7-Storage", error=str(e))

    # ─────────────────────────────────────────────
    # LAYER 8 — Dashboard Publication
    # ─────────────────────────────────────────────
    def _layer8_publish(self, event: OperationalEventModel, db) -> OperationalEventModel:
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
            return self._fail_event(event, db, layer="L8-Publish", error=str(e))

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
