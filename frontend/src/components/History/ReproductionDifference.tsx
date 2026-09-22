import React from 'react';
import { ReproductionResult } from '../../types/history';

interface ReproductionDifferenceProps {
    differences: any[];
}

export const ReproductionDifference: React.FC<ReproductionDifferenceProps> = ({ differences }) => {
    if (!differences || differences.length === 0) return null;

    return (
        <div className="bg-amber-500/[0.05] border border-amber-500/20 p-5 rounded-xl shadow-lg backdrop-blur-sm mt-4 relative overflow-hidden group transition-all hover:bg-amber-500/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                Reproduction Differences
            </h4>
            <div className="text-xs text-white/70 pl-3 border-l-2 border-amber-500/30 ml-0.5">
                <p className="mb-3">The reproduced recommendation did not exactly match the original record. Details:</p>
                <ul className="space-y-2">
                    {differences.map((diff, idx) => (
                        <li key={idx} className="font-mono text-[10px] bg-black/30 border border-white/5 p-3 rounded-lg shadow-inner text-amber-200/80 break-all">
                            {typeof diff === 'string' ? diff : JSON.stringify(diff, null, 2)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
