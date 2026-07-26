import React, { useState } from 'react';
import { Shield, Activity, FileText, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, RefreshCw, ChevronRight, Server, Database } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { acknowledgeSignal, SignalEvent } from '@/store/slices/signalSlice';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const ExecutiveDashboardView: React.FC<Props> = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const signals = useSelector((state: RootState) => state.signals.events);
  const isConnected = useSelector((state: RootState) => state.signals.isConnected);

  const [filter, setFilter] = useState<'all' | 'critical' | 'revenue'>('all');

  // Computed Metrics
  const activeSignals = signals.filter(s => s.status !== 'acknowledged');
  const criticalIssuesCount = activeSignals.filter(s => s.risk_level === 'Critical' || s.risk_level === 'High').length;
  
  // Calculate revenue at risk (just a simple parser for demo)
  const revenueAtRisk = activeSignals.reduce((acc, curr) => {
    if (curr.estimated_financial_exposure) {
      const match = curr.estimated_financial_exposure.match(/\$(\d+)/);
      if (match) acc += parseInt(match[1]);
    }
    return acc;
  }, 0);

  // Group decision contexts for the chart/summary
  const contextCounts = activeSignals.reduce((acc: any, curr) => {
    const ctx = curr.primary_context || 'Unknown';
    acc[ctx] = (acc[ctx] || 0) + 1;
    return acc;
  }, {});

  const handleAcknowledge = (id: string) => {
    dispatch(acknowledgeSignal(id));
  };

  const filteredSignals = activeSignals.filter(s => {
    if (filter === 'critical') return s.risk_level === 'Critical' || s.risk_level === 'High';
    if (filter === 'revenue') return s.revenue_risk_category && s.revenue_risk_category !== 'None';
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Executive Summary Landing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-1">Executive Intelligence Dashboard</h2>
          <p className="text-sm text-white/70 font-medium">Real-time operational health, revenue risk, and decision-support summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-[16px] px-4 py-2.5 premium-shadow flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-bold text-white">{isConnected ? 'System Live' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] p-6 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)]">
          <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Active Op Risks</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-white">{activeSignals.length}</h3>
            <Activity className="w-8 h-8 text-[#3B82F6] opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-900/40 to-[#120524] p-6 rounded-[24px] border border-rose-500/20 shadow-[0_20px_50px_rgba(225,29,72,0.15)]">
          <p className="text-xs text-rose-300/70 uppercase tracking-widest font-bold mb-2">Critical Issues</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-rose-400">{criticalIssuesCount}</h3>
            <AlertTriangle className="w-8 h-8 text-rose-500 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-900/40 to-[#120524] p-6 rounded-[24px] border border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.15)]">
          <p className="text-xs text-amber-300/70 uppercase tracking-widest font-bold mb-2">Revenue At Risk</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-amber-400">${revenueAtRisk.toLocaleString()}</h3>
            <FileText className="w-8 h-8 text-amber-500 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-[#120524] p-6 rounded-[24px] border border-emerald-500/20 shadow-[0_20px_50px_rgba(16,185,129,0.15)] cursor-pointer hover:bg-emerald-900/50 transition-colors" onClick={() => setActiveTab('intelligence')}>
          <p className="text-xs text-emerald-300/70 uppercase tracking-widest font-bold mb-2">Intelligence Engine</p>
          <div className="flex items-center justify-between h-[40px]">
            <span className="text-sm font-bold text-emerald-400">View Active Pipeline</span>
            <ChevronRight className="w-6 h-6 text-emerald-500 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Alert Management (Actionable Queue) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-[20px] p-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#A78BFA]" /> Actionable Executive Alerts
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`text-xs font-bold px-3 py-1.5 rounded-[10px] ${filter === 'all' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}>All</button>
              <button onClick={() => setFilter('critical')} className={`text-xs font-bold px-3 py-1.5 rounded-[10px] ${filter === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'text-white/50 hover:bg-white/10'}`}>Critical</button>
              <button onClick={() => setFilter('revenue')} className={`text-xs font-bold px-3 py-1.5 rounded-[10px] ${filter === 'revenue' ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 hover:bg-white/10'}`}>Revenue</button>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {filteredSignals.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-[20px]">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
                <p className="text-white/70 font-bold">No active alerts requiring executive attention.</p>
              </div>
            ) : (
              filteredSignals.map((signal) => (
                <div key={signal.id} className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[20px] p-5 shadow-lg relative overflow-hidden group">
                  {/* Left priority bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${signal.risk_level === 'Critical' ? 'bg-rose-500' : signal.risk_level === 'High' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[6px] border ${signal.risk_level === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/10 text-white/70 border-white/20'}`}>
                          {signal.risk_level} Priority
                        </span>
                        <span className="text-[10px] text-white/50 font-mono">{new Date(signal.timestamp).toLocaleTimeString()}</span>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">{signal.problem || signal.message}</h4>
                        <p className="text-sm text-white/70 mt-1">{signal.reason}</p>
                      </div>

                      {signal.recommended_action && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[12px] p-3 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest">Recommended Action</p>
                            <p className="text-xs font-bold text-emerald-400">{signal.recommended_action}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-64 space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col">
                      <div className="flex-1">
                        <p className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest mb-1">Financial Risk</p>
                        <p className="text-sm font-bold text-amber-400">{signal.estimated_financial_exposure || 'Minimal'}</p>
                        <p className="text-[10px] text-white/50 mt-1">{signal.revenue_risk_category || 'N/A'}</p>
                      </div>
                      <div className="mt-auto pt-3 flex gap-2">
                        <button 
                          onClick={() => handleAcknowledge(signal.id)}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-[10px] transition-colors"
                        >
                          Acknowledge
                        </button>
                        <button 
                          onClick={() => setActiveTab('signals')}
                          className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-2 rounded-[10px] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3, 4, 5. Sidebar Summaries */}
        <div className="space-y-6">
          
          {/* Decision Context */}
          <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[20px] p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#A78BFA]" /> Decision Context Summary
            </h3>
            <div className="space-y-3">
              {Object.keys(contextCounts).length === 0 ? (
                <p className="text-xs text-white/50 font-medium">No context data available.</p>
              ) : (
                Object.entries(contextCounts).map(([ctx, count]: [string, any]) => (
                  <div key={ctx} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/80">{ctx}</span>
                    <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-[6px]">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[20px] p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-[#A78BFA]" /> System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white/90">Practice Fusion API</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-[6px]">Healthy</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white/90">Twilio Webhooks</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-[6px]">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white/90">Last Sync</span>
                </div>
                <span className="text-xs font-mono text-white/50">Just now</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
