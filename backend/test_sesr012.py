import pytest
import json
import logging
from src.runtime.app.core.config import Settings
from src.runtime.app.services.health import HealthService, HealthState
from src.runtime.app.core.logging import StructuredJSONFormatter

def test_sesr012_config_validation():
    # Happy Path Config
    safe_settings = Settings(ENVIRONMENT="DEVELOPMENT", SYNTHETIC_TEST_ENABLED=True, CLINIC_TIMEZONE="UTC")
    assert safe_settings.validate_sesr012_config() == safe_settings

    # Failure: Test capability in Production
    with pytest.raises(ValueError, match="SYNTHETIC_TEST_ENABLED must be disabled in PRODUCTION"):
        bad_settings = Settings(ENVIRONMENT="PRODUCTION", SYNTHETIC_TEST_ENABLED=True, CLINIC_TIMEZONE="UTC")
        bad_settings.validate_sesr012_config()
        
    # Failure: Missing timezone
    with pytest.raises(ValueError, match="CLINIC_TIMEZONE is required"):
        bad_settings = Settings(ENVIRONMENT="DEVELOPMENT", SYNTHETIC_TEST_ENABLED=False, CLINIC_TIMEZONE="")
        bad_settings.validate_sesr012_config()

def test_sesr012_health_liveness_vs_readiness():
    # Liveness is always alive if the process is answering
    liveness_state, liveness_components = HealthService.check_liveness()
    assert liveness_state == HealthState.HEALTHY
    assert liveness_components["status"] == "ALIVE"
    
    # Readiness checks actual components
    readiness_state, readiness_components = HealthService.check_readiness()
    
    # Since config is valid, and mocks are healthy, it should be HEALTHY
    assert readiness_state == HealthState.HEALTHY
    assert readiness_components["configuration"] == HealthState.HEALTHY
    assert readiness_components["pf_connector"] == HealthState.HEALTHY

def test_sesr012_observability_secret_scrubbing():
    formatter = StructuredJSONFormatter()
    
    # Create a dummy LogRecord with sensitive kwargs
    record = logging.LogRecord(
        name="test_logger", level=logging.INFO, pathname="", lineno=0,
        msg="Test message", args=(), exc_info=None
    )
    # Inject sensitive and diagnostic attributes
    record.correlation_id = "PROC-900"
    record.synthetic_test_id = "T-012"
    record.event = "TEST_EVENT"
    record.pf_token = "secret123"
    record.database_password = "password456"
    
    log_json = formatter.format(record)
    log_data = json.loads(log_json)
    
    assert log_data["correlation_id"] == "PROC-900"
    assert log_data["synthetic_test_id"] == "T-012"
    assert log_data["event"] == "TEST_EVENT"
    assert log_data["message"] == "Test message"
    
    # Ensure secrets are scrubbed
    assert log_data["pf_token"] == "[REDACTED]"
    assert log_data["database_password"] == "[REDACTED]"
    
    # Ensure they aren't printed literally in the string
    assert "secret123" not in log_json
    assert "password456" not in log_json

