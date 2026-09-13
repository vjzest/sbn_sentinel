export type SemanticState =
  | 'positive'
  | 'attention'
  | 'critical'
  | 'neutral'
  | 'unknown'
  | 'disabled';

export interface GovernedPresentation {
  label: string;
  semantic: SemanticState;
  critical?: boolean;
}

export function mapGovernedState(state: string | null | undefined): GovernedPresentation {
  if (!state) {
    return { label: 'Unknown', semantic: 'unknown' };
  }

  const normalized = state.trim().toUpperCase();

  switch (normalized) {
    // Execution / Outcome Success
    case 'EXECUTED':
    case 'SUCCESS':
    case 'RESOLVED':
    case 'CONFIRMED':
    case 'ACTIVE':
    case 'CONDITION_MET':
    case 'PASSED':
      return { label: normalized, semantic: 'positive' };

    // Approvals (Not yet executed)
    case 'APPROVED':
    case 'RECORDED':
      return { label: normalized, semantic: 'attention' }; // Not positive until executed

    // Recommendations (Not yet approved)
    case 'RECOMMENDED':
    case 'PENDING':
    case 'UNRESOLVED':
    case 'EVALUATING':
      return { label: normalized, semantic: 'attention' };

    // Critical / Blocked / Errors
    case 'BLOCKED':
    case 'DENIED':
    case 'REJECTED':
    case 'ERROR':
    case 'FAILED':
    case 'UNAUTHORIZED':
    case 'DEGRADED':
    case 'OFFLINE':
      return { label: normalized, semantic: 'critical', critical: true };

    // Healthy (from StatusIndicator)
    case 'HEALTHY':
      return { label: normalized, semantic: 'positive' };
    case 'INITIALIZING':
      return { label: normalized, semantic: 'neutral' };
      
    // Historical markers
    case 'HISTORICAL':
    case 'SUPERSEDED':
    case 'EXPIRED':
      return { label: normalized, semantic: 'disabled' };

    // Safe fallback for unmapped
    default:
      return { label: state, semantic: 'unknown' };
  }
}
