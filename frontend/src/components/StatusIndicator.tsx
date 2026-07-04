import React from 'react';

interface StatusIndicatorProps {
  status: 'initializing' | 'healthy' | 'offline';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  return (
    <div className="inline-flex items-center gap-3 bg-black/40 px-6 py-3 rounded-full border border-white/5 shadow-inner">
      {status === 'initializing' && (
        <>
          <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sky-400 font-semibold tracking-wide">Initializing...</span>
        </>
      )}
      
      {status === 'healthy' && (
        <>
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]"></div>
          <span className="text-emerald-500 font-semibold tracking-wide">Healthy</span>
        </>
      )}

      {status === 'offline' && (
        <>
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#F43F5E]"></div>
          <span className="text-rose-500 font-semibold tracking-wide">Offline</span>
        </>
      )}
    </div>
  );
};
