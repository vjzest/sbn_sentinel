import React from 'react';
import { ReproductionResult } from '../../types/history';

interface DiagnosticDetailProps {
    diagnostic: NonNullable<ReproductionResult['diagnostic']>;
}

export const DiagnosticDetail: React.FC<DiagnosticDetailProps> = ({ diagnostic }) => {
    return (
        <div className="bg-[var(--color-semantic-critical)]/[0.05] border border-[var(--color-semantic-critical)]/20 p-5 rounded-xl shadow-lg backdrop-blur-sm mt-4 relative overflow-hidden group transition-all hover:bg-[var(--color-semantic-critical)]/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-semantic-critical)]/10 to-[var(--color-semantic-critical)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h4 className="text-sm font-semibold text-[var(--color-semantic-critical)] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[var(--color-semantic-critical)] rounded-full" />
                Diagnostic Failure
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs ps-3 border-s-2 border-[var(--color-semantic-critical)]/30 ms-0.5">
                <div className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--color-semantic-critical)]/70 uppercase tracking-widest font-bold">Stage</span>
                    <span className="text-white font-mono">{diagnostic.stage}</span>
                </div>
                <div className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--color-semantic-critical)]/70 uppercase tracking-widest font-bold">Error Code</span>
                    <span className="text-white font-mono">{diagnostic.code}</span>
                </div>
                {diagnostic.missing_dependency && (
                    <div className="col-span-1 md:col-span-2 mt-2 bg-black/20 border border-white/5 p-3 rounded-lg">
                        <span className="text-[10px] text-[var(--color-semantic-critical)]/70 uppercase tracking-widest font-bold block mb-2">Missing Dependency Details</span>
                        <pre className="bg-black/40 border border-white/5 p-3 rounded text-[10px] text-white/80 overflow-auto max-h-40 shadow-inner">
                            {JSON.stringify(diagnostic.missing_dependency, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};
