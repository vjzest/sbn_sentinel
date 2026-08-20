import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

interface StatusIndicatorProps {
  initialStatus?: 'initializing' | 'healthy' | 'degraded' | 'offline';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ initialStatus = 'initializing' }) => {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/health/verify`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'Healthy') {
            setStatus('healthy');
          } else if (data.status === 'Degraded') {
            setStatus('degraded');
          } else {
            setStatus('offline');
          }
        } else {
          setStatus('offline');
        }
      } catch (err) {
        setStatus('offline');
      }
    };

    // Initial check
    checkHealth();

    // Poll every 10 seconds
    intervalId = setInterval(checkHealth, 10000);

    return () => clearInterval(intervalId);
  }, []);

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

      {status === 'degraded' && (
        <>
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#F59E0B]"></div>
          <span className="text-amber-500 font-semibold tracking-wide">Degraded</span>
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
