import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Phone, Mail, Calendar, ChevronRight, X, Clock, Database, Sparkles, Check, Shield } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { incrementActionsTaken, SignalEvent } from '@/store/slices/signalSlice';

interface SignalFeedProps {
  setActiveTab?: (tab: string) => void;
}

export const SignalFeed: React.FC<SignalFeedProps> = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const [selectedSignal, setSelectedSignal] = useState<SignalEvent | null>(null);
  const [isDispatched, setIsDispatched] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeModelName, setActiveModelName] = useState('GPT-4o');
  
  useEffect(() => {
    setMounted(true);
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

  const [autopilot, setAutopilot] = useState(false);
  const signals = useSelector((state: RootState) => state.signals.events);

  useEffect(() => {
    setMounted(true);
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

  // Autopilot execution engine
  useEffect(() => {
    if (autopilot && signals.length > 0) {
      const latestSignal = signals[0];
      if (latestSignal && latestSignal.recommended_action) {
        const alreadyDispatched = localStorage.getItem(`auto-${latestSignal.id}`);
        if (!alreadyDispatched) {
          localStorage.setItem(`auto-${latestSignal.id}`, 'true');
          
          // Post auto-dispatch log to DB
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_email: "autopilot@sbnsentinel.com",
              action: `Approved Sentinel Action: ${latestSignal.recommended_action}`,
              resource: `Signal: ${latestSignal.id} (${latestSignal.type})`,
              ip_address: "127.0.0.1"
            })
          }).catch(e => console.error("Autopilot log dispatch error:", e));
          
          dispatch(incrementActionsTaken());
        }
      }
    }
  }, [signals, autopilot]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'EHR': return <Calendar className="w-4 h-4 text-[#F59E0B]" />;
      case 'Phone': return <Phone className="w-4 h-4 text-[#EF4444]" />;
      case 'Email': return <Mail className="w-4 h-4 text-[#3B82F6]" />;
      default: return <Activity className="w-4 h-4 text-[#10B981]" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'EHR': return 'bg-[#FEF3C7]';
      case 'Phone': return 'bg-[#FEE2E2]';
      case 'Email': return 'bg-[#DBEAFE]';
      default: return 'bg-[#D1FAE5]';
    }
  };

  return (
    <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 flex flex-col h-[480px] premium-shadow card-hover">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#2563EB]" />
          Live Signal Feed
        </h3>
        
        {/* Simplified Autopilot Toggle */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${autopilot ? 'text-[#6D5DF6] animate-pulse' : 'text-slate-400'}`}>
            {autopilot ? '⚡ Autopilot' : 'Autopilot'}
          </span>
          <button 
            onClick={() => setAutopilot(!autopilot)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 ${
              autopilot ? 'bg-[#6D5DF6] justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="bg-white w-4 h-4 rounded-full shadow-sm transition-all"></span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0 pr-2 custom-scrollbar">
        {signals.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#9CA3AF] text-sm font-medium">
            Waiting for live signals...
          </div>
        )}
        {signals.map((signal) => {
          const hasAction = !!signal.recommended_action;
          const isApproved = localStorage.getItem(`auto-${signal.id}`) === 'true';

          return (
            <div 
              key={signal.id} 
              onClick={() => {
                setSelectedSignal(signal);
                setIsDispatched(false);
                setIsDispatching(false);
              }}
              className="p-4 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F9FC] transition-colors cursor-pointer group rounded-[16px] mb-1 flex justify-between items-center"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-2.5 ${getBgColor(signal.type)} rounded-[16px] flex-shrink-0`}>
                  {getIcon(signal.type)}
                </div>
                <div className="flex-1 mt-0.5">
                  <span className="text-[10px] font-extrabold text-[#6B7280] tracking-widest uppercase block mb-1">{signal.source}</span>
                  <p className="text-sm text-[#111827] font-bold leading-tight">{signal.message}</p>
                  
                  {hasAction && (
                    <div className="mt-2 text-xs bg-[#EEEAFE] border border-[#E0D9FD] rounded-lg p-2 text-[#5B4AE8] font-semibold flex items-center gap-1.5 w-fit">
                      <Sparkles className="w-3.5 h-3.5 text-[#6D5DF6] flex-shrink-0" />
                      <span>Recommendation: {signal.recommended_action}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                <span className="text-[10px] font-bold text-[#9CA3AF]">
                  {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                
                {hasAction && !isApproved ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(incrementActionsTaken());
                      localStorage.setItem(`auto-${signal.id}`, 'true');
                      
                      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_email: "doctor-oneclick@sbnsentinel.com",
                          action: `Approved Sentinel Action: ${signal.recommended_action}`,
                          resource: `Signal: ${signal.id} (${signal.type})`,
                          ip_address: "127.0.0.1"
                        })
                      }).catch(e => console.error(e));
                    }}
                    className="bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-[8px] transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105"
                  >
                    <Check className="w-3 h-3" /> Quick Approve
                  </button>
                ) : hasAction && isApproved ? (
                  <span className="text-[10px] font-bold text-[#10B981] bg-[#D1FAE5] px-2.5 py-1 rounded-full border border-[#A7F3D0] uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" /> Dispatched
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#2563EB] transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>
 
      <button onClick={() => setActiveTab && setActiveTab('signals')} className="mt-4 text-xs font-bold text-[#2563EB] hover:underline flex items-center justify-center gap-1 w-full pt-4 border-t border-[#F3F4F6] cursor-pointer">
        View All Signals <ChevronRight className="w-3 h-3" />
      </button>

      {/* Styled Signal Diagnostic Report Modal */}
      {mounted && selectedSignal && createPortal(
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#E8EDF5] w-full max-w-lg rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#F8FAFC] border-b border-[#E8EDF5] px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Signal Diagnostic Report</h3>
                  <span className="text-[10px] font-mono text-blue-600 font-semibold">{selectedSignal.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSignal(null)} 
                className="p-1.5 hover:bg-[#EEF2F6] rounded-full text-[#6B7280] hover:text-[#111827] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Message Details */}
              <div>
                <span className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Signal Content</span>
                <div className="bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] p-4 text-sm font-bold text-[#111827] leading-relaxed">
                  {selectedSignal.message}
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Source System</span>
                  <p className="text-[#111827] font-bold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                    {selectedSignal.source}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Decryption Channel</span>
                  <p className="text-[#111827] font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    HIPAA Secure
                  </p>
                </div>
                <div className="col-span-2 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Timestamp</span>
                  <p className="text-[#4B5563] font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(selectedSignal.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* AI Intelligence Block */}
              <div className="bg-[#EEEAFE]/60 border border-[#E0D9FD]/80 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#6D5DF6] animate-pulse" />
                  <span className="text-[10px] font-extrabold text-[#5B4AE8] uppercase tracking-widest">Sentinel AI Insight</span>
                </div>
                <p className="text-xs text-indigo-900 font-bold leading-relaxed mb-3">
                  {selectedSignal.ai_insight || `Critical clinical feed event analyzed by ${activeModelName}. Action recommendation is ready for dispatch.`}
                </p>
                <div className="bg-white/80 border border-[#E0D9FD] rounded-lg p-2.5 text-[11px] text-indigo-950 font-bold">
                  <span className="text-[9px] uppercase font-bold text-[#EEEAFE]0 block mb-0.5">Recommended Action</span>
                  {selectedSignal.recommended_action || "Route to practitioner for clinical review."}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-[#F8FAFC] border-t border-[#E8EDF5] px-6 py-4 flex gap-3 justify-end">
              <button 
                onClick={() => setSelectedSignal(null)}
                className="bg-white border border-[#E8EDF5] hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-[16px] transition-colors"
              >
                Close Report
              </button>
              <button 
                onClick={async () => {
                  if (!selectedSignal) return;
                  setIsDispatching(true);
                  
                  try {
                    const userStr = localStorage.getItem('user');
                    const user = userStr ? JSON.parse(userStr) : null;
                    const userEmail = user?.email || "admin@sbnsentinel.com";
                    
                    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_email: userEmail,
                        action: `Approved Sentinel Action: ${selectedSignal.recommended_action || 'Acknowledged Event'}`,
                        resource: `Signal: ${selectedSignal.id} (${selectedSignal.type})`,
                        ip_address: "127.0.0.1"
                      })
                    });
                    
                    localStorage.setItem(`auto-${selectedSignal.id}`, 'true');
                  } catch (e) {
                    console.error("Failed to write manual dispatch from feed:", e);
                  }

                  setTimeout(() => {
                    setIsDispatching(false);
                    setIsDispatched(true);
                    dispatch(incrementActionsTaken());
                  }, 1000);
                }}
                disabled={isDispatched || isDispatching}
                className={`font-bold text-xs px-6 py-2.5 rounded-[16px] flex items-center gap-1.5 transition-all shadow-sm ${
                  isDispatched 
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#2563EB] hover:bg-blue-700 text-white hover:scale-105 active:scale-95 disabled:opacity-75'
                }`}
              >
                {isDispatching ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Dispatching...</span>
                  </>
                ) : isDispatched ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Action Dispatched</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Approve & Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
