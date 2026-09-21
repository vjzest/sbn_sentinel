# D6: Action Lifecycle Backend and Frontend Integration

This document serves as the final walkthrough for the integration of **D6 - Operational Execution Engine Integration** into SBN Sentinel.

## Overview
D6 establishes a clear boundary between human authorization and operational execution. The core invariant enforced throughout this phase is: **One persisted Human Decision may authorize the creation of governed Action record(s), but Action, Execution Attempt, Execution Result, Outcome and Resolution remain separate truths.**

## Work Completed

### 1. Backend Endpoint: Action Lifecycle (`action_lifecycle.py`)
- Created `GET /api/v1/actions/lifecycle/{decision_id}`
- Assembles a full `ActionLifecycleDTO` entirely from database queries.
- Incorporates zero in-memory inference or assumption—all data represents authoritative, persisted DB state.
- Computes state capabilities (e.g., `can_create`, `can_retry`) dynamically based purely on the authoritative DB records (e.g., verifying an action has failed and hasn't been blocked/cancelled).

### 2. Idempotency Gate (`actions.py`)
- Modified `POST /api/v1/actions/` to query for duplicate (non-cancelled, non-expired) records by matching `(decision_id, action_type, target_reference)`.
- Returns an `IDEMPOTENT` flag alongside the existing action rather than spawning duplicates.

### 3. Frontend Types and Utilities
- Mapped backend `ActionLifecycleDTO` exactly to `actionLifecycle.ts`.
- Created robust API wrappers (`actionCommands.ts`, `actionLifecycle.ts`) that correctly resolve `technical_state` markers on HTTP errors.

### 4. Frontend Components
- **ActionSummary**: Displays an Action’s identity, target, and status without local mutation logic.
- **ExecutionAttemptHistory**: Maps and displays historical execution attempts via the connector, explicitly rendering errors.
- **OutcomeSummary**: Displays `confirmation_state` and `resolution_state` explicitly as separate truths.
- **ActionControls**: Submits commands (Create, Execute, Retry) and instantly revalidates the entire lifecycle view upon success.
- **ActionLifecycleSection**: The main workspace component that orchestrates these views based on the authoritative `decision_id` passed down from D5.

### 5. SignalsDetailView Integration
- Exposed `onDecisionChange` from the D5 `RecommendationReview` component.
- `SignalsDetailView` tracks the `currentDecisionId` and passes it to the `ActionLifecycleSection` workspace, successfully bridging the D5 and D6 phases together.

### 6. Validation (CI)
- Wrote full integration tests in `test_d6_action_lifecycle.py`.
- Fixed lint issues and ran `pytest`, achieving **100% test pass rate** for the lifecycle and idempotency gates.
- `TARGET_NOT_FOUND_OR_UNSUPPORTED` was resolved during testing by mocking the correct target model validation required by the execution engine.

## Conclusion
The D6 integration is now fully realized from backend storage models to frontend visualization. The system cleanly separates "Recommendation vs Authorization" from "Authorization vs Execution".


### 7. D6 Production Corrections (Audit 4 Compliance)
- **Centralized Capability Logic:** Refactored execution eligibility controls to \OperationalExecutionEngine\ to serve as the single source of truth for both capability checks and execution validation.
- **UNKNOWN Retry Blocking:** Excluded \UNKNOWN\ results from the \can_retry\ computation to prevent duplicate, non-idempotent side effects externally.
- **Dynamic Action Type Resolution:** Replaced hard-coded \ActionType\ availability with dynamic evaluation powered by \GovernedRuleVersionModel\ (parsing \llowed_outputs_json\).
- **Dynamic Target Resolution:** Implemented fail-safe target resolution (Clinic/Encounter) linked firmly to the parent \Decision\'s \journey_id\.
- **Concurrency & Idempotency:** Implemented \with_for_update()\ row-level locking for the Idempotency Gate, ensuring durable concurrency protection. Added \canonical parameters\ validation to prevent silent material intent divergence on duplicate requests.
- **D6 Outcome Persistence:** Implemented robust save and restore mechanisms for 5 new fields in \OperationalOutcomeModel\: \source_reference\, \closure_reason\, \confirmed_at\, \closed_at\, and \eopened_at\.
- **Synthetic Connector Guard:** Wrapped \MOCK_PRACTICE_FUSION_CONNECTOR\ execution attempts in a \SYNTHETIC_TEST_ENABLED\ guard to prohibit leaking mock connectors into persistent storage outside of a test context.
- **T01-T20 Test Coverage:** Expanded \	est_d6_action_lifecycle.py\ to achieve deep coverage for empty lifecycles, dynamic target mapping, canonical parameter-aware idempotency, \UNKNOWN\ retry blocking, and granular persistence of D6 outcomes.

