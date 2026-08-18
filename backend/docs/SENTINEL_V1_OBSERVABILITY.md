# SENTINEL V1 OBSERVABILITY
**Purpose:** Provides a minimal engineering reference for runtime health, observability, and debugging per SESR-012 Chapter 4.

## Core Endpoints
- **Health Check Location:** Internal usage via `HealthService.check_liveness()`
- **Readiness Check Location:** Internal usage via `HealthService.check_readiness()`

## Critical Dependencies Checked
1. **Configuration:** Verified at startup (checks `CLINIC_TIMEZONE` and safe defaults).
2. **Database:** Validated for connectivity.
3. **PF Connector:** Validated for connectivity (does not generate fake patient data).
4. **Schema Compatibility:** Checked against expected application version.

## Log Format
- **Log Location:** `stdout` (configured in `src/runtime/app/core/logging.py`)
- **Log Severity Convention:** Standard python levels (DEBUG, INFO, WARN, ERROR, CRITICAL).
- **Format:** Structured JSON format ensuring parsable output.
- **Core Identifiers:**
  - `correlation_id`: Used to map a complete workflow trace.
  - `synthetic_test_id`: Maps to a synthetic test fixture (e.g. `T-009`).
  - `build_id`: Available in log startup sequence.
  - `environment_identity`: Sourced from `config.ENVIRONMENT`.

## Main Technical Failure Categories
- `CONFIGURATION_FAILURE`: Missing or conflicting settings (e.g., test config in production).
- `CONNECTOR_FAILURE`: External boundary (e.g., Practice Fusion) unavailability.
- `PERSISTENCE_FAILURE`: Database constraint violations, write errors.
- `SCHEMA_FAILURE`: Incompatible schema detected at startup.
- `RECOMMENDATION_PROCESSING_FAILURE`: Internal exception during decision logic execution.

## Production Logging Restrictions
- Never log raw Practice Fusion response payloads in `INFO` or `ERROR` unless specifically scoped and scrubbed.
- Never log secrets (`PF_TOKEN`, database passwords, session tokens) - these are actively scrubbed in `logging.py`.
- No PHI dumped in debug mode in production.

## Example Debugging Instruction
**To investigate a failed synthetic test (e.g., T-009):**
1. Search logs for `synthetic_test_id="T-009"`.
2. Obtain the associated `correlation_id` from the log entry.
3. Filter the logs using that `correlation_id` to see the complete trace.
4. Identify the last successful boundary (e.g. `Evidence Processing Completed`).
5. Identify the first failed boundary (e.g. `RECOMMENDATION_PROCESSING_FAILURE`).
6. Identify the corresponding governed record (e.g., `decision_context_id`).
7. Compare the Actual Result against the SESR-011 Expected Result to find the variance.
