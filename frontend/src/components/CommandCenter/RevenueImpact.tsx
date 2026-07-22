import React from 'react';
import { DollarSign, TrendingUp, ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface RevenueImpactProps {
  setActiveTab?: (tab: string) => void;
}

export const RevenueImpact: React.FC<RevenueImpactProps> = ({ setActiveTab }) => {
  const stats = useSelector((state: RootState) => state.signals.stats);
  
  // Calculate dynamic revenue impact
  const preventedLoss = (stats.actionsTaken) * 150;
  const atRisk = Math.max(0, (stats.criticalEvents) * 150 - (stats.actionsTaken) * 150);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[32px] p-6 text-white premium-shadow flex flex-col h-[480px] hover:border-white/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.2)] group">
      
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#EEEAFE]0/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#EEEAFE]0/15 transition-all duration-700"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2.5">
          <span className="p-2 bg-emerald-500/10 rounded-[16px] border border-emerald-500/20 text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </span>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-wide font-extrabold">Revenue Intelligence</span>
            <span className="text-[9px] text-[#10B981] font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping"></span> Real-time Audit Active
            </span>
          </div>
        </h3>
        <button 
          onClick={() => setActiveTab && setActiveTab('revenue')}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-[14px] border border-white/5 hover:border-white/30"
        >
          Detailed Report <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        {/* Prevented Loss */}
        <div className="bg-[#0F172A]/40 border border-emerald-500/15 p-3 rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-950/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-default group/card">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">Prevented Loss</p>
          <p className="text-xl font-black text-[#10B981] mb-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">+${preventedLoss.toLocaleString()}</p>
          <p className="text-[9px] font-bold text-[#10B981] flex items-center gap-1"><TrendingUp className="w-3 h-3 animate-pulse" /> 18% vs yesterday</p>
        </div>

        {/* At Risk Today */}
        <div className="bg-[#0F172A]/40 border border-rose-500/15 p-3 rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/30 hover:bg-rose-950/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-default group/card">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">At Risk Today</p>
          <p className="text-xl font-black text-[#EF4444] mb-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">-${atRisk.toLocaleString()}</p>
          <p className="text-[9px] font-bold text-[#EF4444] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 5% vs yesterday</p>
        </div>

        {/* Optimization */}
        <div className="bg-[#0F172A]/40 border border-[#EEEAFE]0/15 p-3 rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-indigo-950/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-default group/card">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">Optimization</p>
          <p className="text-xl font-black text-[#6366F1] mb-1 drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">{stats.actionsTaken > 0 ? Math.min(99.9, 50 + (stats.actionsTaken) * 0.5).toFixed(1) : "0.0"}%</p>
          <p className="text-[9px] font-bold text-[#10B981] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {(stats.actionsTaken > 0 ? 7 : 0)}% vs yesterday</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 bg-[#070B13] border border-white/5 rounded-[24px] p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Revenue Trend (This Week)</h4>
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-[8px] cursor-pointer transition-colors">
            7 Days <ChevronDown className="w-3 h-3" />
          </span>
        </div>
        
        <div className="relative flex-1 w-full mt-2">
           <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="colorRevenueDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g className="text-slate-500 text-[8px] font-mono">
                 <text x="-5" y="10">$15K</text>
                 <text x="-5" y="60">$10K</text>
                 <text x="-5" y="110">$5K</text>
                 <text x="5" y="130">Mon</text>
                 <text x="70" y="130">Tue</text>
                 <text x="140" y="130">Wed</text>
                 <text x="210" y="130">Thu</text>
                 <text x="280" y="130">Fri</text>
                 <text x="345" y="130">Sat</text>
                 <text x="390" y="130">Sun</text>
                 <line x1="20" y1="10" x2="400" y2="10" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                 <line x1="20" y1="60" x2="400" y2="60" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                 <line x1="20" y1="110" x2="400" y2="110" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
              </g>
              {/* Glowing trend curve */}
              <path d="M20,60 C60,40 100,80 140,70 C180,60 220,90 260,80 C300,70 340,40 400,30 L400,120 L20,120 Z" fill="url(#colorRevenueDark)"/>
              <path d="M20,60 C60,40 100,80 140,70 C180,60 220,90 260,80 C300,70 340,40 400,30" fill="none" stroke="#10B981" strokeWidth="3" filter="url(#chartGlow)" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20,60 C60,40 100,80 140,70 C180,60 220,90 260,80 C300,70 340,40 400,30" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              
              <circle cx="260" cy="80" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" className="animate-pulse" />
              <g transform="translate(230, 42)">
                 <rect width="60" height="24" rx="12" fill="#1E293B" stroke="#10B981" strokeWidth="1" />
                 <text x="30" y="15" fill="#10B981" fontSize="9" fontWeight="black" textAnchor="middle">${preventedLoss.toLocaleString()}</text>
                 <polygon points="30,24 26,28 34,28" fill="#1E293B" transform="rotate(180 30 26)" />
              </g>
           </svg>
        </div>
      </div>

    </div>
  );
};
