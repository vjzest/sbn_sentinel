import logging
import time
import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class ConnectorException(Exception):
    """Exception raised for specific connector errors with a machine-readable code."""

    def __init__(self, message: str, failure_code: str = "UNKNOWN"):
        super().__init__(message)
        self.failure_code = failure_code


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

    @abstractmethod
    async def retrieve_data(self) -> List[Dict[str, Any]]:
        """Retrieve raw records from the external system."""

    @abstractmethod
    async def validate_data(self, raw_record: Dict[str, Any]) -> bool:
        """Validate if the record is structurally sound and actionable."""

    @abstractmethod
    async def transform_to_canonical(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map vendor-specific fields to Sentinel Standard Canonical form.
        Must return a dict containing at least:
        - event_type (str)
        - detail (str)
        """

    async def sync(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        The standardized execution pipeline for a connector.
        Retrieves, validates, transforms, and submits.
        """
        self.logger.info(f"[{self.connector_id}] Starting sync...")
        start_time = time.time()

        # 1. Authenticate
        try:
            if not await self.authenticate(config):
                self.logger.error(f"[{self.connector_id}] Authentication failed.")
                return {"status": "Failed", "error": "Authentication Failed", "failure_code": "AUTHENTICATION_FAILED"}
        except ConnectorException as ce:
            self.logger.error(f"[{self.connector_id}] Authentication failed: {ce}")
            return {"status": "Failed", "error": str(ce), "failure_code": ce.failure_code}
        except Exception as e:
            self.logger.error(f"[{self.connector_id}] Authentication exception: {e}")
            return {"status": "Failed", "error": str(e), "failure_code": "UNKNOWN"}

        # 2. Retrieve Data
        try:
            raw_records = await self.retrieve_data()
        except ConnectorException as ce:
            self.logger.error(f"[{self.connector_id}] Data retrieval failed: {ce}")
            return {"status": "Failed", "error": f"Retrieval Failed: {ce}", "failure_code": ce.failure_code}
        except Exception as e:
            self.logger.error(f"[{self.connector_id}] Data retrieval exception: {e}")
            return {"status": "Failed", "error": f"Retrieval Failed: {e}", "failure_code": "UNKNOWN"}

        processed_count = 0
        failed_count = 0

        # Process each record
        canonical_results = []
        for record in raw_records:
            try:
                # 3. Validate
                if not await self.validate_data(record):
                    failed_count += 1
                    continue

                # 4. Transform
                canonical = await self.transform_to_canonical(record)

                # 5. Submit to Canonical Ingress (Evidence Input)
                # Instead of creating an operational event automatically, we push to Canonical Ingress
                canonical_results.append(canonical)
                processed_count += 1
            except Exception as e:
                self.logger.error(f"[{self.connector_id}] Failed to process record: {e}")
                failed_count += 1

        # Push to ingress
        try:
            from app.services.ingress_service import canonical_ingress
            await canonical_ingress.submit_batch(self.connector_id, canonical_results)
        except ImportError:
            self.logger.warning("canonical_ingress not implemented yet, just returning results")

        duration_ms = (time.time() - start_time) * 1000

        if failed_count > 0 and processed_count > 0:
            return {
                "status": "Failed",
                "error": f"Processed {processed_count}, failed {failed_count}",
                "failure_code": "PARTIAL",
                "processed": processed_count,
                "failed": failed_count,
                "duration_ms": duration_ms
            }

        return {
            "status": "Success",
            "failure_code": None,
            "processed": processed_count,
            "failed": failed_count,
            "duration_ms": duration_ms
        }
