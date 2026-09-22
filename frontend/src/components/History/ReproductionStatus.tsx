import React from 'react';
import { ReproductionResult } from '../../types/history';
import { reproductionStatusBadge, reproductionStatusLabel } from '../../utils/historyPresentation';

interface ReproductionStatusProps {
    result: ReproductionResult;
}

export const ReproductionStatus: React.FC<ReproductionStatusProps> = ({ result }) => {
    return (
        <div className="bg-[#12121A] border border-white/10 p-4 rounded-xl shadow-lg flex flex-col gap-2 mt-4">
            <h3 className="text-sm font-semibold text-white flex justify-between items-center">
                Reproduction Verification
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${reproductionStatusBadge(result.status)}`}>
                    {reproductionStatusLabel(result.status)}
                </span>
            </h3>
            <p className="text-xs text-white/60">
                This process re-runs the exact policy rules against the historical input context to verify deterministic output.
            </p>
        </div>
    );
};
