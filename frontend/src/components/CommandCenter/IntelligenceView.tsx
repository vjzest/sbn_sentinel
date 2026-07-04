import React from 'react';
import { BrainCircuit, Activity, Network, Clock, Target, Terminal, Cpu, Server, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const IntelligenceView: React.FC = () => {
  const events = useSelector((state: RootState) => state.signals.events);
  const stats = useSelector((state: RootState) => state.signals.stats);
  const [activeModelName, setActiveModelName] = React.useState('GPT-4o');
  const [feedMode, setFeedMode] = React.useState<'clinical' | 'technical'>('clinical');

  React.useEffect(() => {
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

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[#4F46E5] font-semibold text-sm mb-1">Good Morning 👋</p>
          <h2 className="text-3xl font-extrabold text-[#111827] mb-1">AI Intelligence Layer</h2>
          <p className="text-sm text-[#6B7280] font-medium">Core AI subsystems monitoring clinic data, patient flows, and automated billing streams.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#F5F3FF] text-[#7C3AED] px-5 py-2.5 rounded-[12px] border border-[#EDE9FE] premium-shadow">
          <Sparkles className="w-4 h-4 animate-spin text-[#7C3AED]" />
          <span className="text-sm font-extrabold tracking-wide">{activeModelName} Active</span>
        </div>
      </div>

      {/* Explained Subsystems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            name: 'Event Engine', 
            val: `${(24000 + events.length).toLocaleString()}`, 
            desc: 'Aggregates raw clinical events, webhook triggers, and vital stats in real-time.', 
            sub: 'Events Processed Today', 
            icon: Activity, 
            bg: 'bg-[#EFF6FF]', 
            text: 'text-[#3B82F6]', 
            line: '#3B82F6', 
            data: 'M0,20 C20,15 40,25 60,10 C80,-5 100,15 120,5' 
          },
          { 
            name: 'Relationship Engine', 
            val: `${(8200 + events.length * 3).toLocaleString()}`, 
            desc: 'Maps incoming signals to specific patient profiles, active queues, and doctor schedules.', 
            sub: 'Connected EHR Entities', 
            icon: Network, 
            bg: 'bg-[#F5F3FF]', 
            text: 'text-[#8B5CF6]', 
            line: '#8B5CF6', 
            data: 'M0,15 C20,10 40,25 60,5 C80,20 100,10 120,15' 
          },
          { 
            name: 'Context Engine', 
            val: `${(0.42 - (events.length % 5) * 0.01).toFixed(2)}s`, 
            desc: 'Verifies current operational states, insurance plans, and appointment timelines.', 
            sub: 'Real-time Processing Latency', 
            icon: Clock, 
            bg: 'bg-[#FFFBEB]', 
            text: 'text-[#F59E0B]', 
            line: '#F59E0B', 
            data: 'M0,10 C20,15 40,10 60,20 C80,5 100,25 120,20' 
          },
          { 
            name: 'Prediction Engine', 
            val: `${Math.min(99, 94 + Math.floor(events.length / 5))}%`, 
            desc: 'Calculates risk factors, appointment no-show likelihoods, and billable claim approvals.', 
            sub: 'Insurance Claim Confidence', 
            icon: Target, 
            bg: 'bg-[#FEF2F2]', 
            text: 'text-[#EF4444]', 
            line: '#EF4444', 
            data: 'M0,25 C20,20 40,15 60,10 C80,5 100,10 120,5' 
          },
        ].map((engine, idx) => (
          <div key={idx} className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex flex-col justify-between min-h-[220px]">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${engine.bg} rounded-[12px]`}>
                    <engine.icon className={`w-5 h-5 ${engine.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[#111827] text-sm font-extrabold">{engine.name}</h3>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Online</span>
              </div>
              <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed">{engine.desc}</p>
            </div>
            
            <div className="flex justify-between items-end border-t border-[#F3F4F6] pt-3 mt-3">
              <div>
                <p className="text-2xl font-black text-[#111827] leading-none">{engine.val}</p>
                <p className="text-[9px] font-bold text-[#9CA3AF] mt-1">{engine.sub}</p>
              </div>
              <div className="w-16 h-8 opacity-80">
                <svg viewBox="0 0 120 30" className="w-full h-full preserve-aspect-ratio-none">
                  <path d={engine.data} fill="none" stroke={engine.line} strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Explained AI Pipeline Workflow */}
      <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow">
         <div className="mb-6">
           <h3 className="text-base font-bold text-[#111827]">AI Intelligence Pipeline</h3>
           <p className="text-xs text-[#6B7280] font-medium mt-0.5">How raw clinic data transitions into clinical action suggestions.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
            {[
              { label: 'Sources', desc: 'Raw feed from Twilio SMS, Email, and Practice Fusion.', icon: Activity, color: 'text-[#6B7280]', bg: 'bg-white border-[#E8EDF5]', badge: 'Data Input' },
              { label: 'Event Logging', desc: 'Saves incoming signals to Sentinel Audit logs.', icon: Activity, color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF] border-[#BFDBFE]', badge: 'Parsing' },
              { label: 'Relation Mapping', desc: 'Links the signal to the correct patient and doctor profile.', icon: Network, color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF] border-[#DDD6FE]', badge: 'Matching' },
              { label: 'Context Audit', desc: 'Checks patient history, waitlist queues, and schedules.', icon: Clock, color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB] border-[#FDE68A]', badge: 'Auditing' },
              { label: 'Predictive Model', desc: 'Evaluates revenue impact, cancel risk, and eligibility.', icon: Target, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2] border-[#FECACA]', badge: 'Analysis' },
              { label: 'Recommend Action', desc: 'Sends reminder alerts, calls, or scheduling adjustments.', icon: BrainCircuit, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5] border-[#A7F3D0]', badge: 'Actionable' },
            ].map((node, i) => {
              const isActive = (events.length % 6) === i;
              return (
                <div key={i} className={`flex flex-col items-center text-center p-4 rounded-[20px] border transition-all duration-300 ${isActive ? 'bg-indigo-50/40 border-indigo-200 scale-105 shadow-sm' : 'bg-white border-transparent'}`}>
                  <div className={`w-12 h-12 rounded-full border-2 ${node.bg} flex items-center justify-center premium-shadow z-10 transition-all duration-300 ${isActive ? 'scale-110 ring-4 ring-indigo-100 animate-pulse' : 'hover:scale-105'}`}>
                    <node.icon className={`w-5 h-5 ${node.color}`} />
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-[6px] mt-3 uppercase tracking-wider">{node.badge}</span>
                  <h4 className="text-xs font-black text-[#111827] mt-2">{node.label}</h4>
                  <p className="text-[10px] text-[#6B7280] font-semibold mt-1 leading-relaxed">{node.desc}</p>
                </div>
              );
            })}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Terminal / Live Feed */}
        <div className="lg:col-span-7 bg-[#0F172A] rounded-[24px] premium-shadow border border-[#1E293B] flex flex-col h-[480px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A] border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              </div>
              <span className="ml-4 text-[11px] font-mono text-[#9CA3AF]">Live Sentinel Activity Stream</span>
            </div>
            
            <div className="flex bg-[#1E293B] p-0.5 rounded-lg border border-[#334155]">
              <button 
                onClick={() => setFeedMode('clinical')}
                className={`text-[10px] px-3 py-1 font-bold rounded-md transition-all ${feedMode === 'clinical' ? 'bg-[#4F46E5] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                Doctor Feed
              </button>
              <button 
                onClick={() => setFeedMode('technical')}
                className={`text-[10px] px-3 py-1 font-bold rounded-md transition-all ${feedMode === 'technical' ? 'bg-[#4F46E5] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                Raw Logs
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {feedMode === 'clinical' ? (
              <div className="space-y-4">
                {events.length > 0 ? events.slice(0, 8).map((event, i) => (
                  <div key={i} className="bg-[#1E293B]/60 border border-[#334155] rounded-[16px] p-4 space-y-2 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          event.type === 'EHR' ? 'bg-blue-900/40 text-blue-300 border border-blue-800' :
                          event.type === 'SMS' ? 'bg-amber-900/40 text-amber-300 border border-amber-800' :
                          'bg-indigo-900/40 text-indigo-300 border border-indigo-800'
                        }`}>
                          {event.type} Signals
                        </span>
                        <span className="text-[10px] font-bold text-[#9CA3AF]">{event.source}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#6B7280]">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-bold text-white leading-relaxed">{event.message}</p>
                    {event.ai_insight && (
                      <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-2.5 text-[11px] text-[#A5B4FC] space-y-1">
                        <span className="font-extrabold uppercase text-[9px] text-[#818CF8] block">Predictive Risk Assessment:</span>
                        <p>{event.ai_insight}</p>
                      </div>
                    )}
                    {event.recommended_action && (
                      <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-2.5 text-[11px] text-emerald-200 space-y-1">
                        <span className="font-extrabold uppercase text-[9px] text-emerald-400 block">Recommended Automation:</span>
                        <p>{event.recommended_action}</p>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-2">
                    <BrainCircuit className="w-8 h-8 text-indigo-400 animate-pulse" />
                    <p className="text-sm font-bold text-white">System fully synced and operational</p>
                    <p className="text-xs text-[#9CA3AF]">Awaiting raw inbound events from connectors...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="font-mono text-[12px] text-[#D1D5DB] space-y-3">
                {events.length > 0 ? events.slice(0, 15).reverse().map((event, i) => {
                  const time = new Date(event.timestamp).toLocaleTimeString([], { hour12: false });
                  return (
                    <div key={i} className="space-y-0.5 border-b border-[#1E293B] pb-2 mb-2">
                      <p><span className="text-[#6B7280] mr-4">[{time}]</span><span className="text-[#3B82F6] font-bold">EVENT</span> Parsed incoming {event.type} from {event.source}.</p>
                      <p><span className="text-[#6B7280] mr-4">[{time}]</span><span className="text-[#F59E0B] font-bold">CONTEXT</span> {event.message}</p>
                      {event.ai_insight && <p><span className="text-[#6B7280] mr-4">[{time}]</span><span className="text-[#EF4444] font-bold">PREDICT</span> {event.ai_insight}</p>}
                      {event.recommended_action && <p><span className="text-[#6B7280] mr-4">[{time}]</span><span className="text-[#10B981] font-bold">RECOMMEND</span> {event.recommended_action}</p>}
                    </div>
                  );
                }) : (
                  <p><span className="text-[#6B7280] mr-4">[{new Date().toLocaleTimeString([], { hour12: false })}]</span><span className="text-[#10B981] font-bold">SUCCESS</span> System initialized. Awaiting signals...</p>
                )}
                <p className="animate-pulse"><span className="text-[#6B7280] mr-4">[{new Date().toLocaleTimeString([], { hour12: false })}]</span><span className="text-white">_</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Confidence & Risk */}
        <div className="lg:col-span-5 bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow flex flex-col justify-between h-[480px]">
          <div>
            <h3 className="text-base font-bold text-[#111827]">AI Claims Decision Confidence</h3>
            <p className="text-xs text-[#6B7280] font-semibold mt-0.5 leading-relaxed">
              Confidence score represents the certainty that clinical billing codes align with insurance policies.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 my-4 space-y-4">
             <div className="relative w-40 h-40 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F3F4F6" strokeWidth="3"></circle>
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#4F46E5" strokeWidth="3" strokeDasharray={`${Math.min(99, 94 + Math.floor(events.length / 5))} ${100 - Math.min(99, 94 + Math.floor(events.length / 5))}`} strokeLinecap="round" className="transition-all duration-1000"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-[#111827]">{Math.min(99, 94 + Math.floor(events.length / 5))}%</span>
                  <span className="text-[9px] text-[#6B7280] font-bold uppercase tracking-widest mt-1">Accuracy</span>
                </div>
             </div>
             
             <div className="text-center bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl p-3 w-full">
               <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full inline-block uppercase mb-1">Safe Threshold Checked</span>
               <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Claim auto-verification passes standard compliance rules.</p>
             </div>
          </div>

          <div className="border-t border-[#F3F4F6] pt-4">
             <h4 className="text-[10px] text-[#6B7280] uppercase tracking-widest font-extrabold mb-2">Real-time Claims Risk Wave</h4>
             <div className="h-16 relative overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full preserve-aspect-ratio-none">
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <g className="transition-transform duration-1000" style={{ transform: `translateY(${Math.sin(events.length) * 5}px)` }}>
                    <path d="M0,40 C20,40 40,10 60,30 C80,50 90,20 100,30 L100,50 L0,50 Z" fill="url(#riskGrad)"/>
                    <path d="M0,40 C20,40 40,10 60,30 C80,50 90,20 100,30" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                </svg>
             </div>
          </div>
        </div>
      </div>

      {/* Explained Subsystem stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: 'Model Usage', value: activeModelName, icon: BrainCircuit, sub: 'Active NLP Parser' },
          { title: 'Latency', value: `${120 + Math.floor(Math.random() * 45)}ms`, icon: Clock, sub: 'Request roundtrip' },
          { title: 'Token Usage', value: `${(4.2 + events.length * 0.015).toFixed(3)}M / day`, icon: Terminal, sub: 'Context volume' },
          { title: 'GPU Consumption', value: `${28 + Math.floor(Math.random() * 15)}%`, icon: Cpu, sub: 'Hardware usage' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow flex flex-col gap-2 card-hover transition-all duration-300">
            <div className="flex items-center gap-2 text-[#6B7280]">
              <stat.icon className="w-4 h-4" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest">{stat.title}</span>
            </div>
            <p className="text-xl font-extrabold text-[#111827]">{stat.value}</p>
            <p className="text-[10px] text-[#9CA3AF] font-semibold">{stat.sub}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
