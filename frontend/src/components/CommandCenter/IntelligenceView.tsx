import React, { useState } from 'react';
import { BrainCircuit, Activity, CheckCircle2, AlertTriangle, ArrowRight, UserCircle2, FileText, Zap, ChevronRight, X, PhoneCall } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const IntelligenceView: React.FC = () => {
  const rawEvents = useSelector((state: RootState) => state.signals.events);
  
  // Filter events that actually have recommendations to show in the inbox
  const actionableEvents = rawEvents.filter(e => e.recommended_action && e.recommended_action.length > 0).reverse();
  
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(0);
  const selectedEvent = actionableEvents.length > 0 ? actionableEvents[selectedEventIndex] : null;

  return (
    <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Clinical Assistant</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium ml-12">Smart recommendations and alerts requiring your attention.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-bold tracking-wide">AI Monitoring Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Smart Inbox */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 premium-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              Needs Attention
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold">
                {actionableEvents.length} New
              </span>
            </h3>
            
            <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[600px] pr-2">
              {actionableEvents.length > 0 ? actionableEvents.map((evt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEventIndex(idx)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                    selectedEventIndex === idx 
                      ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20 shadow-md' 
                      : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                      evt.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                      evt.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {evt.priority === 'Critical' ? <AlertTriangle className="w-5 h-5" /> :
                       evt.type === 'EHR' ? <FileText className="w-5 h-5" /> : 
                       <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-bold text-gray-900 capitalize">{evt.source} Alert</h4>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{evt.message}</p>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold text-gray-900">All Caught Up!</p>
                  <p className="text-xs text-gray-500 mt-1">No pending AI recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recommendation Details */}
        <div className="lg:col-span-8">
          {selectedEvent ? (
            <div className="bg-white rounded-3xl border border-gray-100 premium-shadow overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              
              {/* Event Context Header */}
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                    <Activity className="w-4 h-4" />
                    Detected Issue
                  </div>
                  <h2 className="text-2xl font-bold leading-tight mb-2 text-white">
                    {selectedEvent.message}
                  </h2>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <UserCircle2 className="w-4 h-4 text-indigo-200" />
                      <span className="text-xs font-medium text-indigo-100">Patient: <span className="font-bold text-white">{selectedEvent.metadata?.patient_name || 'Unknown'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <AlertTriangle className={`w-4 h-4 ${
                        selectedEvent.priority === 'Critical' ? 'text-red-400' :
                        selectedEvent.priority === 'High' ? 'text-orange-400' : 'text-blue-400'
                      }`} />
                      <span className="text-xs font-medium text-indigo-100">Priority: <span className="font-bold text-white">{selectedEvent.priority || 'Medium'}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis & Recommendation */}
              <div className="p-8 space-y-8 flex-1 bg-gray-50/50">
                
                {/* Insight Box */}
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative">
                  <div className="absolute -top-3 left-6 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-indigo-700" />
                    AI Analysis
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed mt-2 text-lg">
                    {selectedEvent.ai_insight || "Analyzing situation..."}
                  </p>
                </div>

                {/* Recommendation Box */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-sm relative mt-8">
                  <div className="absolute -top-3 left-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Recommended Action
                  </div>
                  <p className="text-emerald-900 font-bold leading-relaxed mt-2 text-xl">
                    {selectedEvent.recommended_action || "Awaiting recommendation..."}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-end gap-4">
                <button className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <X className="w-5 h-5" /> Dismiss
                </button>
                <button className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Approve & Execute <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 premium-shadow h-[600px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <BrainCircuit className="w-12 h-12 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Assist</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Select an item from your inbox on the left to view the AI analysis and approve automated recommendations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
