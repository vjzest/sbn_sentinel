import React from 'react';
import { ReproductionResult } from '../../types/history';

interface MissingDependencyNoticeProps {
    diagnostic: NonNullable<ReproductionResult['diagnostic']>;
}

export const MissingDependencyNotice: React.FC<MissingDependencyNoticeProps> = ({ diagnostic }) => {
    if (diagnostic.code !== 'MISSING_POLICY' && diagnostic.code !== 'MISSING_RULE') return null;

    return (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mt-4">
            <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Missing Dependency: {diagnostic.code === 'MISSING_POLICY' ? 'Policy' : 'Rule'}
            </h4>
            <p className="text-xs text-white/80 mb-2">
                The reproduction engine could not execute because a required governance artifact is missing from the active registry.
                It may have been permanently deleted or incorrectly archived.
            </p>
            <div className="bg-black/40 p-2 rounded text-[10px] text-white/70 font-mono">
                Dependency ID: {diagnostic.missing_dependency?.id || 'Unknown'}
                <br />
                Version: {diagnostic.missing_dependency?.version || 'Unknown'}
            </div>
        </div>
    );
};
