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
    blue: { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]', line: '#3B82F6', iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]' },
    green: { bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]', line: '#10B981', iconBg: 'bg-gradient-to-br from-[#10B981] to-[#059669]' },
    red: { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]', line: '#EF4444', iconBg: 'bg-gradient-to-br from-[#F87171] to-[#EF4444]' },
    purple: { bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]', line: '#8B5CF6', iconBg: 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED]' },
  };

  const c = colors[color];

  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-[#E8EDF5] rounded-[24px] p-6 relative overflow-hidden group card-hover premium-shadow flex flex-col justify-between h-[160px] ${onClick ? 'cursor-pointer select-none hover:border-[#6D5DF6]/40' : 'cursor-default'}`}
    >
      
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${c.bg} rounded-[16px] text-white shadow-sm flex items-center justify-center w-12 h-12`}>
            <div className={`absolute inset-0 ${c.iconBg} opacity-20 rounded-[16px]`}></div>
            <Icon className={`w-6 h-6 ${c.text} relative z-10`} />
          </div>
          <div>
            <h3 className="text-[#6B7280] text-[13px] font-bold mb-0.5">{title}</h3>
            <p className="text-[28px] font-extrabold text-[#111827] leading-none">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-end z-10 mt-4">
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-[11px] font-medium text-[#9CA3AF]">vs yesterday</span>
          </div>
        )}
        
        <div className="w-20 h-10 opacity-80">
          <svg viewBox="0 0 120 40" className="w-full h-full preserve-aspect-ratio-none">
            <path d={sparkData} fill="none" stroke={c.line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="120" cy={sparkData.split(' ').pop()?.split(',')[1]} r="4" fill={c.line} />
          </svg>
        </div>
      </div>
    </div>
  );
};
