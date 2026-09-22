import React from 'react';
import { ReproductionResult } from '../../types/history';

interface DiagnosticDetailProps {
    diagnostic: NonNullable<ReproductionResult['diagnostic']>;
}

export const DiagnosticDetail: React.FC<DiagnosticDetailProps> = ({ diagnostic }) => {
    return (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mt-4">
            <h4 className="text-sm font-semibold text-red-400 mb-2">Diagnostic Failure</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                    <span className="text-red-400/70 block mb-1">Stage</span>
                    <span className="text-white font-mono">{diagnostic.stage}</span>
                </div>
                <div>
                    <span className="text-red-400/70 block mb-1">Error Code</span>
                    <span className="text-white font-mono">{diagnostic.code}</span>
                </div>
                {diagnostic.missing_dependency && (
                    <div className="col-span-2 mt-2">
                        <span className="text-red-400/70 block mb-1">Missing Dependency Details</span>
                        <pre className="bg-black/40 p-2 rounded text-[10px] text-white/80 overflow-auto max-h-32">
                            {JSON.stringify(diagnostic.missing_dependency, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};
