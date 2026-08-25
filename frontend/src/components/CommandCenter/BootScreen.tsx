'use client';
import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Database, HardDrive, Cpu, CheckCircle } from 'lucide-react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: 'Connecting to SBN Sentinel telemetry store...', icon: Database },
    { text: 'Initializing EHR & reality connectors (Practice Fusion, Twilio)...', icon: HardDrive },
    { text: 'Enforcing Security Controls and active audit logs...', icon: ShieldCheck },
    { text: 'Starting SBN Rules Engine and anomaly detection...', icon: Cpu },
    { text: 'Boot sequence complete. Opening Command Center...', icon: CheckCircle }
  ];

  useEffect(() => {
    let isMounted = true;

    const performBoot = async () => {
      try {
        // Step 0: Base UI wait
        await new Promise(r => setTimeout(r, 500));
        if (!isMounted) return;
        setLogs(prev => [...prev, steps[0].text]);
        setCurrentStep(1);

        // Step 1: Actually fetch health
        const res = await fetch('http://localhost:8000/api/v1/health/verify');
        if (!res.ok) throw new Error('Backend unreachabe');
        const healthData = await res.json();
        
        if (!isMounted) return;
        
        if (healthData.status === "Degraded" || healthData.status === "Healthy") {
           setLogs(prev => [...prev, `System Status: ${healthData.status}`]);
           setCurrentStep(2);
           await new Promise(r => setTimeout(r, 400));
           
           setLogs(prev => [...prev, `DB: ${healthData.database}, Cache: ${healthData.rules_engine_cache}`]);
           setCurrentStep(3);
           await new Promise(r => setTimeout(r, 400));

           setLogs(prev => [...prev, steps[4].text]);
           setCurrentStep(4);
           
           setTimeout(() => {
             if (isMounted) onComplete();
           }, 600);
        } else {
           throw new Error('Unhealthy status returned');
        }

      } catch (error) {
        if (!isMounted) return;
        setLogs(prev => [...prev, 'CRITICAL FAILURE: ' + (error as Error).message]);
        // Do not complete boot on failure
      }
    };

    performBoot();

    return () => { isMounted = false; };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0B1121] text-white font-mono flex flex-col items-center justify-center z-50 p-6">
      {/* Radar Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#2E1055]/10 to-[#120524]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-xl flex flex-col items-center relative z-10">
        {/* Animated Sentinel Core Logo */}
        <div className="mb-10 relative">
          <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#2E1055] to-[#120524] flex items-center justify-center text-white font-extrabold text-4xl shadow-[0_0_40px_rgba(79,70,229,0.5)] animate-bounce">
            S
          </div>
          <div className="absolute -inset-2 border-2 border-[#2E1055]/30 rounded-[28px] animate-ping opacity-75"></div>
        </div>

        <h2 className="text-xl font-bold tracking-[0.15em] uppercase text-slate-100 mb-2">SBN SENTINEL V1</h2>
        <p className="text-[10px] text-slate-300 tracking-widest uppercase mb-8">System Boot Experience Sequence</p>

        {/* Diagnostic Logs Panel */}
        <div className="w-full bg-[#121B2E] border border-slate-800 rounded-[20px] p-6 shadow-2xl space-y-3 min-h-[220px]">
          {logs.map((log, index) => {
            const Icon = steps[index].icon;
            return (
              <div key={index} className="flex items-center gap-3 text-xs text-emerald-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-bold">{log}</span>
                <span className="ml-auto text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-extrabold">OK</span>
              </div>
            );
          })}
          {currentStep < steps.length && (
            <div className="flex items-center gap-3 text-xs text-slate-500 animate-pulse">
              <Activity className="w-4 h-4 text-[#A78BFA] shrink-0 animate-spin" />
              <span>Checking {steps[currentStep].text.toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#2E1055] to-[#120524] h-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Signature Bottom Bar (Founded by Iftikhar Ali Khan) */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[10px] tracking-[0.25em] text-slate-300 uppercase font-bold">
          Founded by <span className="text-[#A78BFA] font-extrabold drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]">Iftikhar Ali Khan</span>
        </p>
        <p className="text-[9px] text-slate-500 mt-1">SBN Sentinel Command Center V1.0</p>
      </div>
    </div>
  );
};
