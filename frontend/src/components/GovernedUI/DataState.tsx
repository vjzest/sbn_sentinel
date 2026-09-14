import React from 'react';
import { Loader2, Database, ShieldAlert, FileQuestion } from 'lucide-react';

export type DataStateType = 'loading' | 'empty' | 'unavailable' | 'unauthorized';

interface DataStateProps {
  state: DataStateType;
  message?: string;
  className?: string;
}

export const DataState: React.FC<DataStateProps> = ({ state, message, className = '' }) => {
  let content = null;

  switch (state) {
    case 'loading':
      content = (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-secondary)]">
          <Loader2 className="w-6 h-6 animate-spin mb-2 text-[var(--color-accent)]" />
          <span className="text-xs font-semibold">{message || 'Loading authoritative data...'}</span>
        </div>
      );
      break;
    case 'empty':
      content = (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]">
          <Database className="w-6 h-6 mb-2 opacity-50" />
          <span className="text-xs font-semibold">{message || 'No data found.'}</span>
        </div>
      );
      break;
    case 'unavailable':
      content = (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--color-warning)]">
          <FileQuestion className="w-6 h-6 mb-2 opacity-80" />
          <span className="text-xs font-bold">{message || 'Data unavailable.'}</span>
        </div>
      );
      break;
    case 'unauthorized':
      content = (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--color-semantic-critical)]">
          <ShieldAlert className="w-6 h-6 mb-2 opacity-80" />
          <span className="text-xs font-bold">{message || 'Unauthorized to view this data.'}</span>
        </div>
      );
      break;
  }

  return (
    <div className={`w-full rounded-[16px] border border-[var(--color-semantic-unknown)]/20 bg-[var(--color-surface)] p-4 flex items-center justify-center ${className}`}>
      {content}
    </div>
  );
};
