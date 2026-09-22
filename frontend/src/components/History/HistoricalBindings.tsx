import React from 'react';
import { HistoricalBindings as BindingsType } from '../../types/history';

interface HistoricalBindingsProps {
    bindings: BindingsType;
}

export const HistoricalBindings: React.FC<HistoricalBindingsProps> = ({ bindings }) => {
    return (
        <div className="bg-[#12121A] border border-white/10 p-4 rounded-xl shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Cryptographic Bindings</h3>
            
            <div className="grid grid-cols-2 gap-4">
                {/* Evidence */}
                <div>
                    <h4 className="text-xs text-white/50 mb-1 uppercase tracking-wider">Evidence</h4>
                    {bindings.evidence_refs.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside">
                            {bindings.evidence_refs.map((e, idx) => (
                                <li key={idx} className="font-mono truncate">{e.evidence_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Policy */}
                <div>
                    <h4 className="text-xs text-white/50 mb-1 uppercase tracking-wider">Policy Version</h4>
                    {bindings.policy ? (
                        <div className="text-xs text-white/80 font-mono">
                            {bindings.policy.policy_id} (v{bindings.policy.policy_version})
                        </div>
                    ) : (
                        <span className="text-white/30 text-xs italic">None</span>
                    )}
                </div>

                {/* Rule Evals */}
                <div>
                    <h4 className="text-xs text-white/50 mb-1 uppercase tracking-wider">Rule Evaluations</h4>
                    {bindings.rule_evaluations.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside">
                            {bindings.rule_evaluations.map((r, idx) => (
                                <li key={idx} className="font-mono truncate">{r.rule_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recommendations */}
                <div>
                    <h4 className="text-xs text-white/50 mb-1 uppercase tracking-wider">Recommendations</h4>
                    {bindings.recommendations.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside">
                            {bindings.recommendations.map((r, idx) => (
                                <li key={idx} className="font-mono truncate">{r.mapping_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Decisions */}
                <div>
                    <h4 className="text-xs text-white/50 mb-1 uppercase tracking-wider">Decisions</h4>
                    {bindings.decisions.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside">
                            {bindings.decisions.map((d, idx) => (
                                <li key={idx} className="font-mono truncate">{d.decision_id}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Actions */}
                <div>
                    <h4 className="text-xs text-white/50 mb-1 uppercase tracking-wider">Actions</h4>
                    {bindings.actions.length === 0 ? (
                        <span className="text-white/30 text-xs italic">None</span>
                    ) : (
                        <ul className="text-xs text-white/80 list-disc list-inside">
                            {bindings.actions.map((a, idx) => (
                                <li key={idx} className="font-mono truncate">{a.action_type}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
