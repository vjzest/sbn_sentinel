import React, { useState } from 'react';
import { BrainCircuit, Activity, CheckCircle2, AlertTriangle, ArrowRight, UserCircle2, FileText, Zap, ChevronRight, X, PhoneCall } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { removeSignal, incrementActionsTaken } from '@/store/slices/signalSlice';

export const IntelligenceView: React.FC = () => {
  const rawEvents = useSelector((state: RootState) => state.signals.events);

  // Filter events that actually have recommendations to show in the inbox
  const actionableEvents = rawEvents.filter(e => e.recommended_action && e.recommended_action.length > 0).reverse();

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

  return (
    <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-[#EEEAFE]0 to-purple-600 rounded-2xl shadow-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Assistant</h2>
          </div>
          <p className="text-sm text-white/70 font-medium ml-12">Helpful suggestions to make your day easier.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-bold tracking-wide">Assistant is Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Side: Smart Inbox */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
              New Notifications
              <span className="bg-[#A78BFA]/20 text-[#C4B5FD] text-xs px-2.5 py-1 rounded-full font-bold">
                {actionableEvents.length} New
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
                    <div className={`mt-0.5 p-2 rounded-2xl flex-shrink-0 ${evt.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      evt.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                      {evt.priority === 'Critical' ? <AlertTriangle className="w-5 h-5" /> :
                        evt.type === 'EHR' ? <FileText className="w-5 h-5" /> :
                          <Activity className="w-5 h-5" />}
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
                  <p className="text-xs text-white/70 mt-1">No new suggestions right now.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recommendation Details */}
        <div className="lg:col-span-8">
          {selectedEvent ? (
            <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500 text-white">

              {/* Event Context Header */}
              <div className="bg-white/5 p-8 text-white relative overflow-hidden border-b border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEEAFE]0 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
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
                      <span className="text-xs font-medium text-[#E0D9FD]">Patient: <span className="font-bold text-white">{selectedEvent.metadata?.patient_name || 'Unknown'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <AlertTriangle className={`w-4 h-4 ${selectedEvent.priority === 'Critical' ? 'text-red-400' :
                        selectedEvent.priority === 'High' ? 'text-orange-400' : 'text-blue-400'
                        }`} />
                      <span className="text-xs font-medium text-[#E0D9FD]">Priority: <span className="font-bold text-white">{selectedEvent.priority || 'Medium'}</span></span>
                    </div>
                  </div>
                </div>
              </div>
              {/* AI Analysis & Recommendation */}
              <div className="p-8 space-y-8 flex-1 bg-transparent">
                {/* Insight Box */}
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-sm relative">
                  <div className="absolute -top-3 left-6 bg-[#A78BFA]/20 text-[#C4B5FD] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-[#120524]" />
                    AI Observation
                  </div>
                  <p className="text-white/90 font-medium leading-relaxed mt-2 text-lg">
                    {selectedEvent.ai_insight || "Looking into this..."}
                  </p>
                </div>

                {/* Recommendation Box */}
                <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30 shadow-sm relative mt-8">
                  <div className="absolute -top-3 left-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Suggested Action
                  </div>
                  <p className="text-emerald-300 font-bold leading-relaxed mt-2 text-xl">
                    {selectedEvent.recommended_action || "Waiting for suggestion..."}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-transparent border-t border-white/10 flex items-center justify-end gap-4">
                <button onClick={handleDismiss} className="px-6 py-3 rounded-2xl font-bold text-white/70 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <X className="w-5 h-5" /> Dismiss
                </button>
                <button onClick={handleApply} className="px-8 py-3 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Apply Suggestion <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] h-[600px] flex flex-col items-center justify-center text-center p-8 text-white">
              <div className="w-24 h-24 bg-[#EEEAFE] rounded-full flex items-center justify-center mb-6">
                <BrainCircuit className="w-12 h-12 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Help</h3>
              <p className="text-white/70 max-w-md mx-auto">
                Click on any notification on the left to see what happened and apply suggestions with one click.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
