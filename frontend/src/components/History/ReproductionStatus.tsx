import React from 'react';
import { ReproductionResult } from '../../types/history';
import { reproductionStatusBadge, reproductionStatusLabel } from '../../utils/historyPresentation';

interface ReproductionStatusProps {
    result: ReproductionResult;
}

export const ReproductionStatus: React.FC<ReproductionStatusProps> = ({ result }) => {
    return (
        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur-md flex flex-col gap-3 mt-4 transition-all hover:bg-white/[0.04]">
            <h3 className="text-base font-semibold text-white flex justify-between items-center tracking-wide">
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                    Reproduction Verification
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${reproductionStatusBadge(result.status)}`}>
                    {reproductionStatusLabel(result.status)}
                </span>
            </h3>
            <p className="text-sm text-white/50 pl-3 border-l-2 border-white/10 ml-0.5">
                This process re-runs the exact policy rules against the historical input context to verify deterministic output.
            </p>
        </div>
    );
};
