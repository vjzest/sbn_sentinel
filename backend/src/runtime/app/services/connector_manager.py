import logging
from typing import Dict, Any, Type
from datetime import datetime

from app.db.database import SessionLocal
from app.models.connector import ConnectorModel
from app.connectors.base_connector import BaseConnector
from app.connectors.practice_fusion_connector import PracticeFusionConnector
from app.core.encryption import decrypt_value
from app.services.state_transition_engine import sste

logger = logging.getLogger(__name__)


class ConnectorManager:
    """
    SES-005 Connector Engineering Framework
    Manages connector lifecycle, health monitoring, and sync execution.
    """

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        # Register available connector classes
        self._connector_registry: Dict[str, Type[BaseConnector]] = {
            "Practice Fusion": PracticeFusionConnector
        }

    async def sync_connector(self, connector_id: str) -> Dict[str, Any]:
        """
        Executes a synchronization cycle for a specific connector.
        Enforces SES-005 lifecycle state transitions.
        """
        db = SessionLocal()
        try:
            db_connector = db.query(ConnectorModel).filter(
                ConnectorModel.id == connector_id).first()
            if not db_connector:
                return {"status": "Failed", "error": "Connector not found"}

            # Instantiate the specific connector logic
            connector_class = next(
                (cls for name, cls in self._connector_registry.items() if name in db_connector.name), None)

            if not connector_class:
                # D7: Do not simulate success for unsupported connectors.
                sste.execute_transition(db_connector, "Connector", "Warning")
                db_connector.failure_code = "unsupported"
                db.commit()
                return {"status": "Failed", "error": f"Connector type {db_connector.name} is not fully supported in V1", "code": "UNAVAILABLE"}

            # State Transition: Synchronizing
            sste.execute_transition(db_connector, "Connector", "Synchronizing")
            db.commit()

            # Execute the canonical sync process
            connector_instance = connector_class(connector_id=db_connector.id)
            config = db_connector.config or {}

            # If access_token exists on the model, inject it into config for auth
            if db_connector.access_token:
                # SES-008: Decrypt credentials at rest before usage
                config["api_key"] = decrypt_value(db_connector.access_token)

            result = await connector_instance.sync(config)

            # Process result and update lifecycle state
            if result.get("status") == "Success":
                sste.execute_transition(db_connector, "Connector", "Healthy")
                db_connector.last_sync = datetime.utcnow()
                db_connector.latency_ms = int(result.get("duration_ms", 50))
                db_connector.failure_code = None
            else:
                sste.execute_transition(db_connector, "Connector", "Warning")  # Transient failure state
                error_msg = result.get("error", "").lower()
                if "auth" in error_msg or "token" in error_msg:
                    db_connector.failure_code = "authentication failure"
                elif "timeout" in error_msg:
                    db_connector.failure_code = "timeout"
                elif "network" in error_msg or "connection" in error_msg:
                    db_connector.failure_code = "network unavailable"
                elif "invalid" in error_msg or "parse" in error_msg:
                    db_connector.failure_code = "invalid response"
                elif "partial" in error_msg:
                    db_connector.failure_code = "partial"
                else:
                    db_connector.failure_code = result.get("failure_code", "unknown")

            db.commit()
            return result

        except Exception as e:
            self.logger.error(f"Sync failed for connector {connector_id}: {e}")
            if 'db_connector' in locals() and db_connector:
                sste.execute_transition(db_connector, "Connector", "Warning")
                db_connector.failure_code = "unknown"
                db.commit()
            return {"status": "Failed", "error": str(e)}
        finally:
            db.close()

    def is_ready(self, connector_name: str = "PRACTICE_FUSION") -> bool:
        """SES-005 / SESR-011: Verify operational readiness for a specific connector.
        Fail-closed: returns False if the connector record is absent, unhealthy,
        or missing credentials. Does NOT create a connector record -- that is
        exclusively the responsibility of the startup seeding path in main.py.
        """
        db = SessionLocal()
        try:
            search_name = "%Practice Fusion%" if "PRACTICE" in connector_name.upper() else f"%{connector_name}%"
            row = db.query(ConnectorModel).filter(
                ConnectorModel.name.ilike(search_name)
            ).first()
            if not row:
                return False
            if row.status not in {"Healthy", "Ready"}:
                return False
            if not getattr(row, "access_token", None):
                return False
            return True
        finally:
            db.close()


connector_manager = ConnectorManager()
