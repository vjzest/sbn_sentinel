import React from 'react';

interface DiagnosticReferenceProps {
  referenceId: string | null | undefined;
  timestamp: string | null | undefined;
}

/**
 * D7 Contract: Safe correlation/reference display.
 * Never expose raw payload, tokens, or stack traces to the user.
 */
export const DiagnosticReference: React.FC<DiagnosticReferenceProps> = ({ referenceId, timestamp }) => {
  if (!referenceId && !timestamp) return null;

  return (
    <div className="mt-2 text-xs text-gray-500 font-mono flex items-center gap-2">
      {timestamp && (
        <span>Last confirmed: {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      )}
      {timestamp && referenceId && <span className="text-gray-300">|</span>}
      {referenceId && <span>Ref: {referenceId}</span>}
    </div>
  );
};
