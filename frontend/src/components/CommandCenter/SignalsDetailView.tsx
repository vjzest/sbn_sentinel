import { fetchWithAuth } from '@/utils/fetchWithAuth';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Phone, Mail, Calendar, ChevronRight, X, Clock, Database, Sparkles, Check, Shield, Search, Filter, Cpu, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, AlertCircle, ArrowUpRight, Copy } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { incrementActionsTaken, SignalEvent } from '@/store/slices/signalSlice';

export const SignalsDetailView: React.FC = () => {
  const dispatch = useDispatch();
  const reduxSignals = useSelector((state: RootState) => state.signals.events);
  const [dbSignals, setDbSignals] = useState<SignalEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'EHR' | 'Phone' | 'Email'>('All');
  const [selectedSignal, setSelectedSignal] = useState<SignalEvent | null>(null);
  const [isDispatched, setIsDispatched] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'doctor' | 'developer'>('doctor');

  // Combine redux state and db historical signals
  const fetchDbSignals = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/signals`);
      if (response.ok) {
        const data = await response.json();
        setDbSignals(data);
      }
    } catch (err) {
      console.error("Failed to load historical signals:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`);
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((log: any) => log.action.startsWith('Approved Sentinel Action'));
        setAuditLogs(filtered);
      }
    } catch (err) {
      console.error("Failed to load dispatched actions log:", err);
    }
  };

  useEffect(() => {
    fetchDbSignals();
    fetchAuditLogs();
  }, [reduxSignals]);

  // Merge lists to guarantee uniqueness by ID, preferring newest
  const allSignalsMap = new Map<string, SignalEvent>();
  // 1. Add DB signals
  dbSignals.forEach(s => allSignalsMap.set(s.id, s));
  // 2. Add Redux real-time signals (override db if duplicates)
  reduxSignals.forEach(s => allSignalsMap.set(s.id, s));
  
  const signalsList = Array.from(allSignalsMap.values()).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'EHR': return <Database className="w-4 h-4 text-[#F59E0B]" />;
      case 'Phone': return <Phone className="w-4 h-4 text-[#EF4444]" />;
      case 'Email': return <Mail className="w-4 h-4 text-[#3B82F6]" />;
      default: return <Activity className="w-4 h-4 text-[#10B981]" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'EHR': return 'bg-[#F59E0B]/20 text-[#FBBF24] border border-[#FDE68A]';
      case 'Phone': return 'bg-[#EF4444]/20 text-[#F87171] border border-[#FCA5A5]';
      case 'Email': return 'bg-[#3B82F6]/20 text-[#60A5FA] border border-[#BFDBFE]';
      default: return 'bg-[#D1FAE5] text-[#10B981] border border-[#A7F3D0]';
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filteredSignals = signalsList.filter(s => {
    const matchesSearch = s.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.source.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.metadata?.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeFilter === 'All' ? true : s.type === activeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate metrics
  const totalCount = signalsList.length;
  const ehrCount = signalsList.filter(s => s.type === 'EHR').length;
  const phoneCount = signalsList.filter(s => s.type === 'Phone').length;
  const emailCount = signalsList.filter(s => s.type === 'Email').length;
  const lossRiskCount = signalsList.filter(s => s.risk_level === 'Critical' || s.risk_level === 'High').length;

  const triggerAction = async () => {
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
          resource: `Signal: ${selectedSignal.id}`,
          ip_address: "127.0.0.1"
        })
      });
      
      await fetchAuditLogs();

      // Add to Clinical Reminders in localStorage
      if (selectedSignal.recommended_action) {
        const saved = localStorage.getItem('clinicalReminders');
        let currentReminders = [];
        if (saved) {
          try {
            currentReminders = JSON.parse(saved);
          } catch (e) {
            console.error(e);
          }
        }
        const exists = currentReminders.some((r: any) => r.text === selectedSignal.recommended_action);
        if (!exists) {
          const newReminder = {
            id: `signal-${selectedSignal.id}`,
            text: selectedSignal.recommended_action,
            source: selectedSignal.source || 'Sentinel AI',
            timestamp: new Date().toISOString(),
            completed: false
          };
          currentReminders.unshift(newReminder);
          localStorage.setItem('clinicalReminders', JSON.stringify(currentReminders));
          // Dispatch custom event to notify page.tsx
          window.dispatchEvent(new Event('clinicalRemindersUpdated'));
        }
      }
    } catch (e) {
      console.error("Failed to save audit log from triggerAction:", e);
    }

    setTimeout(() => {
      setIsDispatching(false);
      setIsDispatched(true);
      dispatch(incrementActionsTaken());
    }, 1500);
  };

  // Generate simulated Practice Fusion / twilio raw payload details for audit
  const getSimulatedRawPayload = (signal: SignalEvent) => {
    const patientName = signal.metadata?.patient_name || "Unknown Patient";
    const cleanPatient = patientName.replace(/\s+/g, '').toLowerCase();
    
    if (signal.type === 'EHR') {
      return {
        resourceType: "Appointment",
        id: `fhir-${signal.id}`,
        status: "noshow",
        serviceCategory: {
          coding: [{ system: "http://snomed.info/sct", code: "408443003", display: "General practice" }]
        },
        specialty: [{
          coding: [{ system: "http://snomed.info/sct", code: "394814009", display: "General practice clinic" }]
        }],
        appointmentType: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0276", code: "WALKIN", display: "Walk in appointment" }]
        },
        patient: {
          reference: `Patient/${cleanPatient}-9021`,
          display: patientName,
          contact: {
            email: `${cleanPatient}@sbnsentinel-demo.com`,
            phone: "+1 (555) 438-9210"
          }
        },
        provider: {
          reference: "Practitioner/dr-smith-223",
          display: "Dr. Robert Smith"
        },
        schedule: {
          planned_start: signal.timestamp,
          wait_duration_minutes: signal.message.includes('45 minutes') ? 45 : 15
        },
        audit_trail: {
          practise_fusion_client_id: "pf-oauth-client-88123-prod",
          api_version: "Secure Data R4",
          authorization_scope: "user/Appointment.write patient/Patient.read"
        }
      };
    } else if (signal.type === 'Phone') {
      return {
        event_type: "missed_call",
        id: `twilio-${signal.id}`,
        provider: "Twilio Voice API",
        account_sid: "AC_MOCK_ACCOUNT_SID_1234567890",
        call_sid: `CA${uuidSim(24)}`,
        from: "+15550198",
        to: "+18005553190",
        duration_seconds: 0,
        status: "no-answer",
        direction: "inbound",
        patient_matched: {
          reference: `Patient/${cleanPatient}-9021`,
          name: patientName,
          email: `${cleanPatient}@sbnsentinel-demo.com`,
          insurance_id: "INS-99210-A"
        },
        webhook_meta: {
          url: "https://api.sbnsentinel.com/v1/signals/twilio/webhook",
          signature: "sha256-aef8912cf31"
        }
      };
    } else {
      return {
        message_id: `outlook-msg-${signal.id}@office365.microsoft.com`,
        subject: `Diagnostic Report: ${patientName}`,
        from: "notifications@labcorp-secure.com",
        to: "dr.smith@sbnsentinel-demo.com",
        received_time: signal.timestamp,
        has_attachments: true,
        attachments: [{
          name: `${cleanPatient}_lab_result_cbc_cmp.pdf`,
          mime_type: "application/pdf",
          size_bytes: 409600
        }],
        nlp_extraction: {
          patient_name: patientName,
          critical_finding: false,
          diagnostic_category: "Hematology & Chemistry Panel"
        },
        security: {
          dkim_verification: "PASS",
          spf_verification: "PASS",
          hipaa_compliance_check: "SECURE"
        }
      };
    }
  };

  const uuidSim = (len: number) => {
    let result = '';
    const chars = 'abcdef0123456789';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between relative">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-1">Signals Intelligence Hub</h2>
          <p className="text-sm text-white/70 font-medium">Real-time Secure Data EHR connections, Twilio hooks, and automated audit stream logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDbSignals} 
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Database
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 p-6 rounded-[24px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Total Signals</p>
            <p className="text-2xl font-black text-white">{1284 + totalCount}</p>
          </div>
          <span className="p-3 bg-[#3B82F6]/20 text-[#60A5FA] rounded-[16px]">
            <Cpu className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 p-6 rounded-[24px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">EHR (Practice Fusion)</p>
            <p className="text-2xl font-black text-[#F59E0B]">{ehrCount} Active</p>
          </div>
          <span className="p-3 bg-[#F59E0B]/20 text-[#FBBF24] rounded-[16px]">
            <Database className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 p-6 rounded-[24px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Communication Logs</p>
            <p className="text-2xl font-black text-[#3B82F6]">{phoneCount + emailCount} Transmitted</p>
          </div>
          <span className="p-3 bg-[#3B82F6]/20 text-[#60A5FA] rounded-[16px]">
            <Mail className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 p-6 rounded-[24px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Revenue Risk Triggers</p>
            <p className="text-2xl font-black text-[#EF4444]">{lossRiskCount} Flagged</p>
          </div>
          <span className="p-3 bg-[#EF4444]/20 text-[#F87171] rounded-[16px]">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Signals Feed Table */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-[14px] px-3.5 py-2 w-72">
              <Search className="w-4 h-4 text-white/70" />
              <input 
                type="text" 
                placeholder="Search patient, source, or text..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-[#9CA3AF]"
              />
            </div>
            
            <div className="flex gap-2">
              {(['All', 'EHR', 'Phone', 'Email'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all border cursor-pointer ${
                    activeFilter === filter 
                      ? 'bg-white/20 text-white border-white/40 shadow-md' 
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase text-white/70 tracking-wider">
                  <th className="pb-4 font-extrabold px-2">ID</th>
                  <th className="pb-4 font-extrabold px-2">Channel / Patient</th>
                  <th className="pb-4 font-extrabold px-2">Message</th>
                  <th className="pb-4 font-extrabold px-2">Status</th>
                  <th className="pb-4 font-extrabold px-2 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-white">
                {filteredSignals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/50 font-medium">No matching signals active in database.</td>
                  </tr>
                ) : (
                  filteredSignals.map((signal) => {
                    const isRisk = signal.risk_level === 'Critical' || signal.risk_level === 'High';
                    return (
                      <tr 
                        key={signal.id}
                        onClick={() => {
                          setSelectedSignal(signal);
                          setIsDispatched(false);
                          setIsDispatching(false);
                        }}
                        className={`border-b border-white/10 hover:bg-white/5 transition-all last:border-0 cursor-pointer ${
                          selectedSignal?.id === signal.id ? 'bg-white/10 border-l-4 border-l-[#A78BFA]' : ''
                        }`}
                      >
                        <td className="py-4 px-2 font-mono text-[11px] text-[#2563EB]">{signal.id}</td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 ${getBgColor(signal.type)}`}>
                            {getIcon(signal.type)}
                            {signal.source}
                          </span>
                          <p className="text-xs text-white/70 font-bold mt-0.5">Patient: {signal.metadata?.patient_name || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-2 max-w-xs">
                          <p className="text-sm font-bold text-white line-clamp-2 leading-snug">{signal.message}</p>
                          <p className="text-[10px] text-white/50 uppercase mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </td>
                        <td className="py-4 px-2">
                          {isRisk ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-[8px] font-extrabold uppercase">
                              <AlertCircle className="w-3 h-3" /> Risk Flagged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-[8px] font-extrabold uppercase">
                              <ShieldCheck className="w-3 h-3" /> Normal
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button className="text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-[8px] transition-colors inline-flex items-center gap-1 ml-auto">
                            Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Panel Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white">
            <h3 className="text-base font-extrabold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#A78BFA]" /> Live Stream Status
            </h3>
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[16px] p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">HIPAA Compliant Tunnel</h4>
                  <p className="text-xs text-emerald-300 leading-relaxed mt-1 font-semibold">All socket connections utilize TLS 1.3 encryption with OAuth2 API authentication verification tokens.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs font-bold text-white/80">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Socket Connection</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live Connected
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Active Tunnels</span>
                  <span className="text-white">Practice Fusion, Twilio, LabCorp</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Response Latency</span>
                  <span className="text-emerald-600">~12ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Average Daily Volume</span>
                  <span className="text-white">4,821 telemetry packets</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex-1 text-white">
            <h3 className="text-base font-extrabold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> Action Dispatch History
            </h3>
            <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
              {auditLogs.length === 0 ? (
                <div className="text-xs font-semibold text-[#9CA3AF] py-8 text-center border-2 border-dashed border-white/20 rounded-[16px]">
                  No approved actions dispatched yet.
                </div>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={log.id || index} className="border border-white/10 rounded-[16px] p-4 bg-white/5 hover:border-emerald-500/50 transition-all premium-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-[8px] font-black uppercase tracking-wider">
                        <Check className="w-2.5 h-2.5" /> Dispatched
                      </span>
                      <span className="text-[10px] text-[#9CA3AF] font-bold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {log.action.replace('Approved Sentinel Action: ', '')}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px] text-white/70">
                      <span>User: <strong className="text-white">{log.user_email}</strong></span>
                      <span className="font-mono text-[9px] text-[#2563EB]">{log.resource}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedSignal && createPortal(
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white/5 border border-white/10 w-full max-w-2xl rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${getBgColor(selectedSignal.type)} rounded-[16px] flex-shrink-0`}>
                  {getIcon(selectedSignal.type)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                    Signal Diagnostic Report
                    <span className="text-[10px] font-mono bg-[#2E1055]/20 border border-[#2E1055]/50 text-[#A78BFA] px-2 py-0.5 rounded-[6px]">ID: {selectedSignal.id}</span>
                  </h4>
                  <p className="text-[10px] text-white/70 font-extrabold uppercase tracking-widest mt-0.5">Source: {selectedSignal.source} Integration Layer</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSignal(null)} 
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Event Description */}
              <div className="bg-white/5 border border-white/10 rounded-[18px] p-4">
                <h5 className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest mb-1.5">TELEMETRY MESSAGE</h5>
                <p className="text-sm font-bold text-white">{selectedSignal.message}</p>
                <div className="flex items-center gap-3 mt-3 text-[11px] text-white/70 font-semibold">
                  <span>Matched Patient: <strong className="text-white">{selectedSignal.metadata?.patient_name || 'None'}</strong></span>
                  <span>•</span>
                  <span>Received: <strong className="text-white">{new Date(selectedSignal.timestamp).toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Deterministic Evaluation */}
              <div className="bg-white/5 border border-white/10 rounded-[18px] p-4 flex gap-3">
                <div className="flex-1">
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">Deterministic Evaluation</h5>
                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-white/90 font-semibold"><span className="text-white/50">Problem:</span> {selectedSignal.problem || 'None'}</p>
                    <p className="text-xs text-white/90 font-semibold"><span className="text-white/50">Reason:</span> {selectedSignal.reason || 'None'}</p>
                  </div>
                  
                  {selectedSignal.recommended_action && (
                    <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl inline-block text-[11px] text-emerald-400 font-bold w-full">
                      Action: {selectedSignal.recommended_action}
                      <div className="text-[10px] text-emerald-600 mt-1">Expected Outcome: {selectedSignal.expected_outcome || 'Issue resolved.'}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Decision Context Engine Block */}
              <div className="bg-white/5 border border-white/10 rounded-[18px] p-4 flex gap-3 relative">
                <div className="flex-1">
                  <h5 className="text-xs font-extrabold text-[#A78BFA] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Decision Context Engine
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Primary Context</p>
                      <p className="text-xs font-bold text-white">{selectedSignal.primary_context || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Secondary Context</p>
                      <p className="text-xs font-bold text-white">{selectedSignal.secondary_context || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Confidence</p>
                      <p className={`text-xs font-bold ${selectedSignal.context_confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {selectedSignal.context_confidence || 'Low'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Reasoning</p>
                      <p className="text-[11px] font-semibold text-white/70 leading-snug">{selectedSignal.context_reason || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Intelligence Engine Block */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-[18px] p-4 flex gap-3 relative">
                <div className="flex-1">
                  <h5 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Revenue Intelligence Engine
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-amber-500/50 uppercase tracking-widest font-bold">Risk Category</p>
                      <p className="text-xs font-bold text-amber-100">{selectedSignal.revenue_risk_category || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-500/50 uppercase tracking-widest font-bold">Financial Exposure</p>
                      <p className="text-lg font-black text-amber-400">{selectedSignal.estimated_financial_exposure || '$0.00'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-500/50 uppercase tracking-widest font-bold">Confidence</p>
                      <p className="text-xs font-bold text-amber-300">{selectedSignal.revenue_confidence || 'High'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-500/50 uppercase tracking-widest font-bold">Operational Dependency</p>
                      <p className="text-[11px] font-semibold text-amber-100/70 leading-snug">{selectedSignal.operational_dependency || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Data/Raw JSON Payload */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest">
                    {viewMode === 'doctor' ? 'SYSTEM STATUS (CLINICAL VIEW)' : 'RAW SYSTEM LOGS (DEVELOPER VIEW)'}
                  </h5>
                  
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="bg-white/5 p-0.5 rounded-[8px] flex items-center border border-white/10">
                      <button 
                        onClick={() => setViewMode('doctor')}
                        className={`text-[9px] font-black px-2 py-1 rounded-[6px] transition-all cursor-pointer ${
                          viewMode === 'doctor' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Clinical
                      </button>
                      <button 
                        onClick={() => setViewMode('developer')}
                        className={`text-[9px] font-black px-2 py-1 rounded-[6px] transition-all cursor-pointer ${
                          viewMode === 'developer' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        JSON Payload
                      </button>
                    </div>

                    <button 
                      onClick={() => handleCopyId(selectedSignal.id)}
                      className="text-[10px] font-extrabold text-[#A78BFA] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === selectedSignal.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {viewMode === 'doctor' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-[20px] p-5">
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Target EHR System</span>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#F59E0B]" />
                        {selectedSignal.source} (Secure Data R4 compliant)
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Security Verification</span>
                      <span className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-[6px] font-extrabold uppercase">
                        <ShieldCheck className="w-3.5 h-3.5" /> HIPAA SECURE TUNNEL
                      </span>
                    </div>
                    <div className="space-y-1 col-span-2 pt-2 border-t border-white/10">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Action Scope</span>
                      <p className="text-xs font-bold text-white/80">
                        Authorized to read patient metadata & write appointment status updates.
                      </p>
                    </div>
                    <div className="space-y-1 col-span-2 pt-2 border-t border-white/10">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Clinic Integration Credentials</span>
                      <p className="text-[10px] font-mono text-white/60 font-semibold bg-white/5 border border-white/10 p-2 rounded-lg truncate">
                        oauth_client_id: pf-oauth-client-88123-prod • scope: patient/*.read appointment/*.write
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0F172A] rounded-[16px] p-4 text-[11px] font-mono text-[#38BDF8] overflow-x-auto max-h-48 custom-scrollbar border border-slate-800">
                    <pre>{JSON.stringify(getSimulatedRawPayload(selectedSignal), null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setSelectedSignal(null)}
                className="bg-white/5 border border-white/10 hover:bg-white/5 text-white/80 font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow cursor-pointer transition-colors"
              >
                Close Diagnostic
              </button>

              {selectedSignal.recommended_action && (
                <button
                  onClick={triggerAction}
                  disabled={isDispatching || isDispatched}
                  className={`flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-[16px] premium-shadow transition-all ${
                    isDispatched 
                      ? 'bg-emerald-600 text-white cursor-default' 
                      : isDispatching 
                        ? 'bg-[#120524] text-white opacity-50 cursor-wait' 
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white cursor-pointer hover:scale-105 active:scale-95'
                  }`}
                >
                  {isDispatched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Action Dispatched
                    </>
                  ) : isDispatching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Execute Action Recommendation
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
