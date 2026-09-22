export type TechnicalState = 'ready' | 'unavailable' | 'unauthorized';

export type CapabilityState = 'READY' | 'DEGRADED' | 'BLOCKED' | 'UNAVAILABLE' | 'UNKNOWN';

export interface CapabilityDTO {
  capability_id: string;
  label: string;
  state: CapabilityState;
  affected_scope?: string | null;
  can_continue: boolean;
  retry_supported: boolean;
  last_confirmed_at?: string | null;
  diagnostic_ref?: string | null;
}

export interface ConnectorDTO {
  connector_id: string;
  name: string;
  state: string;
  supported_in_v1: boolean;
  latency_ms?: number | null;
  last_sync?: string | null;
  failure_code?: string | null;
}

export interface OverallStatus {
  scope: 'system' | 'capability';
  state: CapabilityState;
  message?: string | null;
  checked_at?: string | null;
}

export interface RuntimeStatusDTO {
  overall: OverallStatus;
  capabilities: CapabilityDTO[];
  connectors: ConnectorDTO[];
  technical_state: TechnicalState;
}
