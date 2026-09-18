/**
 * D4 — Decision Basis Presentation Labels
 * Central readable-label mapping for technical states and codes.
 * All functions are unknown-safe: unrecognised codes return the raw value
 * prefixed with 'Unknown:' rather than a misleading label.
 * NO browser date computation. NO policy applicability logic.
 */

/** Maps governance sufficiency status to a human-readable label. */
export function labelForSufficiency(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const map: Record<string, string> = {
    SUFFICIENT: 'Sufficient',
    INSUFFICIENT: 'Insufficient',
    Unevaluated: 'Unevaluated',
    'Pending Evaluation': 'Pending Evaluation',
  };
  return map[status] ?? `Unknown: ${status}`;
}

/** Maps evidence retrieval / freshness status to a label. */
export function labelForFreshness(
  freshnessStatus: string | null | undefined,
): string {
  if (!freshnessStatus) return 'Unknown';
  const map: Record<string, string> = {
    CURRENT: 'Current',
    STALE: 'Stale',
    MISSING: 'Missing',
    RETRIEVED: 'Retrieved',
    FAILED: 'Retrieval Failed',
    UNAVAILABLE: 'Unavailable',
  };
  return map[freshnessStatus] ?? `Unknown: ${freshnessStatus}`;
}

/** Maps policy lifecycle state to a label. */
export function labelForLifecycle(state: string | null | undefined): string {
  if (!state) return 'Unknown';
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    SUPERSEDED: 'Superseded',
    RETIRED: 'Retired',
    PENDING: 'Pending',
    UNAVAILABLE: 'Unavailable',
    DRAFT: 'Draft',
  };
  return map[state] ?? `Unknown: ${state}`;
}

/**
 * Maps a backend rule result to a display label.
 * RULE_EVALUATION_FAILED, CONDITION_NOT_MET, NOT_APPLICABLE are distinct.
 * Frontend NEVER collapses them into a single state.
 */
export function labelForRuleResult(result: string | null | undefined): string {
  if (!result) return 'Unknown';
  const map: Record<string, string> = {
    CONDITION_MET: 'Condition Met',
    CONDITION_NOT_MET: 'Condition Not Met',
    RULE_EVALUATION_FAILED: 'Rule Evaluation Failed',
    NOT_APPLICABLE: 'Not Applicable',
    POLICY_UNAVAILABLE: 'Policy Unavailable',
    PASSED: 'Passed',
    FAILED: 'Failed',
    SKIPPED: 'Skipped',
    PENDING: 'Pending',
  };
  return map[result] ?? `Unknown: ${result}`;
}

/** Color class for sufficiency badge — maps authoritative states only. */
export function sufficiencyColorClass(
  status: string | null | undefined,
): string {
  if (status === 'SUFFICIENT') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (status === 'INSUFFICIENT') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-white/50 bg-white/5 border-white/10';
}

/** Color class for rule result badge. */
export function ruleResultColorClass(result: string | null | undefined): string {
  if (!result) return 'text-white/50 bg-white/5 border-white/10';
  if (result === 'CONDITION_MET' || result === 'PASSED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (result === 'CONDITION_NOT_MET' || result === 'FAILED') return 'text-red-400 bg-red-500/10 border-red-500/30';
  if (result === 'RULE_EVALUATION_FAILED') return 'text-red-600 bg-red-900/20 border-red-700/40';
  if (result === 'NOT_APPLICABLE') return 'text-white/40 bg-white/5 border-white/10';
  if (result === 'POLICY_UNAVAILABLE') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-white/50 bg-white/5 border-white/10';
}

/** Color class for lifecycle badge. */
export function lifecycleColorClass(state: string | null | undefined): string {
  if (state === 'ACTIVE') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (state === 'SUPERSEDED') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (state === 'RETIRED') return 'text-white/40 bg-white/5 border-white/10';
  if (state === 'PENDING') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  return 'text-white/50 bg-white/5 border-white/10';
}

/** Formats an ISO timestamp for display without reinterpreting the timezone. */
export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}
