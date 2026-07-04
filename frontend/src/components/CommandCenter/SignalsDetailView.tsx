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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/signals`);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`);
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
      case 'EHR': return 'bg-[#FEF3C7] text-[#F59E0B] border border-[#FDE68A]';
      case 'Phone': return 'bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]';
      case 'Email': return 'bg-[#DBEAFE] text-[#3B82F6] border border-[#BFDBFE]';
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
  const lossRiskCount = signalsList.filter(s => s.ai_insight?.toLowerCase().includes('loss')).length;

  const triggerAction = async () => {
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
          api_version: "FHIR R4",
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
          <h2 className="text-3xl font-extrabold text-[#111827] mb-1">Signals Intelligence Hub</h2>
          <p className="text-sm text-[#6B7280] font-medium">Real-time FHIR EHR connections, Twilio hooks, and automated audit stream logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDbSignals} 
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-[#E8EDF5] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-[12px] premium-shadow hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Database
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E8EDF5] p-6 rounded-[24px] premium-shadow flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-1">Total Signals</p>
            <p className="text-2xl font-black text-[#111827]">{1284 + totalCount}</p>
          </div>
          <span className="p-3 bg-[#EEF4FF] text-[#2563EB] rounded-[16px]">
            <Cpu className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white border border-[#E8EDF5] p-6 rounded-[24px] premium-shadow flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-1">EHR (Practice Fusion)</p>
            <p className="text-2xl font-black text-[#F59E0B]">{ehrCount} Active</p>
          </div>
          <span className="p-3 bg-[#FEF3C7] text-[#F59E0B] rounded-[16px]">
            <Database className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white border border-[#E8EDF5] p-6 rounded-[24px] premium-shadow flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-1">Communication Logs</p>
            <p className="text-2xl font-black text-[#3B82F6]">{phoneCount + emailCount} Transmitted</p>
          </div>
          <span className="p-3 bg-[#DBEAFE] text-[#3B82F6] rounded-[16px]">
            <Mail className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white border border-[#E8EDF5] p-6 rounded-[24px] premium-shadow flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-1">Revenue Risk Triggers</p>
            <p className="text-2xl font-black text-[#EF4444]">{lossRiskCount} Flagged</p>
          </div>
          <span className="p-3 bg-[#FEE2E2] text-[#EF4444] rounded-[16px]">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Signals Feed Table */}
        <div className="lg:col-span-2 bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white border border-[#E8EDF5] rounded-[14px] px-3.5 py-2 premium-shadow w-72">
              <Search className="w-4 h-4 text-[#6B7280]" />
              <input 
                type="text" 
                placeholder="Search patient, source, or text..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[#111827] w-full placeholder:text-[#9CA3AF]"
              />
            </div>
            
            <div className="flex gap-2">
              {(['All', 'EHR', 'Phone', 'Email'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all border cursor-pointer ${
                    activeFilter === filter 
                      ? 'bg-[#4F46E5] text-white border-transparent shadow-sm' 
                      : 'bg-white text-[#6B7280] border-[#E8EDF5] hover:bg-[#F9FAFB]'
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
                <tr className="border-b border-[#E8EDF5] text-[11px] uppercase text-[#6B7280] tracking-wider">
                  <th className="pb-4 font-extrabold px-2">ID</th>
                  <th className="pb-4 font-extrabold px-2">Channel / Patient</th>
                  <th className="pb-4 font-extrabold px-2">Message</th>
                  <th className="pb-4 font-extrabold px-2">Status</th>
                  <th className="pb-4 font-extrabold px-2 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-[#111827]">
                {filteredSignals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9CA3AF] font-medium">No matching signals active in database.</td>
                  </tr>
                ) : (
                  filteredSignals.map((signal) => {
                    const isRisk = signal.ai_insight?.toLowerCase().includes('loss');
                    return (
                      <tr 
                        key={signal.id}
                        onClick={() => {
                          setSelectedSignal(signal);
                          setIsDispatched(false);
                          setIsDispatching(false);
                        }}
                        className={`border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-all last:border-0 cursor-pointer ${
                          selectedSignal?.id === signal.id ? 'bg-[#EEF4FF]/50 border-l-4 border-l-[#4F46E5]' : ''
                        }`}
                      >
                        <td className="py-4 px-2 font-mono text-[11px] text-[#2563EB]">{signal.id}</td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 ${getBgColor(signal.type)}`}>
                            {getIcon(signal.type)}
                            {signal.source}
                          </span>
                          <p className="text-xs text-[#6B7280] font-bold mt-0.5">Patient: {signal.metadata?.patient_name || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-2 max-w-xs">
                          <p className="text-sm font-bold text-[#111827] line-clamp-2 leading-snug">{signal.message}</p>
                          <p className="text-[10px] text-[#9CA3AF] uppercase mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </td>
                        <td className="py-4 px-2">
                          {isRisk ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-[8px] font-extrabold uppercase">
                              <AlertCircle className="w-3 h-3" /> Risk Flagged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-[8px] font-extrabold uppercase">
                              <ShieldCheck className="w-3 h-3" /> Normal
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button className="text-[11px] font-bold text-[#4F46E5] bg-[#EEF4FF] hover:bg-[#DBEAFE] px-2.5 py-1.5 rounded-[8px] transition-colors inline-flex items-center gap-1 ml-auto">
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
          <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow">
            <h3 className="text-base font-extrabold text-[#111827] mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#4F46E5]" /> Live Stream Status
            </h3>
            <div className="space-y-4">
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-[16px] p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#065F46]">HIPAA Compliant Tunnel</h4>
                  <p className="text-xs text-[#047857] leading-relaxed mt-1 font-semibold">All socket connections utilize TLS 1.3 encryption with OAuth2 API authentication verification tokens.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs font-bold text-[#4B5563]">
                <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                  <span className="text-[#6B7280]">Socket Connection</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live Connected
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                  <span className="text-[#6B7280]">Active Tunnels</span>
                  <span className="text-[#111827]">Practice Fusion, Twilio, LabCorp</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                  <span className="text-[#6B7280]">Response Latency</span>
                  <span className="text-emerald-600">~12ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                  <span className="text-[#6B7280]">Average Daily Volume</span>
                  <span className="text-[#111827]">4,821 telemetry packets</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow flex-1">
            <h3 className="text-base font-extrabold text-[#111827] mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> Action Dispatch History
            </h3>
            <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
              {auditLogs.length === 0 ? (
                <div className="text-xs font-semibold text-[#9CA3AF] py-8 text-center border-2 border-dashed border-[#E8EDF5] rounded-[16px]">
                  No approved actions dispatched yet.
                </div>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={log.id || index} className="border border-[#E8EDF5] rounded-[16px] p-4 bg-slate-50 hover:border-emerald-500/30 transition-all premium-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-[8px] font-black uppercase tracking-wider">
                        <Check className="w-2.5 h-2.5" /> Dispatched
                      </span>
                      <span className="text-[10px] text-[#9CA3AF] font-bold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#111827] leading-relaxed">
                      {log.action.replace('Approved Sentinel Action: ', '')}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E8EDF5] text-[10px] text-[#6B7280]">
                      <span>User: <strong className="text-[#111827]">{log.user_email}</strong></span>
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
          <div className="bg-white border border-[#E8EDF5] w-full max-w-2xl rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E8EDF5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${getBgColor(selectedSignal.type)} rounded-[12px] flex-shrink-0`}>
                  {getIcon(selectedSignal.type)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                    Signal Diagnostic Report
                    <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded-[6px]">ID: {selectedSignal.id}</span>
                  </h4>
                  <p className="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-widest mt-0.5">Source: {selectedSignal.source} Integration Layer</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSignal(null)} 
                className="w-8 h-8 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-colors cursor-pointer text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Event Description */}
              <div className="bg-slate-50 border border-[#E8EDF5] rounded-[18px] p-4">
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">TELEMETRY MESSAGE</h5>
                <p className="text-sm font-bold text-[#111827]">{selectedSignal.message}</p>
                <div className="flex items-center gap-3 mt-3 text-[11px] text-[#6B7280] font-semibold">
                  <span>Matched Patient: <strong className="text-[#111827]">{selectedSignal.metadata?.patient_name || 'None'}</strong></span>
                  <span>•</span>
                  <span>Received: <strong className="text-[#111827]">{new Date(selectedSignal.timestamp).toLocaleString()}</strong></span>
                </div>
              </div>

              {/* AI Assistant Insight */}
              <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-[18px] p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-[#8B5CF6] flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h5 className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1">AI Recommendation Insight</h5>
                  <p className="text-xs text-[#5B21B6] font-semibold leading-relaxed">{selectedSignal.ai_insight || "AI Engine evaluated this event. No immediate critical clinical or revenue leakage identified. Status: Clean."}</p>
                  
                  {selectedSignal.recommended_action && (
                    <div className="mt-2.5 p-2 bg-white/60 border border-[#DDD6FE] rounded-xl inline-block text-[11px] text-[#6D28D9] font-bold">
                      Recommendation: {selectedSignal.recommended_action}
                    </div>
                  )}
                </div>
              </div>

              {/* FHIR/Raw JSON Payload */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {viewMode === 'doctor' ? 'INTEGRATION DIAGNOSTICS (CLINICAL VIEW)' : 'RAW FHIR PAYLOAD (DEVELOPER VIEW)'}
                  </h5>
                  
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="bg-slate-100 p-0.5 rounded-[8px] flex items-center border border-[#E8EDF5]">
                      <button 
                        onClick={() => setViewMode('doctor')}
                        className={`text-[9px] font-black px-2 py-1 rounded-[6px] transition-all cursor-pointer ${
                          viewMode === 'doctor' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Clinical
                      </button>
                      <button 
                        onClick={() => setViewMode('developer')}
                        className={`text-[9px] font-black px-2 py-1 rounded-[6px] transition-all cursor-pointer ${
                          viewMode === 'developer' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        JSON Payload
                      </button>
                    </div>

                    <button 
                      onClick={() => handleCopyId(selectedSignal.id)}
                      className="text-[10px] font-extrabold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-[#E8EDF5] rounded-[20px] p-5">
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Target EHR System</span>
                      <p className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#F59E0B]" />
                        {selectedSignal.source} (FHIR R4 compliant)
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Security Verification</span>
                      <span className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-[6px] font-extrabold uppercase">
                        <ShieldCheck className="w-3.5 h-3.5" /> HIPAA SECURE TUNNEL
                      </span>
                    </div>
                    <div className="space-y-1 col-span-2 pt-2 border-t border-[#E8EDF5]">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Action Scope</span>
                      <p className="text-xs font-bold text-[#4B5563]">
                        Authorized to read patient metadata & write appointment status updates.
                      </p>
                    </div>
                    <div className="space-y-1 col-span-2 pt-2 border-t border-[#E8EDF5]">
                      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase block">Clinic Integration Credentials</span>
                      <p className="text-[10px] font-mono text-slate-500 font-semibold bg-white border border-[#E8EDF5] p-2 rounded-lg truncate">
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
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E8EDF5] flex items-center justify-between shrink-0">
              <button 
                onClick={() => setSelectedSignal(null)}
                className="bg-white border border-[#E8EDF5] hover:bg-[#F9FAFB] text-[#475569] font-bold text-xs px-4 py-2.5 rounded-[12px] premium-shadow cursor-pointer transition-colors"
              >
                Close Diagnostic
              </button>

              {selectedSignal.recommended_action && (
                <button
                  onClick={triggerAction}
                  disabled={isDispatching || isDispatched}
                  className={`flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-[12px] premium-shadow transition-all ${
                    isDispatched 
                      ? 'bg-emerald-600 text-white cursor-default' 
                      : isDispatching 
                        ? 'bg-[#4338CA] text-white opacity-50 cursor-wait' 
                        : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer hover:scale-105 active:scale-95'
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
