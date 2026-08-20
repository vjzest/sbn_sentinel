import { fetchWithAuth } from '@/utils/fetchWithAuth';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Phone, Mail, Calendar, ChevronRight, X, Clock, Database, Sparkles, Check, Shield, ArrowRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { incrementActionsTaken, SignalEvent, acknowledgeSignal } from '@/store/slices/signalSlice';

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
    fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`)
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
  const activeSignals = signals.filter(s => s.status !== 'acknowledged');

  // Autopilot execution engine
  useEffect(() => {
    if (autopilot && activeSignals.length > 0) {
      const latestSignal = activeSignals[0];
      if (latestSignal && latestSignal.recommended_action) {
        const alreadyDispatched = localStorage.getItem(`auto-${latestSignal.id}`);
        if (!alreadyDispatched) {
          localStorage.setItem(`auto-${latestSignal.id}`, 'true');
          
          // Post auto-dispatch log to DB
          fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`, {
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
  }, [activeSignals, autopilot]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'EHR': return <Calendar className="w-4 h-4 text-[#F59E0B]" />;
      case 'Phone': return <Phone className="w-4 h-4 text-[#EF4444]" />;
      case 'Email': return <Mail className="w-4 h-4 text-[#3B82F6]" />;
      default: return <Activity className="w-4 h-4 text-[#34D399]" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'EHR': return 'bg-[#FEF3C7]';
      case 'Phone': return 'bg-[#FEE2E2]';
      case 'Email': return 'bg-[#DBEAFE]';
      default: return 'bg-[#10B981]/20';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 flex flex-col h-[480px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#A78BFA]" />
          Live Signal Feed
        </h3>
        
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${autopilot ? 'text-[#2E1055] animate-pulse' : 'text-slate-300'}`}>
            {autopilot ? '⚡ Autopilot' : 'Autopilot'}
          </span>
          <button 
            onClick={() => setAutopilot(!autopilot)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 ${
              autopilot ? 'bg-[#2E1055] justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="bg-white/5 w-4 h-4 rounded-full shadow-sm transition-all"></span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0 pr-2 custom-scrollbar">
        {activeSignals.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#9CA3AF] text-sm font-medium">
            Waiting for live signals...
          </div>
        )}
        {activeSignals.map((signal) => {
          const hasAction = !!signal.recommended_action;
          const isApproved = localStorage.getItem(`auto-${signal.id}`) === 'true';

          return (
            <div 
              key={signal.id} 
              className="p-4 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group rounded-[16px] mb-1"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[6px] border ${
                    (signal as any).risk_level === 'Critical' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30' : 
                    (signal as any).risk_level === 'High' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30' : 
                    'bg-white/10 text-white border-white/20'
                  }`}>
                    {(signal as any).risk_level || 'Normal'} Priority
                  </span>
                  <span className="text-[10px] text-white/50 font-mono">{new Date(signal.timestamp).toLocaleTimeString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      
                      // Log to MS-010 DMAE
                      fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_email: "executive@sbnsentinel.com",
                          action: "Acknowledged Alert",
                          resource: `Signal: ${signal.id}`,
                          ip_address: "127.0.0.1"
                        })
                      }).catch(err => console.error("Audit log failed", err));

                      dispatch(acknowledgeSignal(signal.id)); 
                    }}
                    className="text-[10px] font-bold text-white/50 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button onClick={() => setSelectedSignal(signal)} className="text-[#2563EB] hover:text-white transition-colors cursor-pointer" title="View Details">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div 
                onClick={() => {
                  setSelectedSignal(signal);
                  setIsDispatched(false);
                  setIsDispatching(false);
                }}
                className="flex items-start gap-4 flex-1"
              >
                <div className={`p-2.5 ${getBgColor(signal.type)} rounded-[16px] flex-shrink-0`}>
                  {getIcon(signal.type)}
                </div>
                <div className="flex-1 mt-0.5">
                  <span className="text-[10px] font-extrabold text-white/70 tracking-widest uppercase block mb-1">{signal.source}</span>
                  <p className="text-sm text-white font-bold leading-tight">{signal.message}</p>
                  
                  {hasAction && (
                    <div className="mt-2 text-xs bg-[#2E1055]/20 border border-[#E0D9FD] rounded-lg p-2 text-[#A78BFA] font-semibold flex items-center gap-1.5 w-fit">
                      <Sparkles className="w-3.5 h-3.5 text-[#2E1055] flex-shrink-0" />
                      <span>Recommendation: {signal.recommended_action}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
 
      <button onClick={() => setActiveTab && setActiveTab('signals')} className="mt-4 text-xs font-bold text-[#A78BFA] hover:underline flex items-center justify-center gap-1 w-full pt-4 border-t border-white/10 cursor-pointer">
        View All Signals <ChevronRight className="w-3 h-3" />
      </button>

      {mounted && selectedSignal && createPortal(
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white/10 border-white/10 text-white border-white/10 w-full max-w-lg rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200">
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#120524]/50 border border-white/10 text-blue-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Signal Diagnostic Report</h3>
                  <span className="text-[10px] font-mono text-blue-400 font-semibold">{selectedSignal.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSignal(null)} 
                className="p-1.5 hover:bg-[#EEF2F6] rounded-full text-white/70 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <span className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Signal Content</span>
                <div className="bg-white/5 border border-white/10 rounded-[16px] p-4 text-sm font-bold text-white leading-relaxed">
                  {selectedSignal.message}
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Source System</span>
                  <p className="text-white font-bold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#A78BFA]" />
                    {selectedSignal.source}
                  </p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Decryption Channel</span>
                  <p className="text-white font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Encrypted & Secure
                  </p>
                </div>
                <div className="col-span-2 bg-white/5 rounded-2xl p-3 border border-white/10">
                  <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Timestamp</span>
                  <p className="text-white/90 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(selectedSignal.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* AI Intelligence Block */}
              <div className="bg-[#2E1055]/20 border border-[#2E1055]/50 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-[#2E1055]" />
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">Deterministic Impact</span>
                </div>
                <p className="text-xs text-white/90 font-bold leading-relaxed mb-3">
                  <span className="text-white/50">Problem:</span> {selectedSignal.problem || 'None'}<br/>
                  <span className="text-white/50">Impact:</span> {selectedSignal.business_impact || 'None'}
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-[11px] text-white font-bold">
                  <span className="text-[9px] uppercase font-bold text-[#EEEAFE]0 block mb-0.5">Recommended Action</span>
                  {selectedSignal.recommended_action || "Route to practitioner for clinical review."}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex gap-3 justify-end">
              <button 
                onClick={() => setSelectedSignal(null)}
                className="bg-transparent border border-white/10 hover:bg-white/5 text-white/80 font-bold text-xs px-5 py-2.5 rounded-[16px] transition-colors"
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
                    
                    await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`, {
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
