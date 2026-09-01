import logging
from typing import Dict, Any, Tuple
from enum import Enum
from src.runtime.app.core.config import settings

logger = logging.getLogger(__name__)


class HealthState(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    NOT_READY = "NOT_READY"


class HealthService:
    @staticmethod
    def check_liveness() -> Tuple[HealthState, Dict[str, Any]]:
        """
        Liveness merely means the application process is running.
        (SESR-012 RHO-002: Liveness and Readiness Must Remain Distinct)
        """
        return HealthState.HEALTHY, {"status": "ALIVE"}

    @staticmethod
    def check_readiness() -> Tuple[HealthState, Dict[str, Any]]:
        """
        Readiness determines if the system can safely perform governed V1 processing.
        (SESR-012 RHO-004: Dependency Health Should Identify Scope of Impact)
        """
        components: Dict[str, Any] = {
            "application_build": settings.BUILD_ID,
            "environment": settings.ENVIRONMENT,
            "database": HealthState.HEALTHY,  # Mock database health
            "pf_connector": HealthState.HEALTHY,  # Mock connector health
            "schema_compatibility": HealthState.HEALTHY,  # Mock schema health
        }

        # Example Readiness checks based on configuration
        try:
            settings.validate_sesr012_config()
            components["configuration"] = HealthState.HEALTHY
        except ValueError as e:
            components["configuration"] = HealthState.NOT_READY
            components["configuration_error"] = str(e)
            logger.error("Configuration validation failed", extra={
                "event": "CONFIGURATION_FAILURE",
                "failure_category": "Configuration Integrity"
            })

        # Calculate aggregated state
        if components["configuration"] == HealthState.NOT_READY:
            overall_state = HealthState.NOT_READY
        elif components["database"] == HealthState.NOT_READY or components["schema_compatibility"] == HealthState.NOT_READY:
            overall_state = HealthState.NOT_READY
        elif components["pf_connector"] == HealthState.NOT_READY:
            overall_state = HealthState.DEGRADED
        else:
            overall_state = HealthState.HEALTHY

        # Log material readiness change
        logger.info(f"Readiness state evaluated: {overall_state.value}", extra={
            "event": "READINESS_CHECK",
            "state": overall_state.value
        })

        return overall_state, components
