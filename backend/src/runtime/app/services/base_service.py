"""
SES-003: Internal API & Service Communication Specification
BaseService architecture.
"""
import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

from app.schemas.service_communication import (
    ServiceRequest,
    ServiceResponse,
    ServiceStatus,
    ServiceErrorCode,
    ErrorDetail
)

logger = logging.getLogger(__name__)


class BaseService(ABC):
    """
    SES-003 Compliant Base Service.
    All internal engines must inherit from this class and implement `_process`.
    It enforces the standard ServiceRequest / ServiceResponse contract and observability.
    """

    @property
    @abstractmethod
    def service_name(self) -> str:
        """Name of the service (e.g., 'RulesEngine')"""
        pass

    @property
    @abstractmethod
    def version(self) -> str:
        """Version of the service (e.g., 'v1.0')"""
        pass

    def invoke(self, request: ServiceRequest) -> ServiceResponse:
        """
        Public boundary of the service.
        Validates request, manages timing, executes logic, and handles standard errors.
        """
        t_start = time.time()
        
        # SES-003: Observability (Log interaction start)
        logger.debug(f"[SES-003] -> {self.service_name} invoked by {request.calling_module} | correlation_id={request.correlation_id}")
        
        warnings = []
        try:
            # SES-003: Validate Target Service
            if request.target_service != self.service_name:
                raise ValueError(f"Request routed to wrong service. Expected {self.service_name}, got {request.target_service}")

            # Execute actual business logic
            result = self._process(request.payload)

            duration_ms = (time.time() - t_start) * 1000
            logger.debug(f"[SES-003] <- {self.service_name} SUCCESS | duration={duration_ms:.2f}ms")

            return ServiceResponse(
                status=ServiceStatus.SUCCESS,
                response_code=200,
                correlation_id=request.correlation_id,
                processing_time_ms=duration_ms,
                result_payload=result,
                warnings=warnings
            )

        except ValueError as ve:
            duration_ms = (time.time() - t_start) * 1000
            logger.warning(f"[SES-003] <- {self.service_name} VALIDATION_ERROR: {str(ve)}")
            return ServiceResponse(
                status=ServiceStatus.FAILED,
                response_code=400,
                correlation_id=request.correlation_id,
                processing_time_ms=duration_ms,
                error_details=ErrorDetail(
                    error_code=ServiceErrorCode.VALIDATION_ERROR,
                    message=str(ve)
                )
            )
            
        except Exception as e:
            duration_ms = (time.time() - t_start) * 1000
            logger.error(f"[SES-003] <- {self.service_name} INTERNAL_ERROR: {str(e)}", exc_info=True)
            return ServiceResponse(
                status=ServiceStatus.FAILED,
                response_code=500,
                correlation_id=request.correlation_id,
                processing_time_ms=duration_ms,
                error_details=ErrorDetail(
                    error_code=ServiceErrorCode.INTERNAL_PROCESSING_ERROR,
                    message=str(e)
                )
            )

    @abstractmethod
    def _process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Internal business logic implementation.
        Must be implemented by subclasses.
        Returns the dictionary to be set as `result_payload`.
        """
        pass
