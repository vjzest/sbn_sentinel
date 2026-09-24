import React from 'react';
import { HistoricalBindings } from '../../types/history';
import { formatDateTime } from '../../utils/historyPresentation';

interface AuditTimelineProps {
    bindings: HistoricalBindings;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ bindings }) => {
    return (
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-md mt-4 relative overflow-hidden group transition-all hover:bg-white/[0.04]">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <h3 className="text-base font-semibold text-white mb-6 tracking-wide flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                Lifecycle Audit Timeline
            </h3>
            
            <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pb-2">
                
                {/* 1. Evidence */}
                {bindings.evidence_refs.length > 0 && (
                    <div className="relative pl-8 group/item">
                        <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 border-4 border-[#12121A] shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-transform group-hover/item:scale-125"></div>
                        <h4 className="text-sm font-semibold text-white tracking-wide">Evidence Received</h4>
                        <div className="mt-2 space-y-2">
                            {bindings.evidence_refs.map(e => (
                                <div key={e.evidence_id} className="bg-black/20 border border-white/5 p-2 rounded-lg text-xs text-blue-200/80 font-mono shadow-inner hover:bg-black/40 transition-colors break-all">
                                    {e.version ? `${e.evidence_id} / REV-${e.version}` : e.evidence_id}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Rule Evaluation */}
                {bindings.rule_evaluations.length > 0 && (
                    <div className="relative pl-8 group/item">
                        <div className="absolute w-4 h-4 bg-purple-500 rounded-full -left-[9px] top-1 border-4 border-[#12121A] shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-transform group-hover/item:scale-125"></div>
                        <h4 className="text-sm font-semibold text-white tracking-wide">Policy Evaluation</h4>
                        <div className="mt-2 space-y-2">
                            {bindings.rule_evaluations.map(r => (
                                <div key={r.evaluation_id} className="bg-black/20 border border-white/5 p-3 rounded-lg text-xs text-white/80 shadow-inner hover:bg-black/40 transition-colors flex flex-col gap-1">
                                    <div className="font-mono text-purple-300 font-medium break-all">{r.rule_id} <span className="text-white/40">(v{r.rule_version})</span></div>
                                    <div className="text-white/40 text-[10px] uppercase tracking-widest">{formatDateTime(r.evaluated_at)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Recommendation */}
                {bindings.recommendations.length > 0 && (
                    <div className="relative pl-8 group/item">
                        <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-1 border-4 border-[#12121A] shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-transform group-hover/item:scale-125"></div>
                        <h4 className="text-sm font-semibold text-white tracking-wide">Recommendation Generated</h4>
                        <div className="mt-2 space-y-2">
                            {bindings.recommendations.map(r => (
                                <div key={r.recommendation_id} className="bg-black/20 border border-white/5 p-3 rounded-lg text-xs text-white/80 shadow-inner hover:bg-black/40 transition-colors flex flex-col gap-1">
                                    <div className="font-mono text-emerald-300 font-medium break-all">{r.mapping_id} <span className="text-white/40">(v{r.mapping_version})</span></div>
                                    <div className="text-white/40 text-[10px] uppercase tracking-widest">{formatDateTime(r.generated_at)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Decision */}
                {bindings.decisions.length > 0 && (
                    <div className="relative pl-8 group/item">
                        <div className="absolute w-4 h-4 bg-amber-500 rounded-full -left-[9px] top-1 border-4 border-[#12121A] shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-transform group-hover/item:scale-125"></div>
                        <h4 className="text-sm font-semibold text-white tracking-wide">Human Decision</h4>
                        <div className="mt-2 space-y-2">
                            {bindings.decisions.map(d => (
                                <div key={d.decision_id} className="bg-black/20 border border-white/5 p-3 rounded-lg text-xs text-white/80 shadow-inner hover:bg-black/40 transition-colors flex flex-col gap-1">
                                    <div className="font-mono text-amber-300 font-medium">{d.decision_type} <span className="text-white/60">by {d.actor_id}</span></div>
                                    <div className="text-white/40 text-[10px] uppercase tracking-widest">{formatDateTime(d.timestamp)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Actions */}
                {bindings.actions.length > 0 && (
                    <div className="relative pl-8 group/item">
                        <div className="absolute w-4 h-4 bg-sky-500 rounded-full -left-[9px] top-1 border-4 border-[#12121A] shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-transform group-hover/item:scale-125"></div>
                        <h4 className="text-sm font-semibold text-white tracking-wide">Operational Action</h4>
                        <div className="mt-2 space-y-2">
                            {bindings.actions.map(a => (
                                <div key={a.action_id} className="bg-black/20 border border-white/5 p-3 rounded-lg text-xs text-white/80 shadow-inner hover:bg-black/40 transition-colors flex flex-col gap-1">
                                    <div className="font-mono text-sky-300 font-medium break-all">{a.action_type} <span className="text-white/60">- {a.status}</span></div>
                                    {a.current_result && <div className="text-white/50 text-[10px] break-all">Result: {a.current_result}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Execution Attempts */}
                {bindings.actions.some(a => a.attempts && a.attempts.length > 0) && (
                    <div className="relative pl-8 group/item">
                        <div className="absolute w-4 h-4 bg-cyan-500 rounded-full -left-[9px] top-1 border-4 border-[#12121A] shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-transform group-hover/item:scale-125"></div>
                        <h4 className="text-sm font-semibold text-white tracking-wide">Execution Attempt(s)</h4>
                        <div className="mt-2 space-y-2">
                            {bindings.actions.flatMap(a => (a.attempts || []).map(att => (
                                <div key={att.attempt_id} className="bg-black/20 border border-white/5 p-3 rounded-lg text-xs text-white/80 shadow-inner hover:bg-black/40 transition-colors flex flex-col gap-1">
                                    <div className="font-mono text-cyan-300 font-medium">
                                        Attempt {att.attempt_number ?? 1}: <span className="text-white/80">{att.result}</span>
                                    </div>
                                    <div className="text-white/40 text-[10px] font-mono break-all">{att.attempt_id}</div>
                                </div>
                            )))}
                        </div>
                    </div>
                )}

                {/* 7. Outcome */}
                {bindings.actions.some(a => a.outcome) && (
                    <div className="relative pl-8 group/item">
                        <div className="absolute w-4 h-4 bg-teal-500 rounded-full -left-[9px] top-1 border-4 border-[#12121A] shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-transform group-hover/item:scale-125"></div>
                        <h4 className="text-sm font-semibold text-white tracking-wide">Outcome</h4>
                        <div className="mt-2 space-y-2">
                            {bindings.actions.map(a => a.outcome ? (
                                <div key={a.outcome.outcome_id} className="bg-black/20 border border-white/5 p-3 rounded-lg text-xs text-white/80 shadow-inner hover:bg-black/40 transition-colors flex flex-col gap-1">
                                    <div className="font-mono text-teal-300 font-medium">
                                        {a.outcome.confirmation_state} / {a.outcome.resolution_state}
                                    </div>
                                    <div className="text-white/40 text-[10px] font-mono break-all">{a.outcome.outcome_id}</div>
                                </div>
                            ) : null)}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
