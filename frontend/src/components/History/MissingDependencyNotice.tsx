import React from 'react';
import { ReproductionResult } from '../../types/history';

interface MissingDependencyNoticeProps {
    diagnostic: NonNullable<ReproductionResult['diagnostic']>;
}

export const MissingDependencyNotice: React.FC<MissingDependencyNoticeProps> = ({ diagnostic }) => {
    if (diagnostic.code !== 'MISSING_POLICY' && diagnostic.code !== 'MISSING_RULE') return null;

    return (
        <div className="bg-red-500/[0.05] border border-red-500/20 p-5 rounded-xl shadow-lg backdrop-blur-sm mt-4 relative overflow-hidden group transition-all hover:bg-red-500/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Missing Dependency: {diagnostic.code === 'MISSING_POLICY' ? 'Policy' : 'Rule'}
            </h4>
            <div className="text-xs text-white/70 pl-7 border-l-2 border-red-500/30 ml-[9px]">
                <p className="mb-3">
                    The reproduction engine could not execute because a required governance artifact is missing from the active registry.
                    It may have been permanently deleted or incorrectly archived.
                </p>
                <div className="bg-black/30 border border-white/5 p-3 rounded-lg text-[10px] text-red-200/80 font-mono shadow-inner flex flex-col gap-1 inline-block">
                    <div><span className="text-red-400/50 uppercase tracking-widest">Dependency ID:</span> {diagnostic.missing_dependency?.id || 'Unknown'}</div>
                    <div><span className="text-red-400/50 uppercase tracking-widest">Version:</span> {diagnostic.missing_dependency?.version || 'Unknown'}</div>
                </div>
            </div>
        </div>
    );
};
