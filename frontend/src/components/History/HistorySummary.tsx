import React from 'react';
import { HistoricalContextResponse } from '../../types/history';
import { technicalStateBadge, technicalStateLabel } from '../../utils/historyPresentation';

interface HistorySummaryProps {
    context: HistoricalContextResponse;
}

export const HistorySummary: React.FC<HistorySummaryProps> = ({ context }) => {
    return (
        <div className="bg-[#12121A] border border-white/10 p-4 rounded-xl shadow-lg flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-white">Historical Trace Summary</h3>
            
            <div className="flex items-center gap-4 text-xs">
                <span className="text-white/60">Anchor Object:</span>
                <span className="text-white font-mono">{context.anchor.object_type} / {context.anchor.object_id}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
                <span className="text-white/60">Journey ID:</span>
                <span className="text-white font-mono">{context.anchor.journey_id}</span>
            </div>

            <div className="flex items-center gap-4 text-xs mt-2">
                <span className="text-white/60">Technical State:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${technicalStateBadge(context.technical_state)}`}>
                    {technicalStateLabel(context.technical_state)}
                </span>
            </div>
        </div>
    );
};
