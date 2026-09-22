import React from 'react';
import { HistoricalBindings as BindingsType } from '../../types/history';

interface HistoricalBindingsProps {
    bindings: BindingsType;
}

export const HistoricalBindings: React.FC<HistoricalBindingsProps> = ({ bindings }) => {
    return (
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-6 relative overflow-hidden group transition-all hover:bg-white/[0.04]">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                Cryptographic Bindings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Evidence */}
                <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Evidence</h4>
                    {bindings.evidence_refs.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside space-y-1">
                            {bindings.evidence_refs.map((e, idx) => (
                                <li key={idx} className="font-mono text-emerald-200/80 truncate" title={e.evidence_id}>{e.evidence_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Policy */}
                <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Policy Version</h4>
                    {bindings.policy ? (
                        <div className="text-xs text-emerald-200/80 font-mono truncate" title={`${bindings.policy.policy_id} (v${bindings.policy.policy_version})`}>
                            {bindings.policy.policy_id} <span className="text-white/40">(v{bindings.policy.policy_version})</span>
                        </div>
                    ) : (
                        <span className="text-white/30 text-xs italic">None</span>
                    )}
                </div>

                {/* Rule Evals */}
                <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Rule Evaluations</h4>
                    {bindings.rule_evaluations.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside space-y-1">
                            {bindings.rule_evaluations.map((r, idx) => (
                                <li key={idx} className="font-mono text-emerald-200/80 truncate" title={r.rule_id}>{r.rule_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recommendations */}
                <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Recommendations</h4>
                    {bindings.recommendations.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside space-y-1">
                            {bindings.recommendations.map((r, idx) => (
                                <li key={idx} className="font-mono text-emerald-200/80 truncate" title={r.mapping_id}>{r.mapping_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Decisions */}
                <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Decisions</h4>
                    {bindings.decisions.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside space-y-1">
                            {bindings.decisions.map((d, idx) => (
                                <li key={idx} className="font-mono text-emerald-200/80 truncate" title={d.decision_id}>{d.decision_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Actions</h4>
                    {bindings.actions.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside space-y-1">
                            {bindings.actions.map((a, idx) => (
                                <li key={idx} className="font-mono text-emerald-200/80 truncate" title={a.action_type}>{a.action_type}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
