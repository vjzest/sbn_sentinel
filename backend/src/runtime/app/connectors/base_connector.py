import logging
import time
import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class BaseConnector(ABC):
    """
    SES-005 Connector Engineering Framework
    
    The abstract base class for all Sentinel external system connectors.
    Connectors have no business logic. They ONLY:
    1. Authenticate
    2. Retrieve Data
    3. Validate
    4. Normalize (Transform to Sentinel Standard Event)
    5. Submit to Pipeline
    """

    def __init__(self, connector_id: str, name: str):
        self.connector_id = connector_id
        self.name = name
        self.logger = logging.getLogger(f"Connector.{self.name}")

    @abstractmethod
    async def authenticate(self, config: Dict[str, Any]) -> bool:
        """Authenticate with the external system using provided config."""
        pass

    @abstractmethod
    async def retrieve_data(self) -> List[Dict[str, Any]]:
        """Retrieve raw records from the external system."""
        pass

    @abstractmethod
    async def validate_data(self, raw_record: Dict[str, Any]) -> bool:
        """Validate if the record is structurally sound and actionable."""
        pass

    @abstractmethod
    async def transform_to_canonical(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map vendor-specific fields to Sentinel Standard Canonical form.
        Must return a dict containing at least:
        - event_type (str)
        - detail (str)
        """
        pass

    async def sync(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        The standardized execution pipeline for a connector.
        Retrieves, validates, transforms, and submits.
        """
        self.logger.info(f"[{self.connector_id}] Starting sync...")
        start_time = time.time()
        
        # 1. Authenticate
        if not await self.authenticate(config):
            self.logger.error(f"[{self.connector_id}] Authentication failed.")
            return {"status": "Failed", "error": "Authentication Failed"}

        # 2. Retrieve Data
        try:
            raw_records = await self.retrieve_data()
        except Exception as e:
            self.logger.error(f"[{self.connector_id}] Data retrieval failed: {e}")
            return {"status": "Failed", "error": f"Retrieval Failed: {e}"}
            
        processed_count = 0
        failed_count = 0

        # Process each record
        for record in raw_records:
            try:
                # 3. Validate
                if not await self.validate_data(record):
                    failed_count += 1
                    continue
                    
                # 4. Transform
                canonical = await self.transform_to_canonical(record)
                
                # 5. Submit to Pipeline (SES-002 / SES-006)
                from app.services.processing_orchestrator import processing_orchestrator
                processing_orchestrator.create_event(
                    event_type=canonical.get("event_type", "Unknown"),
                    source=self.name,
                    raw_payload={"detail": canonical.get("detail", str(record)), **record},
                    priority="Normal",
                    correlation_id=str(uuid.uuid4())
                )
                processed_count += 1
            except Exception as e:
                self.logger.error(f"[{self.connector_id}] Failed to process record: {e}")
                failed_count += 1

        duration_ms = (time.time() - start_time) * 1000
        
        return {
            "status": "Success",
            "processed": processed_count,
            "failed": failed_count,
            "duration_ms": duration_ms
        }
