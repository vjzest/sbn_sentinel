import React from 'react';
import { mapGovernedState } from '@/utils/governedPresentation';
import { AlertCircle } from 'lucide-react';

interface CriticalStateBannerProps {
  state: string;
  reason?: string;
}

export const CriticalStateBanner: React.FC<CriticalStateBannerProps> = ({ state, reason }) => {
  const presentation = mapGovernedState(state);

  if (!presentation.critical) {
    return null;
  }

  return (
    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-[12px] flex items-start gap-3 my-2" role="alert">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">{presentation.label}</h4>
        {reason && (
          <p className="text-xs text-red-300 mt-1 font-semibold">{reason}</p>
        )}
      </div>
    </div>
  );
};
