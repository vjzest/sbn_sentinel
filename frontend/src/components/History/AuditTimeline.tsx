import React from 'react';
import { HistoricalBindings } from '../../types/history';
import { formatDateTime } from '../../utils/historyPresentation';

interface AuditTimelineProps {
    bindings: HistoricalBindings;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ bindings }) => {
    // Flatten all events into a single array to sort by time, if timestamps exist.
    // However, some bindings only have 'evaluated_at', 'generated_at', 'timestamp'.
    // We can just display them in a logical lifecycle order instead of strict time order
    // if time order is complex, but let's do a logical sequence:
    // Evidence -> Policy -> Eval -> Rec -> Decision -> Action

    return (
        <div className="bg-[#12121A] border border-white/10 p-4 rounded-xl shadow-lg mt-4">
            <h3 className="text-sm font-semibold text-white mb-4">Lifecycle Audit Timeline</h3>
            
            <div className="relative border-l border-white/10 ml-3 space-y-6">
                
                {/* 1. Evidence */}
                {bindings.evidence_refs.length > 0 && (
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1 border-2 border-[#12121A]"></div>
                        <h4 className="text-xs font-semibold text-white">Evidence Received</h4>
                        <div className="mt-1 space-y-1">
                            {bindings.evidence_refs.map(e => (
                                <div key={e.evidence_id} className="text-[10px] text-white/60 font-mono">
                                    {e.evidence_id}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Rule Evaluation */}
                {bindings.rule_evaluations.length > 0 && (
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[6.5px] top-1 border-2 border-[#12121A]"></div>
                        <h4 className="text-xs font-semibold text-white">Policy Evaluation</h4>
                        <div className="mt-1 space-y-2">
                            {bindings.rule_evaluations.map(r => (
                                <div key={r.evaluation_id} className="bg-white/5 p-2 rounded text-[10px] text-white/80">
                                    <div className="font-mono text-purple-400 mb-1">{r.rule_id} (v{r.rule_version})</div>
                                    <div className="text-white/50">{formatDateTime(r.evaluated_at)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Recommendation */}
                {bindings.recommendations.length > 0 && (
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[6.5px] top-1 border-2 border-[#12121A]"></div>
                        <h4 className="text-xs font-semibold text-white">Recommendation Generated</h4>
                        <div className="mt-1 space-y-2">
                            {bindings.recommendations.map(r => (
                                <div key={r.recommendation_id} className="bg-white/5 p-2 rounded text-[10px] text-white/80">
                                    <div className="font-mono text-emerald-400 mb-1">{r.mapping_id} (v{r.mapping_version})</div>
                                    <div className="text-white/50">{formatDateTime(r.generated_at)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Decision */}
                {bindings.decisions.length > 0 && (
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[6.5px] top-1 border-2 border-[#12121A]"></div>
                        <h4 className="text-xs font-semibold text-white">Human Decision</h4>
                        <div className="mt-1 space-y-2">
                            {bindings.decisions.map(d => (
                                <div key={d.decision_id} className="bg-white/5 p-2 rounded text-[10px] text-white/80">
                                    <div className="font-mono text-amber-400 mb-1">{d.decision_type} by {d.actor_id}</div>
                                    <div className="text-white/50">{formatDateTime(d.timestamp)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Actions */}
                {bindings.actions.length > 0 && (
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-sky-500 rounded-full -left-[6.5px] top-1 border-2 border-[#12121A]"></div>
                        <h4 className="text-xs font-semibold text-white">Operational Action</h4>
                        <div className="mt-1 space-y-2">
                            {bindings.actions.map(a => (
                                <div key={a.action_id} className="bg-white/5 p-2 rounded text-[10px] text-white/80">
                                    <div className="font-mono text-sky-400 mb-1">{a.action_type} - {a.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
