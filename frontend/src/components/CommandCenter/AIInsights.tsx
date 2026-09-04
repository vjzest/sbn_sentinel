import { fetchWithAuth } from '@/utils/fetchWithAuth';
import React, { useState, useEffect } from 'react';
import { BrainCircuit, TrendingDown, TrendingUp, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { incrementActionsTaken } from '@/store/slices/signalSlice';
import { executeGovernedRecommendation } from '@/utils/governance';

export const AIInsights: React.FC = () => {
  const [actionStatus, setActionStatus] = useState<'pending' | 'approved' | 'dismissed' | 'blocked' | 'error'>('pending');
  const [activeModelName, setActiveModelName] = useState('GPT-4o');
  const signals = useSelector((state: RootState) => state.signals.events);
  const dispatch = useDispatch();
  
  // Get the most recent signal that has an AI insight
  const latestInsightSignal = signals.find(s => s.ai_insight);

  // Load settings on mount
  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`)
      .then(res => res.json())
      .then(data => {
          setActiveModelName('Deterministic Rules Engine');
      })
      .catch(() => {
          setActiveModelName('Deterministic Rules Engine');
      });
  }, []);

  const handleApprove = async () => {
    if (!latestInsightSignal) return;
    setActionStatus('pending');
    
    try {
      const result = await executeGovernedRecommendation(
        latestInsightSignal.id, // Using signal ID assuming it maps to recommendation
        "UPDATE_OPERATIONAL_STATUS", // Supported action type
        `SIGNAL-${latestInsightSignal.id}`
      );
      
      setActionStatus(result.status);
      
      if (result.status === 'approved') {
        dispatch(incrementActionsTaken());
      }
      
    } catch (e) {
      console.error("Failed to execute action sequence:", e);
      setActionStatus('error');
    }
  };

  // Reset action status when a new insight comes in
  useEffect(() => {
    if (latestInsightSignal) {
      setActionStatus('pending');
    }
  }, [latestInsightSignal?.id]);

  return (
    <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] h-[480px] flex flex-col card-hover hover:-translate-y-1 transition-all duration-300">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-[#2E1055]" />
          Deterministic Policy Engine
        </h3>
        <span className="text-[10px] font-bold bg-[#120524]/20 text-[#C4B5FD] px-2.5 py-1 rounded-full border border-[#EDE9FE]">
          {activeModelName}
        </span>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        {!latestInsightSignal ? (
           <div className="flex flex-col items-center justify-center flex-1 text-[#9CA3AF]">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#E8EDF5]" />
              <p className="text-sm font-medium">Evaluating deterministic rules...</p>
           </div>
        ) : (
          <>
            {/* Context */}
            <div className="bg-white/10 border border-white/20 rounded-[16px] p-4">
              <h4 className="text-[10px] text-white/70 uppercase tracking-widest font-extrabold mb-3">System Evaluation</h4>
              <div className="flex gap-4">
                <div className="mt-0.5">
                  {latestInsightSignal.ai_insight?.includes('loss') ? (
                    <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] text-white mb-2 font-semibold leading-relaxed">
                    {latestInsightSignal.message}
                  </p>
                  <p className={`text-[13px] font-bold ${latestInsightSignal.ai_insight?.includes('loss') ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    Operational Status: Requires Review
                  </p>
                </div>
              </div>
            </div>

            {/* Action Box */}
            {actionStatus === 'pending' && (
              <div className="bg-[#3B82F6]/20 border border-white/20 rounded-[16px] p-5 animate-in slide-in-from-bottom-4 flex-1">
                <h4 className="text-[10px] text-[#2563EB] uppercase tracking-widest font-extrabold mb-3">Governed Action</h4>
                <div className="flex gap-4">
                  <div className="mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-[#3B82F6] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#2563EB]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-white mb-4 font-bold leading-relaxed">
                      {latestInsightSignal.recommended_action || "Acknowledge event to continue tracking."}
                    </p>
                    <div className="flex gap-3">
                      <button onClick={handleApprove} className="bg-[#2E1055] hover:bg-[#120524] text-white font-bold text-xs px-5 py-2.5 rounded-[10px] shadow-[0_4px_10px_rgba(79,70,229,0.3)] transition-transform active:scale-95">
                        Approve Action
                      </button>
                      <button onClick={() => setActionStatus('dismissed')} className="bg-white/10 border border-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-2.5 rounded-[10px] shadow-sm transition-transform active:scale-95">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


        {/* Approval Success State */}
        {actionStatus === 'approved' && (
          <div className="bg-[#10B981]/20 border border-[#10B981]/30 rounded-[16px] p-5 flex items-center justify-between flex-1 animate-in fade-in">
             <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <span className="text-sm font-bold text-[#34D399]">Action Approved & Dispatched.</span>
            </div>
          </div>
        )}
        
        {/* Blocked State */}
        {actionStatus === 'blocked' && (
          <div className="bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-[16px] p-5 flex items-center justify-between flex-1 animate-in fade-in">
             <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <span className="text-sm font-bold text-[#F87171]">Action BLOCKED: Missing integration or not implemented.</span>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {actionStatus === 'error' && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-[16px] p-5 flex items-center justify-between flex-1 animate-in fade-in">
             <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <span className="text-sm font-bold text-amber-500">Action Failed.</span>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Confidence Footer */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-white/70">Operational Readiness</span>
          <div className="w-24 h-6 opacity-70">
            <svg viewBox="0 0 100 20" className="w-full h-full">
               <path d="M0,15 C20,15 40,5 60,10 C80,15 90,5 100,5" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold text-white leading-none">Verified</p>
          <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider">Ready for Execution</p>
        </div>
      </div>

    </div>
  );
};
