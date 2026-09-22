import React from 'react';
import { DiagnosticReference } from './DiagnosticReference';

interface FailureNoticeProps {
  title: string;
  affected: string;
  available: string;
  timestamp?: string | null;
  referenceId?: string | null;
  onRetry?: () => void;
}

/**
 * D7 Contract: Bounded failure presentation; reusable across capability/object scope.
 */
export const FailureNotice: React.FC<FailureNoticeProps> = ({
  title,
  affected,
  available,
  timestamp,
  referenceId,
  onRetry
}) => {
  return (
    <div className="border border-red-300 bg-red-50 p-4 rounded-md my-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-red-800 font-semibold text-sm uppercase tracking-wider">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p><span className="font-medium">Affected:</span> {affected}</p>
            <p className="mt-1"><span className="font-medium">Available:</span> {available}</p>
          </div>
          <DiagnosticReference timestamp={timestamp} referenceId={referenceId} />
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-xs bg-white border border-red-300 text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
