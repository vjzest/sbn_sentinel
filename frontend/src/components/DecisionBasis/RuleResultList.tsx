/**
 * D4 — RuleResultList
 * Displays backend rule evaluation records verbatim.
 * RULES:
 *   - result is displayed as-is from backend (T08) — never recomputed
 *   - RULE_EVALUATION_FAILED ≠ CONDITION_NOT_MET ≠ NOT_APPLICABLE (T09)
 *   - Policy/rule version pairs shown for traceability
 */
import React from 'react';
import type { RuleBasisDTO } from '@/types/decisionBasis';
import {
  labelForRuleResult,
  ruleResultColorClass,
  formatTimestamp,
} from '@/utils/decisionBasisPresentation';

interface RuleResultListProps {
  rules: RuleBasisDTO[];
}

export const RuleResultList: React.FC<RuleResultListProps> = ({ rules }) => {
  if (rules.length === 0) {
    return (
      <section aria-labelledby="rule-result-title" className="space-y-2">
        <h3
          id="rule-result-title"
          className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
        >
          Rule Evaluations
        </h3>
        <p className="text-[11px] text-white/40 font-semibold italic">
          No rule evaluation records available for this signal.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="rule-result-title" className="space-y-3">
      <h3
        id="rule-result-title"
        className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
      >
        Rule Evaluations
      </h3>

      <ul className="space-y-2">
        {rules.map((rule) => (
          <li
            key={rule.evaluation_id}
            className="p-3 bg-white/5 border border-white/10 rounded-[12px] space-y-2"
          >
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white">
                  {rule.rule_id}
                  <span className="ml-1.5 text-white/40 font-mono text-[10px]">
                    / {rule.rule_version}
                  </span>
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">
                  Policy: {rule.policy_id} / {rule.policy_version}
                </p>
              </div>
              {/* Result — displayed verbatim, never recomputed (T08, T09) */}
              <span
                className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] border ${ruleResultColorClass(
                  rule.result,
                )}`}
                aria-label={`Rule result: ${labelForRuleResult(rule.result)}`}
              >
                {labelForRuleResult(rule.result)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-white/40">
              <span>Eval ID: {rule.evaluation_id}</span>
              {rule.evaluation_timestamp && (
                <span>{formatTimestamp(rule.evaluation_timestamp)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
