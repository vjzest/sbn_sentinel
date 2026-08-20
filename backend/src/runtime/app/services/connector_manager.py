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
            db_connector = db.query(ConnectorModel).filter(ConnectorModel.id == connector_id).first()
            if not db_connector:
                return {"status": "Failed", "error": "Connector not found"}

            # Instantiate the specific connector logic
            connector_class = next(
                (cls for name, cls in self._connector_registry.items() if name in db_connector.name), 
                None
            )
            
            if not connector_class:
                # Mock fallback for V1 non-implemented connectors (Twilio, Zoom, etc.)
                db_connector.status = "Healthy"
                db_connector.last_sync = datetime.utcnow()
                db.commit()
                return {"status": "Success", "message": f"Simulated sync for {db_connector.name}"}

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
            else:
                sste.execute_transition(db_connector, "Connector", "Warning") # Transient failure state

            db.commit()
            return result

        except Exception as e:
            self.logger.error(f"Sync failed for connector {connector_id}: {e}")
            if 'db_connector' in locals() and db_connector:
                sste.execute_transition(db_connector, "Connector", "Warning")
                db.commit()
            return {"status": "Failed", "error": str(e)}
        finally:
            db.close()

connector_manager = ConnectorManager()
