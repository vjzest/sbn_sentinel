import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { GovernedStatus } from '@/components/GovernedUI/GovernedStatus';

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
    <div className="inline-flex items-center bg-black/40 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
      <GovernedStatus state={status.toUpperCase()} />
    </div>
  );
};
