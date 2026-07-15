import React, { useState, useEffect } from 'react';
import { CalendarDays, ArrowRight, Zap, Users, Clock, CheckCircle2, ChevronDown, Move, Sparkles, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const ScheduleOptimizerView: React.FC = () => {
  const stats = useSelector((state: RootState) => state.signals.stats);
  const events = useSelector((state: RootState) => state.signals.events);
  
  const [dateRange, setDateRange] = useState('This Week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [workloadBalanced, setWorkloadBalanced] = useState(false);
  const [waitingTimeReduced, setWaitingTimeReduced] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Live Encounters DB State
  const [encounters, setEncounters] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/encounters`)
      .then(res => res.json())
      .then(data => {
        setEncounters(data);
      })
      .catch(() => {});
  }, [events.length]);

  const eLen = events.length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleOptimize = () => {
    if (isOptimized) {
      showToast("Schedule is already fully optimized!");
      return;
    }
    setIsOptimized(true);
    showToast("⚡ AI Scheduler: Emily Davis routed into open Thursday 11:00 AM slot successfully!");
  };

  const handleBalanceWorkload = () => {
    if (workloadBalanced) return;
    setWorkloadBalanced(true);
    showToast("🔄 Workload Balanced: Shifted 3 checkups to Dr. Patel. Doctor Smith's queue cleared.");
  };

  const handleReduceWaitingTime = () => {
    if (waitingTimeReduced) return;
    setWaitingTimeReduced(true);
    showToast("⏰ Queue Time Reduced: Provider lunch break adjusted. Estimated wait times reduced to 8 minutes.");
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8 relative">
      
      {/* Toast Alert Banner */}
      {mounted && toast && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-6 right-6 z-[99999] bg-[#111827] text-white border border-[#374151] rounded-[20px] p-5 premium-shadow flex items-center gap-3.5 animate-in slide-in-from-top-6 duration-300 max-w-md">
          <div className="w-9 h-9 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">{toast}</p>
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#111827] mb-1">Appointment Schedule Optimizer</h2>
          <p className="text-sm text-[#6B7280] font-medium">AI-driven patient routing, provider workload balancing, and clinic capacity manager.</p>
        </div>
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-white border border-[#E8EDF5] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow hover:bg-[#F7F9FC] cursor-pointer transition-colors active:scale-95 select-none"
          >
            <CalendarDays className="w-4 h-4 text-[#6B7280]" /> 
            <span>{dateRange}</span> 
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-[#E8EDF5] rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 space-y-1">
                {['Today', 'This Week', 'Next Week', 'This Month'].map((range) => (
                  <button 
                    key={range}
                    onClick={() => { 
                      setDateRange(range); 
                      setIsDropdownOpen(false); 
                      showToast(`Switched schedule view to: ${range}`);
                    }} 
                    className={`w-full text-left px-3 py-2 text-sm font-bold rounded-[10px] transition-colors ${dateRange === range ? 'text-[#2563EB] bg-[#EEF4FF]' : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F9FC]'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explained Capacity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            title: "Today's Capacity", 
            val: `${Math.min(100, 89 + (isOptimized ? 2 : 0) + (eLen % 2))}%`, 
            desc: "Current patient intake vs maximum daily clinic limit.",
            line: '#6D5DF6', 
            bg: 'bg-[#EEF4FF]', 
            text: 'text-[#6D5DF6]', 
            icon: Zap 
          },
          { 
            title: "Booked Slots", 
            val: encounters.length + (isOptimized ? 1 : 0), 
            desc: "Active reservations booked across all clinic locations.",
            line: '#10B981', 
            bg: 'bg-[#ECFDF5]', 
            text: 'text-[#10B981]', 
            icon: CheckCircle2 
          },
          { 
            title: "Available Slots", 
            val: Math.max(0, 15 - encounters.length - (isOptimized ? 1 : 0)), 
            desc: "Remaining open periods ready for emergency walks.",
            line: '#F59E0B', 
            bg: 'bg-[#FFFBEB]', 
            text: 'text-[#F59E0B]', 
            icon: Clock 
          },
          { 
            title: "Avg Utilization", 
            val: `${Math.min(100, 95 + (isOptimized ? 1 : 0))}%`, 
            desc: "Provider shift efficiency rate and timing accuracy.",
            line: '#3B82F6', 
            bg: 'bg-[#EFF6FF]', 
            text: 'text-[#3B82F6]', 
            icon: Users 
          },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex flex-col justify-between min-h-[160px] transition-all duration-300">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[11px] text-[#6B7280] uppercase font-extrabold tracking-widest mb-0.5">{c.title}</p>
                 <p className="text-3xl font-black text-[#111827]">{c.val}</p>
               </div>
               <div className={`p-3 ${c.bg} rounded-[16px]`}>
                 <c.icon className={`w-5 h-5 ${c.text}`} />
               </div>
             </div>
             <div className="flex justify-between items-end border-t border-[#F3F4F6] pt-3 mt-3">
               <p className="text-[10px] text-slate-400 font-semibold leading-normal w-2/3">{c.desc}</p>
               <div className="w-12 h-6 opacity-60">
                 <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                   <g className="transition-transform duration-500" style={{ transform: `translateY(${Math.sin(eLen + i) * 3}px)` }}>
                     <path d="M0,20 C20,10 40,30 60,15 C80,25 100,5 100,5" fill="none" stroke={c.line} strokeWidth="3" strokeLinecap="round" />
                   </g>
                 </svg>
               </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Weekly Calendar */}
        <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow col-span-2 flex flex-col justify-between">
           <div>
             <div className="flex justify-between items-center mb-4">
               <div>
                 <h3 className="text-base font-bold text-[#111827]">Interactive Appointment Book</h3>
                 <p className="text-xs text-[#6B7280] font-semibold">Review clinic slot bookings and click open suggestions to resolve scheduling gaps.</p>
               </div>
               <div className="flex gap-2">
                 <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#6D5DF6] bg-[#EEEAFE] px-2.5 py-1 rounded-full border border-indigo-200">
                   Mon - Fri View
                 </span>
               </div>
             </div>
             
             <div className="border border-[#E8EDF5] rounded-[16px] overflow-hidden bg-white">
               {/* Table Header */}
               <div className="grid grid-cols-6 border-b border-[#E8EDF5] bg-[#F7F9FC] text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider text-center select-none">
                 <div className="p-3 border-r border-[#E8EDF5]">Time</div>
                 <div className="p-3 border-r border-[#E8EDF5]">Mon</div>
                 <div className="p-3 border-r border-[#E8EDF5]">Tue</div>
                 <div className="p-3 border-r border-[#E8EDF5]">Wed</div>
                 <div className="p-3 border-r border-[#E8EDF5]">Thu</div>
                 <div className="p-3">Fri</div>
               </div>

               {/* Table Body (Rows) */}
               <div className="divide-y divide-[#E8EDF5]">
                 {/* Row 1: 09:00 AM */}
                 <div className="grid grid-cols-6 min-h-[90px] items-stretch">
                   <div className="p-3 border-r border-[#E8EDF5] bg-[#F7F9FC] text-[#9CA3AF] text-[10px] font-extrabold flex items-center justify-center select-none">
                     09:00 AM
                   </div>
                   {/* Mon */}
                   <div className="p-2 border-r border-[#E8EDF5] flex">
                     <div 
                       onClick={() => showToast(`Encounter: Michael R. (9:00 AM Cardiology Consult)`)}
                       className="w-full bg-[#EEF4FF] border border-[#BFDBFE] text-[#2563EB] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                     >
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-wider mb-0.5 text-[#2563EB]">Cardiology</p>
                          <p className="text-xs font-extrabold truncate">Michael R.</p>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 block">Dr. Smith</span>
                     </div>
                   </div>
                   {/* Tue */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Wed */}
                   <div className="p-2 border-r border-[#E8EDF5] flex">
                     <div 
                       onClick={() => showToast(`Encounter: David L. (9:00 AM Pediatrics Visit)`)}
                       className="w-full bg-[#FFFBEB] border border-[#FDE68A] text-[#F59E0B] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                     >
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-wider mb-0.5 text-[#F59E0B]">Pediatrics</p>
                          <p className="text-xs font-extrabold truncate">David L.</p>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 block">Dr. Smith</span>
                     </div>
                   </div>
                   {/* Thu */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Fri */}
                   <div className="p-2 bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                 </div>

                 {/* Row 2: 10:00 AM */}
                 <div className="grid grid-cols-6 min-h-[90px] items-stretch">
                   <div className="p-3 border-r border-[#E8EDF5] bg-[#F7F9FC] text-[#9CA3AF] text-[10px] font-extrabold flex items-center justify-center select-none">
                     10:00 AM
                   </div>
                   {/* Mon */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Tue */}
                   <div className="p-2 border-r border-[#E8EDF5] flex">
                     <div 
                       onClick={() => showToast(`Encounter: Sarah J. (10:00 AM General Practice)`)}
                       className="w-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                     >
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-wider mb-0.5 text-[#10B981]">General Care</p>
                          <p className="text-xs font-extrabold truncate">Sarah J.</p>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 block">Dr. Patel</span>
                     </div>
                   </div>
                   {/* Wed */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Thu */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Fri */}
                   <div className="p-2 bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                 </div>

                 {/* Row 3: 11:00 AM */}
                 <div className="grid grid-cols-6 min-h-[90px] items-stretch">
                   <div className="p-3 border-r border-[#E8EDF5] bg-[#F7F9FC] text-[#9CA3AF] text-[10px] font-extrabold flex items-center justify-center select-none">
                     11:00 AM
                   </div>
                   {/* Mon */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Tue */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Wed */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Thu */}
                   <div className="p-2 border-r border-[#E8EDF5] flex">
                     {isOptimized ? (
                       <div 
                         onClick={() => showToast(`Encounter: Emily Davis (Waitlist filled via One-Click AI Optimization)`)}
                         className="w-full bg-gradient-to-br from-[#6D5DF6] to-[#7C3AED] text-white border border-[#DDD6FE] rounded-[16px] p-2 flex flex-col justify-between shadow-md cursor-pointer animate-in zoom-in duration-300 hover:scale-[1.02]"
                       >
                         <div>
                           <p className="text-[9px] uppercase font-black text-[#E0D9FD] flex items-center gap-1">
                             <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse" /> AI Scheduled
                           </p>
                           <p className="text-xs font-extrabold truncate">Emily Davis</p>
                         </div>
                         <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded font-bold inline-block self-start">100% Match</span>
                       </div>
                     ) : (
                       <div 
                         onClick={handleOptimize}
                         className="w-full border-2 border-dashed border-indigo-200 bg-[#EEEAFE]/20 hover:bg-[#EEEAFE]/50 rounded-[16px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                       >
                          <span className="text-[10px] font-extrabold text-[#8B5CF6] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-500" /> Open Target
                          </span>
                          <span className="text-[9px] font-bold text-[#6B7280]">Click to auto-fill</span>
                       </div>
                     )}
                   </div>
                   {/* Fri */}
                   <div className="p-2 bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                 </div>

                 {/* Row 4: 12:00 PM */}
                 <div className="grid grid-cols-6 min-h-[90px] items-stretch">
                   <div className="p-3 border-r border-[#E8EDF5] bg-[#F7F9FC] text-[#9CA3AF] text-[10px] font-extrabold flex items-center justify-center select-none">
                     12:00 PM
                   </div>
                   {/* Mon */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Tue */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Wed */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Thu */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Fri */}
                   <div className="p-2 flex">
                     <div 
                       onClick={() => showToast("Encounter: Urgent Care Patient Walk-in")}
                       className="w-full bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                     >
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-wider mb-0.5 text-[#EF4444]">Urgent Care</p>
                          <p className="text-xs font-extrabold truncate">Urgent Walk-in</p>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 block">Dr. Patel</span>
                     </div>
                   </div>
                 </div>

                 {/* Row 5: 01:00 PM */}
                 <div className="grid grid-cols-6 min-h-[90px] items-stretch">
                   <div className="p-3 border-r border-[#E8EDF5] bg-[#F7F9FC] text-[#9CA3AF] text-[10px] font-extrabold flex items-center justify-center select-none">
                     01:00 PM
                   </div>
                   {/* Mon */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Tue */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Wed */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Thu */}
                   <div className="p-2 border-r border-[#E8EDF5] bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                   {/* Fri */}
                   <div className="p-2 bg-slate-50/20 hover:bg-slate-50 transition-colors"></div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* AI Recommendations Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#6D5DF6] to-[#7C3AED] rounded-[24px] p-6 premium-shadow text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
             <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white opacity-10 rounded-full blur-2xl animate-pulse"></div>
             
             <div>
               <h3 className="text-base font-bold flex items-center gap-2 mb-2">
                 <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" /> AI Scheduling Copilot
               </h3>
               <p className="text-xs text-[#E0D9FD] font-medium">
                 Sentinel constantly audits empty slots and matches waitlist patients to maximize utilization.
               </p>
             </div>
             
             <div className="bg-white/10 border border-white/20 rounded-[16px] p-4 backdrop-blur-md mt-4">
               <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#E0E7FF] block mb-1">Recommended Route Suggestion</span>
               <p className="text-xs font-bold leading-relaxed mb-3 text-white">
                 Move waitlisted <strong className="text-yellow-300">Emily Davis</strong> (Cardiology, 10 mins away) into Thursday 11:00 AM open slot.
               </p>
               
               {isOptimized ? (
                 <div className="bg-white/20 text-white font-extrabold py-2 rounded-[10px] text-xs flex items-center justify-center gap-1.5 border border-white/30">
                   <Check className="w-4 h-4" /> Optimizations Applied
                 </div>
               ) : (
                 <button 
                   onClick={handleOptimize}
                   className="bg-white text-[#6D5DF6] hover:bg-[#F7F9FC] font-extrabold py-2 px-4 rounded-[10px] text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02] active:scale-98 w-full cursor-pointer select-none"
                 >
                   One-Click Auto-fill <ArrowRight className="w-4 h-4" />
                 </button>
               )}
             </div>
          </div>

          <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow flex-1 flex flex-col justify-between">
             <div>
               <h3 className="text-base font-bold text-[#111827]">Smart Workflow Suggestions</h3>
               <p className="text-xs text-[#6B7280] font-semibold mt-0.5 mb-4">
                 Apply quick balance suggestions to prevent provider fatigue or patient delays.
               </p>
             </div>
             
             <div className="space-y-4">
               {/* Balance Workload Suggestion */}
               <div 
                 onClick={handleBalanceWorkload}
                 className={`border p-4 rounded-[20px] transition-all duration-300 group ${
                   workloadBalanced 
                     ? 'border-emerald-200 bg-emerald-50/20 opacity-75 cursor-default' 
                     : 'border-[#E8EDF5] bg-[#F7F9FC] hover:border-[#BFDBFE] hover:bg-[#EEF4FF]/30 cursor-pointer hover:scale-[1.01]'
                 }`}
               >
                 <div className="flex items-center justify-between mb-1.5">
                   <div className="flex items-center gap-2.5">
                     <div className="p-1.5 bg-[#EEF4FF] rounded-lg"><Move className="w-3.5 h-3.5 text-[#2563EB]" /></div>
                     <p className="text-xs font-extrabold text-[#111827]">Balance Workload</p>
                   </div>
                   {workloadBalanced && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[6px] font-black uppercase tracking-wider">Applied</span>}
                 </div>
                 <p className="text-xs text-[#6B7280] font-medium leading-relaxed mb-2.5">
                   Move 4 non-urgent checkups from Dr. Smith to Dr. Patel to prevent delay.
                 </p>
                 {!workloadBalanced && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleBalanceWorkload(); }}
                     className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold text-[10px] py-1 px-3 rounded-[8px] transition-colors cursor-pointer"
                   >
                     ✨ Apply Workload Balance
                   </button>
                 )}
               </div>

               {/* Reduce Waiting Time Suggestion */}
               <div 
                 onClick={handleReduceWaitingTime}
                 className={`border p-4 rounded-[20px] transition-all duration-300 group ${
                   waitingTimeReduced 
                     ? 'border-emerald-200 bg-emerald-50/20 opacity-75 cursor-default' 
                     : 'border-[#E8EDF5] bg-[#F7F9FC] hover:border-[#A7F3D0] hover:bg-[#E6F4EA]/30 cursor-pointer hover:scale-[1.01]'
                 }`}
               >
                 <div className="flex items-center justify-between mb-1.5">
                   <div className="flex items-center gap-2.5">
                     <div className="p-1.5 bg-[#ECFDF5] rounded-lg"><Clock className="w-3.5 h-3.5 text-[#10B981]" /></div>
                     <p className="text-xs font-extrabold text-[#111827]">Reduce Waiting Time</p>
                   </div>
                   {waitingTimeReduced && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[6px] font-black uppercase tracking-wider">Applied</span>}
                 </div>
                 <p className="text-xs text-[#6B7280] font-medium leading-relaxed mb-2.5">
                   Shift lunch break by 15 mins to accommodate urgent care patient.
                 </p>
                 {!waitingTimeReduced && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleReduceWaitingTime(); }}
                     className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold text-[10px] py-1 px-3 rounded-[8px] transition-colors cursor-pointer"
                   >
                     ✨ Apply Break Shift
                   </button>
                 )}
               </div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
};
