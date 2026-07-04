import React from 'react';

interface RadarAnimationProps {
  status: 'initializing' | 'healthy' | 'offline';
}

export const RadarAnimation: React.FC<RadarAnimationProps> = ({ status }) => {
  return (
    <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
      <div className="absolute inset-0 border border-sky-400/30 rounded-full animate-ping"></div>
      <div className="absolute inset-2 border border-sky-400/50 rounded-full animate-pulse"></div>
      <div className="absolute inset-4 bg-sky-400/20 rounded-full blur-sm"></div>
      
      {/* Core dot */}
      <div className={`w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] transition-colors duration-500 ${
        status === 'initializing' ? 'bg-sky-400 text-sky-400 animate-pulse' :
        status === 'healthy' ? 'bg-emerald-500 text-emerald-500' :
        'bg-rose-500 text-rose-500'
      }`}></div>
    </div>
  );
};
