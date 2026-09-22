import { RuntimeStatusDTO, CapabilityState } from '../types/runtimeStatus';

export interface SemanticState {
  isCritical: boolean;
  isWarning: boolean;
  message: string;
  canContinue: boolean;
}

/**
 * Maps authoritative backend capability states to UI semantic presentation.
 * D7 Contract: Frontend does not invent failure severity.
 */
export function mapStateToSemantic(state: CapabilityState, label: string): SemanticState {
  switch (state) {
    case 'UNAVAILABLE':
    case 'BLOCKED':
      return {
        isCritical: true,
        isWarning: false,
        message: `${label} is currently unavailable.`,
        canContinue: false
      };
    case 'DEGRADED':
      return {
        isCritical: false,
        isWarning: true,
        message: `${label} is degraded. Some functionality may be limited.`,
        canContinue: false
      };
    case 'UNKNOWN':
      return {
        isCritical: false,
        isWarning: true,
        message: `Status of ${label} is currently unknown.`,
        canContinue: true
      };
    case 'READY':
    default:
      return {
        isCritical: false,
        isWarning: false,
        message: `${label} is ready.`,
        canContinue: true
      };
  }
}
