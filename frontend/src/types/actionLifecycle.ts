/**
 * D6.6: Action Lifecycle DTO types for the SBN Sentinel frontend.
 *
 * All types mirror the backend ActionLifecycleDTO contract exactly.
 * No local inference of state — everything comes from the backend read contract.
 */

// ---------------------------------------------------------------------------
// Execution Attempt
// ---------------------------------------------------------------------------
export interface ExecutionAttemptDTO {
  attempt_id: string;
  attempt_number: number;
  connector: string;
  result: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'UNKNOWN' | 'NOT_ATTEMPTED' | string;
  request_reference: string | null;
  response_reference: string | null;
  error_message: string | null;
  attempt_timestamp: string | null;
  journey_id: string | null;
}

// ---------------------------------------------------------------------------
// Operational Outcome
// ---------------------------------------------------------------------------
export interface OperationalOutcomeDTO {
  outcome_id: string;
  action_id: string;
  expected_outcome: unknown | null;
  observed_outcome: unknown | null;
  confirmation_state: 'CONFIRMED' | 'MISMATCH' | 'PENDING' | 'UNKNOWN' | string;
  resolution_state: 'OPEN' | 'RESOLVED' | 'UNRESOLVED' | 'FOLLOW_UP_REQUIRED' | 'UNKNOWN' | string;
  source_reference: string | null;
  closure_reason: string | null;
  confirmed_at: string | null;
  closed_at: string | null;
  reopened_at: string | null;
  created_at: string | null;
  journey_id: string | null;
}

// ---------------------------------------------------------------------------
// Action Item (one governed action + its attempts + outcome)
// ---------------------------------------------------------------------------
export interface ActionItemDTO {
  action_id: string;
  action_type: string;
  target_reference: string;
  authorization_reference: string;
  status: 'CREATED' | 'READY' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'BLOCKED' | string;
  current_result: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'UNKNOWN' | 'NOT_ATTEMPTED' | string;
  parameters: Record<string, unknown>;
  created_at: string | null;
  execute_by: string | null;
  journey_id: string | null;
  // Capability signals — computed by backend from DB state
  can_execute: boolean;
  can_retry: boolean;
  blocked_reason: string | null;
  // Sub-records
  attempts: ExecutionAttemptDTO[];
  outcome: OperationalOutcomeDTO | null;
}

// ---------------------------------------------------------------------------
// Creation Capability
// ---------------------------------------------------------------------------
export interface ActionCreationStateDTO {
  state: 'ELIGIBLE' | 'NOT_APPROVED' | 'EXHAUSTED' | 'UNKNOWN' | string;
  allowed_action_types: string[];
  permitted_targets: { target_id: string; label: string; type: string }[];
}

// ---------------------------------------------------------------------------
// Decision Summary (embedded in lifecycle DTO)
// ---------------------------------------------------------------------------
export interface DecisionSummaryDTO {
  decision_id: string;
  recommendation_id: string;
  actor_id: string;
  decision_type: string;
  status: string;
  decision_timestamp: string | null;
}

// ---------------------------------------------------------------------------
// Full Lifecycle DTO — top-level response from GET /actions/lifecycle/{decision_id}
// ---------------------------------------------------------------------------
export interface ActionLifecycleDTO {
  object_ref: { object_type: string; object_id: string };
  journey_id: string | null;
  decision: DecisionSummaryDTO | null;
  creation: ActionCreationStateDTO;
  actions: ActionItemDTO[];
  can_create: boolean;
  technical_state: 'ready' | 'unavailable' | 'unauthorized' | 'ambiguous' | string;
}
