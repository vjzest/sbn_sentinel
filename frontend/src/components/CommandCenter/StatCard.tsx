import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'red' | 'purple';
  sparkData: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, color, sparkData, onClick }) => {
  const colors = {
    blue: { bg: 'bg-[#3B82F6]/20', text: 'text-[#60A5FA]', line: '#60A5FA', iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]' },
    green: { bg: 'bg-[#10B981]/20', text: 'text-[#34D399]', line: '#34D399', iconBg: 'bg-gradient-to-br from-[#10B981] to-[#059669]' },
    red: { bg: 'bg-[#EF4444]/20', text: 'text-[#F87171]', line: '#F87171', iconBg: 'bg-gradient-to-br from-[#F87171] to-[#EF4444]' },
    purple: { bg: 'bg-[#A78BFA]/20', text: 'text-[#C4B5FD]', line: '#C4B5FD', iconBg: 'bg-gradient-to-br from-[#A78BFA] to-[#120524]' },
  };

  const c = colors[color];

  return (
    <div 
      onClick={onClick}
      className={`bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 relative overflow-hidden group card-hover shadow-[0_8px_30px_rgba(46,16,85,0.4)] flex flex-col justify-between h-[160px] ${onClick ? 'cursor-pointer select-none hover:border-white/30 hover:-translate-y-1 transition-all duration-300' : 'cursor-default'}`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${c.bg} rounded-[16px] text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] flex items-center justify-center w-12 h-12 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
            <div className={`absolute inset-0 ${c.iconBg} opacity-20 rounded-[16px]`}></div>
            <Icon className={`w-6 h-6 ${c.text} relative z-10 drop-shadow-md`} />
          </div>
          <div>
            <h3 className="text-white/60 text-[12px] uppercase font-black mb-1 tracking-[0.1em]">{title}</h3>
            <p className="text-[28px] font-extrabold text-white leading-none tracking-tight">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-end z-10 mt-4">
        {trend && (
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${trendUp ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30' : 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">vs yesterday</span>
          </div>
        )}
        
        <div className="w-20 h-10 opacity-90 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
          <svg viewBox="0 0 120 40" className="w-full h-full preserve-aspect-ratio-none">
            <path d={sparkData} fill="none" stroke={c.line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="120" cy={sparkData.split(' ').pop()?.split(',')[1]} r="4" fill={c.line} className="animate-pulse shadow-[0_0_10px_currentColor]" />
          </svg>
        </div>
      </div>
    </div>
  );
};
