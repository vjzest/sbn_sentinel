/**
 * D6.7c: Action Presentation — unknown-safe label mappers.
 * No state inference. All inputs come from backend DTO fields.
 */

// ---------------------------------------------------------------------------
// Action Status
// ---------------------------------------------------------------------------
export function actionStatusLabel(status: string): string {
  const MAP: Record<string, string> = {
    CREATED: 'Created',
    READY: 'Ready',
    EXECUTING: 'Executing…',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    BLOCKED: 'Blocked',
  };
  return MAP[status] ?? `Unknown (${status})`;
}

export function actionStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'text-emerald-400';
    case 'EXECUTING': return 'text-blue-400';
    case 'READY':
    case 'CREATED': return 'text-amber-400';
    case 'FAILED': return 'text-red-400';
    case 'BLOCKED': return 'text-orange-400';
    case 'CANCELLED':
    case 'EXPIRED': return 'text-white/40';
    default: return 'text-white/50';
  }
}

export function actionStatusBadge(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'EXECUTING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'READY':
    case 'CREATED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'BLOCKED': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'CANCELLED':
    case 'EXPIRED': return 'bg-white/5 text-white/40 border-white/10';
    default: return 'bg-white/5 text-white/40 border-white/10';
  }
}

// ---------------------------------------------------------------------------
// Execution Result
// ---------------------------------------------------------------------------
export function executionResultLabel(result: string): string {
  const MAP: Record<string, string> = {
    SUCCESS: 'Success',
    FAILED: 'Failed',
    PARTIAL: 'Partial',
    UNKNOWN: 'Unknown',
    NOT_ATTEMPTED: 'Not Attempted',
  };
  return MAP[result] ?? `Unknown (${result})`;
}

export function executionResultColor(result: string): string {
  switch (result) {
    case 'SUCCESS': return 'text-emerald-400';
    case 'FAILED': return 'text-red-400';
    case 'PARTIAL': return 'text-amber-400';
    case 'NOT_ATTEMPTED': return 'text-white/40';
    default: return 'text-white/50';
  }
}

// ---------------------------------------------------------------------------
// Outcome Confirmation State
// ---------------------------------------------------------------------------
export function confirmationStateLabel(state: string): string {
  const MAP: Record<string, string> = {
    CONFIRMED: 'Confirmed',
    MISMATCH: 'Mismatch',
    PENDING: 'Pending',
    UNKNOWN: 'Unknown',
  };
  return MAP[state] ?? `Unknown (${state})`;
}

export function confirmationStateBadge(state: string): string {
  switch (state) {
    case 'CONFIRMED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'MISMATCH': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-white/5 text-white/40 border-white/10';
  }
}

// ---------------------------------------------------------------------------
// Outcome Resolution State
// ---------------------------------------------------------------------------
export function resolutionStateLabel(state: string): string {
  const MAP: Record<string, string> = {
    OPEN: 'Open',
    RESOLVED: 'Resolved',
    UNRESOLVED: 'Unresolved',
    FOLLOW_UP_REQUIRED: 'Follow-Up Required',
    UNKNOWN: 'Unknown',
  };
  return MAP[state] ?? `Unknown (${state})`;
}

export function resolutionStateBadge(state: string): string {
  switch (state) {
    case 'RESOLVED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'OPEN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'UNRESOLVED': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'FOLLOW_UP_REQUIRED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-white/5 text-white/40 border-white/10';
  }
}

// ---------------------------------------------------------------------------
// Action Type — human readable display name
// ---------------------------------------------------------------------------
export function actionTypeLabel(actionType: string): string {
  const MAP: Record<string, string> = {
    RESCHEDULE_APPOINTMENT: 'Reschedule Appointment',
    SEND_NOTIFICATION: 'Send Notification',
    UPDATE_OPERATIONAL_STATUS: 'Update Operational Status',
    CREATE_FOLLOWUP_TASK: 'Create Follow-Up Task',
  };
  return MAP[actionType] ?? actionType;
}
