import { CapabilityDTO } from '../types/runtimeStatus';
import { mapGovernedState, GovernedPresentation } from './governedPresentation';

export interface SemanticState extends GovernedPresentation {
  message: string;
  canContinue: boolean;
}

/**
 * Maps authoritative backend capability states to UI semantic presentation.
 * D7 Contract: Frontend does not invent failure severity. Uses D1 governed mapping.
 */
export function mapStateToSemantic(cap: CapabilityDTO): SemanticState {
  const gov = mapGovernedState(cap.state);
  
  let message = `${cap.label} is ready.`;
  if (cap.state === 'UNAVAILABLE' || cap.state === 'BLOCKED') {
    message = `${cap.label} is currently unavailable.`;
  } else if (cap.state === 'DEGRADED') {
    message = `${cap.label} is degraded. Some functionality may be limited.`;
  } else if (cap.state === 'UNKNOWN') {
    message = `Status of ${cap.label} is currently unknown.`;
  }

  return {
    ...gov,
    message,
    canContinue: cap.can_continue
  };
}
