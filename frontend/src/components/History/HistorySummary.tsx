import React from 'react';
import { HistoricalContextResponse } from '../../types/history';
import { technicalStateBadge, technicalStateLabel } from '../../utils/historyPresentation';

interface HistorySummaryProps {
    context: HistoricalContextResponse;
}

export const HistorySummary: React.FC<HistorySummaryProps> = ({ context }) => {
    return (
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-4 relative overflow-hidden group transition-all hover:bg-white/[0.04]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                Historical Trace Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Anchor Object</span>
                    <span className="text-sm text-indigo-200 font-mono">{context.anchor.object_type} / {context.anchor.object_id}</span>
                </div>
                
                <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Journey ID</span>
                    <span className="text-sm text-indigo-200 font-mono truncate" title={context.anchor.journey_id}>{context.anchor.journey_id}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-2 p-3 bg-black/20 rounded-xl border border-white/5">
                <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Technical State</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${technicalStateBadge(context.technical_state)}`}>
                    {technicalStateLabel(context.technical_state)}
                </span>
            </div>
        </div>
    );
};
