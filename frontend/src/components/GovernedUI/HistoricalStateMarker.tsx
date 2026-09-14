import React from 'react';
import { History } from 'lucide-react';
import { GovernedStatus } from './GovernedStatus';
interface HistoricalStateMarkerProps {
  isHistorical: boolean;
  stateAtTime: string;
  currentState?: string;
  timestamp: string;
}
export const HistoricalStateMarker: React.FC<HistoricalStateMarkerProps> = ({
  isHistorical,
  stateAtTime,
  currentState,
  timestamp
}) => {
  if (!isHistorical) {
    return null;
  }
  return (
    <div className="border border-[var(--color-semantic-unknown)]/30 bg-[var(--color-semantic-unknown)]/10 rounded-[12px] p-3 text-[var(--color-text-secondary)] my-2">
      <div className="flex items-center gap-2 mb-2">
        <History className="w-4 h-4 text-[var(--color-semantic-unknown)] opacity-80" />
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-semantic-unknown)]">Historical Snapshot</span>
      </div>
      <div className="flex items-center gap-4 text-xs font-semibold">
        <div>
          <span className="text-slate-500 uppercase tracking-wide text-[10px] block mb-1">State at {new Date(timestamp).toLocaleString()}</span>
          <GovernedStatus state={stateAtTime} className="bg-transparent border-slate-500/50" />
        </div>
        {currentState && currentState !== stateAtTime && (
          <div>
            <span className="text-slate-500 uppercase tracking-wide text-[10px] block mb-1">Current State</span>
            <GovernedStatus state={currentState} />
          </div>
        )}
      </div>
    </div>
  );
};
