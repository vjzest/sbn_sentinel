import React, { useState, useEffect } from 'react';
import { BrainCircuit, TrendingDown, TrendingUp, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { incrementActionsTaken } from '@/store/slices/signalSlice';

export const AIInsights: React.FC = () => {
  const [actionStatus, setActionStatus] = useState<'pending' | 'approved' | 'dismissed'>('pending');
  const [activeModelName, setActiveModelName] = useState('GPT-4o');
  const signals = useSelector((state: RootState) => state.signals.events);
  const dispatch = useDispatch();
  
  // Get the most recent signal that has an AI insight
  const latestInsightSignal = signals.find(s => s.ai_insight);

  // Load settings on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.ai_model === 'claude') {
          setActiveModelName('Claude 3.5 Sonnet');
        } else {
          setActiveModelName('GPT-4o');
        }
      })
      .catch(() => {});
  }, []);

  const handleApprove = async () => {
    if (!latestInsightSignal) return;
    setActionStatus('approved');
    dispatch(incrementActionsTaken());
    
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userEmail = user?.email || "admin@sbnsentinel.com";
      
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: userEmail,
          action: `Approved Sentinel Action: ${latestInsightSignal.recommended_action || 'Acknowledged Event'}`,
          resource: `Signal ID: ${latestInsightSignal.id} (${latestInsightSignal.type})`,
          ip_address: "127.0.0.1"
        })
      });
    } catch (e) {
      console.error("Failed to write AIInsight approval to audit log:", e);
    }
  };

  // Reset action status when a new insight comes in
  useEffect(() => {
    if (latestInsightSignal) {
      setActionStatus('pending');
    }
  }, [latestInsightSignal?.id]);

  return (
    <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow h-[480px] flex flex-col card-hover">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-[#6D5DF6]" />
          Sentinel AI Engine
        </h3>
        <span className="text-[10px] font-bold bg-[#F5F3FF] text-[#7C3AED] px-2.5 py-1 rounded-full border border-[#EDE9FE]">
          {activeModelName} Active
        </span>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        {!latestInsightSignal ? (
           <div className="flex flex-col items-center justify-center flex-1 text-[#9CA3AF]">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#E8EDF5]" />
              <p className="text-sm font-medium">Analyzing operations for insights...</p>
           </div>
        ) : (
          <>
            {/* Context */}
            <div className="bg-white border border-[#E8EDF5] rounded-[16px] p-4">
              <h4 className="text-[10px] text-[#6B7280] uppercase tracking-widest font-extrabold mb-3">Context & Prediction</h4>
              <div className="flex gap-4">
                <div className="mt-0.5">
                  {latestInsightSignal.ai_insight?.includes('loss') ? (
                    <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] text-[#111827] mb-2 font-semibold leading-relaxed">
                    {latestInsightSignal.message}
                  </p>
                  <p className={`text-[13px] font-bold ${latestInsightSignal.ai_insight?.includes('loss') ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    Predicted Impact: {latestInsightSignal.ai_insight}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Box */}
            {actionStatus === 'pending' && (
              <div className="bg-[#EEF4FF] border border-[#BFDBFE] rounded-[16px] p-5 animate-in slide-in-from-bottom-4 flex-1">
                <h4 className="text-[10px] text-[#2563EB] uppercase tracking-widest font-extrabold mb-3">Action Recommendation</h4>
                <div className="flex gap-4">
                  <div className="mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-white border border-[#3B82F6] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#2563EB]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#111827] mb-4 font-bold leading-relaxed">
                      {latestInsightSignal.recommended_action || "Acknowledge event to continue tracking."}
                    </p>
                    <div className="flex gap-3">
                      <button onClick={handleApprove} className="bg-[#6D5DF6] hover:bg-[#5B4AE8] text-white font-bold text-xs px-5 py-2.5 rounded-[10px] shadow-[0_4px_10px_rgba(79,70,229,0.3)] transition-transform active:scale-95">
                        Approve Action
                      </button>
                      <button onClick={() => setActionStatus('dismissed')} className="bg-white border border-[#E8EDF5] hover:bg-[#F7F9FC] text-[#111827] font-bold text-xs px-5 py-2.5 rounded-[10px] shadow-sm transition-transform active:scale-95">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


        {/* Approval Success State */}
        {actionStatus === 'approved' && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-[16px] p-5 flex items-center justify-between flex-1 animate-in fade-in">
             <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <span className="text-sm font-bold text-[#065F46]">Action Approved: SMS Sequence Initiated.</span>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Confidence Footer */}
      <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-[#6B7280]">AI Confidence Score</span>
          <div className="w-24 h-6 opacity-70">
            <svg viewBox="0 0 100 20" className="w-full h-full">
               <path d="M0,15 C20,15 40,5 60,10 C80,15 90,5 100,5" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-[#111827] leading-none">96%</p>
          <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider">Very High</p>
        </div>
      </div>

    </div>
  );
};
