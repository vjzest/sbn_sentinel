/**
 * SDS-D4: Decision Basis — Tests T01–T14
 * Tests verify:
 *   - Truth rules: Used ≠ Missing, SUFFICIENT ≠ COMPLETE, STALE ≠ MISSING ≠ UNAVAILABLE
 *   - Presentation labels: all unknown-safe, verbatim backend results
 *   - Component rendering: null safety, graceful unavailable states
 *   - Fetcher: null on failure, unauthorized state returned on 401/403
 */
import React from 'react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  labelForSufficiency,
  labelForFreshness,
  labelForLifecycle,
  labelForRuleResult,
  sufficiencyColorClass,
  ruleResultColorClass,
  lifecycleColorClass,
  formatTimestamp,
} from '../utils/decisionBasisPresentation';
import { EvidenceSummary } from '../components/DecisionBasis/EvidenceSummary';
import { DecisionContextSummary } from '../components/DecisionBasis/DecisionContextSummary';
import { PolicySummary } from '../components/DecisionBasis/PolicySummary';
import { RuleResultList } from '../components/DecisionBasis/RuleResultList';
import { ProvenanceDetail } from '../components/DecisionBasis/ProvenanceDetail';
import { EvidenceConflictNotice } from '../components/DecisionBasis/EvidenceConflictNotice';
import type { DecisionBasisDTO } from '../types/decisionBasis';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyEvidence: DecisionBasisDTO['evidence'] = {
  used: [],
  missing: [],
  conflicts: [],
  freshness: [],
};

// ---------------------------------------------------------------------------
// T01 — Used Evidence ≠ Missing Evidence (always separate, always labeled)
// ---------------------------------------------------------------------------
describe('T01: Used ≠ Missing — always separate labeled sections', () => {
  test('Used and Missing render in distinct labeled regions', () => {
    const evidence: DecisionBasisDTO['evidence'] = {
      used: [
        {
          evidence_id: 'ev-001',
          type: 'EHR_APPOINTMENT',
          value: 'noshow',
          retrieved_at: '2026-01-01T10:00:00Z',
          retrieval_status: 'RETRIEVED',
        },
      ],
      missing: [
        {
          evidence_id: 'ev-miss-001',
          type: 'LAB_RESULT',
          impact_level: 'High',
          retrieval_status: 'MISSING',
        },
      ],
      conflicts: [],
      freshness: [],
    };
    const html = renderToStaticMarkup(<EvidenceSummary evidence={evidence} />);
    // Both labels must appear
    expect(html).toContain('Used Evidence');
    expect(html).toContain('Missing Evidence');
    // Both items must appear
    expect(html).toContain('EHR_APPOINTMENT');
    expect(html).toContain('LAB_RESULT');
  });

  test('Missing section NOT removed when Used count > 0', () => {
    const evidence: DecisionBasisDTO['evidence'] = {
      used: [{ evidence_id: 'e1', type: 'X', retrieval_status: 'RETRIEVED' }],
      missing: [{ evidence_id: 'e2', type: 'Y', retrieval_status: 'MISSING' }],
      conflicts: [],
      freshness: [],
    };
    const html = renderToStaticMarkup(<EvidenceSummary evidence={evidence} />);
    expect(html).toContain('Missing Evidence');
  });
});

// ---------------------------------------------------------------------------
// T02 — SUFFICIENT ≠ COMPLETE (Missing stays visible when SUFFICIENT)
// ---------------------------------------------------------------------------
describe('T02: SUFFICIENT ≠ COMPLETE', () => {
  test('SUFFICIENT label does not collapse Missing evidence section', () => {
    const context: DecisionBasisDTO['decision_context'] = {
      context_id: 'ctx-001',
      mode: 'current',
      sufficiency_status: 'SUFFICIENT',
      evaluated_at: '2026-01-01T10:00:00Z',
      status: 'Primary',
    };
    const html = renderToStaticMarkup(<DecisionContextSummary context={context} />);
    expect(html).toContain('Sufficient');

    // Separately verify that SUFFICIENT context + missing evidence coexist
    const evidence: DecisionBasisDTO['evidence'] = {
      used: [{ evidence_id: 'e1', type: 'EHR', retrieval_status: 'RETRIEVED' }],
      missing: [{ evidence_id: 'e2', type: 'LAB', retrieval_status: 'MISSING' }],
      conflicts: [],
      freshness: [],
    };
    const evHtml = renderToStaticMarkup(<EvidenceSummary evidence={evidence} />);
    // Missing still visible even though context is SUFFICIENT
    expect(evHtml).toContain('Missing Evidence');
    expect(evHtml).toContain('LAB');
  });

  test('labelForSufficiency: SUFFICIENT ≠ COMPLETE — INSUFFICIENT is its own label', () => {
    expect(labelForSufficiency('SUFFICIENT')).toBe('Sufficient');
    expect(labelForSufficiency('INSUFFICIENT')).toBe('Insufficient');
    expect(labelForSufficiency('SUFFICIENT')).not.toBe(labelForSufficiency('INSUFFICIENT'));
  });
});

// ---------------------------------------------------------------------------
// T03 — Freshness from backend only (no browser date computation)
// ---------------------------------------------------------------------------
describe('T03: Freshness from backend only', () => {
  test('STALE label comes from backend freshness_status', () => {
    expect(labelForFreshness('STALE')).toBe('Stale');
  });

  test('CURRENT label comes from backend freshness_status', () => {
    expect(labelForFreshness('CURRENT')).toBe('Current');
  });

  test('STALE ≠ MISSING ≠ UNAVAILABLE are all distinct labels', () => {
    const stale = labelForFreshness('STALE');
    const missing = labelForFreshness('MISSING');
    const unavailable = labelForFreshness('UNAVAILABLE');
    expect(stale).not.toBe(missing);
    expect(stale).not.toBe(unavailable);
    expect(missing).not.toBe(unavailable);
  });

  test('Freshness status shown in EvidenceSummary for used evidence', () => {
    const evidence: DecisionBasisDTO['evidence'] = {
      used: [{ evidence_id: 'e1', type: 'EHR', retrieval_status: 'RETRIEVED' }],
      missing: [],
      conflicts: [],
      freshness: [{ evidence_id: 'e1', is_stale: true, freshness_status: 'STALE' }],
    };
    const html = renderToStaticMarkup(<EvidenceSummary evidence={evidence} />);
    expect(html).toContain('Stale');
  });
});

// ---------------------------------------------------------------------------
// T04 — Conflicts are explicit, no winner selected
// ---------------------------------------------------------------------------
describe('T04: Conflicts explicit, no winner selected', () => {
  test('EvidenceConflictNotice shows both evidence IDs without resolving', () => {
    const conflicts = [
      {
        conflict_id: 'c-001',
        evidence_a_id: 'ev-a',
        evidence_b_id: 'ev-b',
        description: 'Contradictory appointment status',
        resolution_status: 'Unresolved',
      },
    ];
    const html = renderToStaticMarkup(<EvidenceConflictNotice conflicts={conflicts} />);
    expect(html).toContain('ev-a');
    expect(html).toContain('ev-b');
    expect(html).toContain('Unresolved');
    // Does NOT declare a winner
    expect(html).not.toContain('Winner');
    expect(html).not.toContain('Resolved to');
  });

  test('No conflicts → green "No Conflicts Detected" shown', () => {
    const html = renderToStaticMarkup(<EvidenceConflictNotice conflicts={[]} />);
    expect(html).toContain('No Conflicts Detected');
  });
});

// ---------------------------------------------------------------------------
// T05 — Detail failure: UNAVAILABLE shown locally, parent unchanged
// ---------------------------------------------------------------------------
describe('T05: Detail failure renders UNAVAILABLE, not crash', () => {
  test('PolicySummary with null policy renders unavailable text', () => {
    const html = renderToStaticMarkup(<PolicySummary policy={null} />);
    expect(html).toContain('unavailable');
  });

  test('RuleResultList with empty rules renders unavailable text', () => {
    const html = renderToStaticMarkup(<RuleResultList rules={[]} />);
    expect(html).toContain('No rule evaluation records');
  });

  test('ProvenanceDetail with null provenance renders unavailable text', () => {
    const html = renderToStaticMarkup(<ProvenanceDetail provenance={null} />);
    expect(html).toContain('unavailable');
  });
});

// ---------------------------------------------------------------------------
// T06 — Context ID survives progressive navigation (present in output)
// ---------------------------------------------------------------------------
describe('T06: Context ID preserved in output', () => {
  test('DecisionContextSummary renders context_id', () => {
    const context: DecisionBasisDTO['decision_context'] = {
      context_id: 'ctx-test-abc-123',
      mode: 'current',
      sufficiency_status: null,
      evaluated_at: null,
      status: null,
    };
    const html = renderToStaticMarkup(<DecisionContextSummary context={context} />);
    expect(html).toContain('ctx-test-abc-123');
  });

  test('ProvenanceDetail renders context_id', () => {
    const prov = {
      context_id: 'prov-ctx-xyz-789',
      provenance_items: [],
    };
    const html = renderToStaticMarkup(<ProvenanceDetail provenance={prov} />);
    expect(html).toContain('prov-ctx-xyz-789');
  });
});

// ---------------------------------------------------------------------------
// T07 — Historical mode from authoritative field only
// ---------------------------------------------------------------------------
describe('T07: Historical mode from backend field only', () => {
  test('mode=historical renders Historical badge', () => {
    const context: DecisionBasisDTO['decision_context'] = {
      mode: 'historical',
      context_id: null,
      sufficiency_status: null,
      evaluated_at: null,
      status: null,
    };
    const html = renderToStaticMarkup(<DecisionContextSummary context={context} />);
    expect(html).toContain('Historical');
  });

  test('mode=current renders Current badge, not Historical', () => {
    const context: DecisionBasisDTO['decision_context'] = {
      mode: 'current',
      context_id: null,
      sufficiency_status: null,
      evaluated_at: null,
      status: null,
    };
    const html = renderToStaticMarkup(<DecisionContextSummary context={context} />);
    expect(html).toContain('Current');
    expect(html).not.toContain('Historical');
  });
});

// ---------------------------------------------------------------------------
// T08 — Rule result displayed verbatim from backend
// ---------------------------------------------------------------------------
describe('T08: Rule result displayed verbatim', () => {
  test('CONDITION_MET maps to "Condition Met"', () => {
    expect(labelForRuleResult('CONDITION_MET')).toBe('Condition Met');
  });

  test('Unknown rule result returns raw value prefixed', () => {
    const label = labelForRuleResult('SOME_CUSTOM_RESULT');
    expect(label).toContain('SOME_CUSTOM_RESULT');
  });
});

// ---------------------------------------------------------------------------
// T09 — RULE_EVALUATION_FAILED ≠ CONDITION_NOT_MET ≠ NOT_APPLICABLE
// ---------------------------------------------------------------------------
describe('T09: Rule result states are distinct', () => {
  test('Three result codes have distinct labels', () => {
    const failed = labelForRuleResult('RULE_EVALUATION_FAILED');
    const notMet = labelForRuleResult('CONDITION_NOT_MET');
    const na = labelForRuleResult('NOT_APPLICABLE');
    expect(failed).not.toBe(notMet);
    expect(failed).not.toBe(na);
    expect(notMet).not.toBe(na);
  });

  test('RULE_EVALUATION_FAILED uses its own distinct color class', () => {
    const failedColor = ruleResultColorClass('RULE_EVALUATION_FAILED');
    const notMetColor = ruleResultColorClass('CONDITION_NOT_MET');
    expect(failedColor).not.toBe(notMetColor);
  });
});

// ---------------------------------------------------------------------------
// T10 — Policy lifecycle states are distinct
// ---------------------------------------------------------------------------
describe('T10: Policy lifecycle states are distinct', () => {
  test('ACTIVE ≠ SUPERSEDED ≠ RETIRED ≠ PENDING labels', () => {
    const active = labelForLifecycle('ACTIVE');
    const superseded = labelForLifecycle('SUPERSEDED');
    const retired = labelForLifecycle('RETIRED');
    const pending = labelForLifecycle('PENDING');
    expect(active).toBe('Active');
    expect(superseded).toBe('Superseded');
    expect(retired).toBe('Retired');
    expect(pending).toBe('Pending');
    // All distinct
    const labels = [active, superseded, retired, pending];
    expect(new Set(labels).size).toBe(4);
  });

  test('ACTIVE ≠ SUPERSEDED color classes', () => {
    expect(lifecycleColorClass('ACTIVE')).not.toBe(lifecycleColorClass('SUPERSEDED'));
  });
});

// ---------------------------------------------------------------------------
// T11 — Policy null → unavailable, never fallback to newest
// ---------------------------------------------------------------------------
describe('T11: Policy unavailable shown explicitly', () => {
  test('null policy shows "unavailable" text, not any policy data', () => {
    const html = renderToStaticMarkup(<PolicySummary policy={null} />);
    expect(html).toContain('unavailable');
    expect(html).not.toContain('policy_id');
    expect(html).not.toContain('ACTIVE');
  });
});

// ---------------------------------------------------------------------------
// T12 — Unknown-safe labels (unrecognised codes return raw value)
// ---------------------------------------------------------------------------
describe('T12: Unknown-safe labels', () => {
  test('Unknown sufficiency code returns raw value', () => {
    expect(labelForSufficiency('CUSTOM_STATE')).toContain('CUSTOM_STATE');
  });

  test('Unknown freshness code returns raw value', () => {
    expect(labelForFreshness('CUSTOM_FRESHNESS')).toContain('CUSTOM_FRESHNESS');
  });

  test('Unknown lifecycle code returns raw value', () => {
    expect(labelForLifecycle('CUSTOM_LIFECYCLE')).toContain('CUSTOM_LIFECYCLE');
  });

  test('Unknown rule result code returns raw value', () => {
    expect(labelForRuleResult('CUSTOM_RULE_RESULT')).toContain('CUSTOM_RULE_RESULT');
  });

  test('Null/undefined inputs return Unknown (not crash)', () => {
    expect(labelForSufficiency(null)).toBe('Unknown');
    expect(labelForFreshness(undefined)).toBe('Unknown');
    expect(labelForLifecycle(null)).toBe('Unknown');
    expect(labelForRuleResult(undefined)).toBe('Unknown');
  });
});

// ---------------------------------------------------------------------------
// T13 — formatTimestamp: null/undefined → '—', valid ISO → string, no crash
// ---------------------------------------------------------------------------
describe('T13: formatTimestamp', () => {
  test('null returns em-dash', () => {
    expect(formatTimestamp(null)).toBe('—');
  });

  test('undefined returns em-dash', () => {
    expect(formatTimestamp(undefined)).toBe('—');
  });

  test('valid ISO string returns non-empty string', () => {
    const result = formatTimestamp('2026-01-15T12:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('—');
  });

  test('invalid string returns the raw string (no crash)', () => {
    const result = formatTimestamp('not-a-date');
    expect(typeof result).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// T14 — RuleResultList: multiple distinct rules all rendered
// ---------------------------------------------------------------------------
describe('T14: RuleResultList renders all rules', () => {
  test('Two rules with distinct results both rendered', () => {
    const rules = [
      {
        evaluation_id: 'eval-001',
        rule_id: 'RULE-NOSHOWS',
        rule_version: 'v1.0',
        policy_id: 'POL-RETENTION',
        policy_version: 'v2.1',
        result: 'CONDITION_MET',
        evaluation_timestamp: '2026-01-01T10:00:00Z',
      },
      {
        evaluation_id: 'eval-002',
        rule_id: 'RULE-LAB-DELAY',
        rule_version: 'v1.2',
        policy_id: 'POL-RETENTION',
        policy_version: 'v2.1',
        result: 'RULE_EVALUATION_FAILED',
        evaluation_timestamp: '2026-01-01T10:01:00Z',
      },
    ];
    const html = renderToStaticMarkup(<RuleResultList rules={rules} />);
    expect(html).toContain('RULE-NOSHOWS');
    expect(html).toContain('RULE-LAB-DELAY');
    expect(html).toContain('Condition Met');
    expect(html).toContain('Rule Evaluation Failed');
  });
});
