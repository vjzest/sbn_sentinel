import React from 'react';
import { ReproductionResult } from '../../types/history';

interface ReproductionDifferenceProps {
    differences: any[];
}

export const ReproductionDifference: React.FC<ReproductionDifferenceProps> = ({ differences }) => {
    if (!differences || differences.length === 0) return null;

    return (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl mt-4">
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Reproduction Differences</h4>
            <div className="text-xs text-white/80">
                <p className="mb-2">The reproduced recommendation did not exactly match the original record. Details:</p>
                <ul className="list-disc list-inside space-y-1">
                    {differences.map((diff, idx) => (
                        <li key={idx} className="font-mono text-[10px] bg-black/40 p-2 rounded">
                            {typeof diff === 'string' ? diff : JSON.stringify(diff)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
