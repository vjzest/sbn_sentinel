import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, ArrowRight, UserCircle2, FileText, Zap, X, AlertOctagon, Info, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { removeSignal, incrementActionsTaken } from '@/store/slices/signalSlice';
export const IntelligenceView: React.FC = () => {
  const rawEvents = useSelector((state: RootState) => state.signals.events);
  const actionableEvents = rawEvents.filter(e => e.recommended_action && e.recommended_action !== "None required." && e.recommended_action !== "Monitor progress.").reverse();
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(0);
  const selectedEvent = actionableEvents.length > 0 && selectedEventIndex < actionableEvents.length ? actionableEvents[selectedEventIndex] : (actionableEvents.length > 0 ? actionableEvents[0] : null);
  const dispatch = useDispatch();
  const handleDismiss = () => {
    if (selectedEvent) {
      dispatch(removeSignal(selectedEvent.id));
      setSelectedEventIndex(0);
    }
  };
  const handleApply = () => {
    if (selectedEvent) {
      dispatch(incrementActionsTaken());
      dispatch(removeSignal(selectedEvent.id));
      setSelectedEventIndex(0);
    }
  };
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Information':
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Critical': return <AlertOctagon className="w-5 h-5" />;
      case 'High': return <AlertTriangle className="w-5 h-5" />;
      case 'Moderate': return <AlertCircle className="w-5 h-5" />;
      case 'Low': return <CheckCircle2 className="w-5 h-5" />;
      case 'Information':
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-[#EEEAFE] to-indigo-600 rounded-2xl shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Operational Intelligence</h2>
          </div>
          <p className="text-sm text-white/70 font-medium ml-12">Deterministic operational risk evaluation and recommendations.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-bold tracking-wide">Engine is Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Smart Inbox */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-[#1E1E2E] to-[#12121A] rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
              Priority Queue
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-bold">
                {actionableEvents.length} Pending
              </span>
            </h3>

            <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[600px] pr-2">
              {actionableEvents.length > 0 ? actionableEvents.map((evt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEventIndex(idx)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${selectedEventIndex === idx
                    ? 'bg-white/20 border-white/40 ring-2 ring-white/20 shadow-md'
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-2xl flex-shrink-0 ${getRiskColor(evt.risk_level || 'Information')}`}>
                      {getRiskIcon(evt.risk_level || 'Information')}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-bold text-white capitalize">{evt.source} Notification</h4>
                        <span className="text-xs text-white/60 font-medium">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">{evt.message}</p>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold text-white">All Caught Up!</p>
                  <p className="text-xs text-white/70 mt-1">No pending operational risks detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recommendation Details */}
        <div className="lg:col-span-8">
          {selectedEvent ? (
            <div className="bg-gradient-to-br from-[#1E1E2E] to-[#12121A] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500 text-white">
              {/* Event Context Header */}
              <div className="bg-white/5 p-8 text-white relative overflow-hidden border-b border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                    <Activity className="w-4 h-4" />
                    What Happened?
                  </div>
                  <h2 className="text-2xl font-bold leading-tight mb-2 text-white">
                    {selectedEvent.message}
                  </h2>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <UserCircle2 className="w-4 h-4 text-indigo-200" />
                      <span className="text-xs font-medium text-indigo-200">Patient: <span className="font-bold text-white">{selectedEvent.metadata?.patient_name || 'Unknown'}</span></span>
                    </div>
                    <div className={`flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-lg border ${getRiskColor(selectedEvent.risk_level || 'Information')}`}>
                      {getRiskIcon(selectedEvent.risk_level || 'Information')}
                      <span className="text-xs font-medium">Risk Level: <span className="font-bold text-white">{selectedEvent.risk_level || 'Information'}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deterministic Evaluation */}
              <div className="p-8 space-y-6 flex-1 bg-transparent overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Problem</div>
                    <div className="text-white/90 font-medium">{selectedEvent.problem || 'None'}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Reason</div>
                    <div className="text-white/90 font-medium">{selectedEvent.reason || 'Routine event'}</div>
                  </div>
                </div>

                {/* Revenue Intelligence Block */}
                <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/30 relative mt-6">
                  <div className="absolute -top-3 left-6 bg-[#1E1E2E] text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-amber-500/30">
                    <FileText className="w-3.5 h-3.5" />
                    Revenue Intelligence
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-amber-500/50 uppercase tracking-widest font-bold mb-1">Financial Exposure</div>
                      <div className="text-amber-400 font-bold text-xl">{selectedEvent.estimated_financial_exposure || '$0.00'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-500/50 uppercase tracking-widest font-bold mb-1">Risk Category</div>
                      <div className="text-amber-100 font-bold">{selectedEvent.revenue_risk_category || 'None'}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-500/20 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-amber-500/50 uppercase tracking-widest font-bold mb-1">Confidence</div>
                      <div className={selectedEvent.revenue_confidence === 'High' ? 'text-emerald-400 font-bold text-sm' : 'text-amber-300 font-bold text-sm'}>{selectedEvent.revenue_confidence || 'High'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-500/50 uppercase tracking-widest font-bold mb-1">Dependency</div>
                      <div className="text-amber-100/70 text-sm leading-relaxed">{selectedEvent.operational_dependency || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Operational Context Block */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative mt-6">
                  <div className="absolute -top-3 left-6 bg-[#1E1E2E] text-indigo-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-indigo-500/30">
                    <Activity className="w-3.5 h-3.5" />
                    Decision Context Engine
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Primary Context</div>
                      <div className="text-white/90 font-bold">{selectedEvent.primary_context || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Secondary Context</div>
                      <div className="text-white/90 font-bold">{selectedEvent.secondary_context || 'Not Available'}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Confidence: <span className={selectedEvent.context_confidence === 'High' ? 'text-emerald-400' : 'text-yellow-400'}>{selectedEvent.context_confidence || 'Low'}</span></div>
                    <div className="text-white/70 text-sm leading-relaxed">{selectedEvent.context_reason || 'Insufficient information.'}</div>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30 shadow-sm relative mt-4">
                  <div className="absolute -top-3 left-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Recommended Action
                  </div>
                  <p className="text-emerald-300 font-bold leading-relaxed mt-2 text-xl">
                    {selectedEvent.recommended_action || "Acknowledge"}
                  </p>
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-start gap-2">
                    <div className="text-xs font-bold text-emerald-400/70 uppercase tracking-wide shrink-0 mt-0.5">Expected Outcome:</div>
                    <div className="text-emerald-200/90 text-sm font-medium">{selectedEvent.expected_outcome || "Issue resolved."}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-transparent border-t border-white/10 flex items-center justify-end gap-4">
                <button onClick={handleDismiss} className="px-6 py-3 rounded-2xl font-bold text-white/70 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <X className="w-5 h-5" /> Dismiss
                </button>
                <button onClick={handleApply} className="px-8 py-3 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Execute Action <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#1E1E2E] to-[#12121A] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] h-[600px] flex flex-col items-center justify-center text-center p-8 text-white">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-12 h-12 text-indigo-300/50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Engine is Monitoring</h3>
              <p className="text-white/70 max-w-md mx-auto">
                Select an operational alert from the priority queue to view deterministic evaluation and business impact.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
