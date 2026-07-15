import React, { useState, useEffect } from 'react';
import { 
  User, Bell, Shield, Database, BrainCircuit, CreditCard, Users, 
  Settings as SettingsIcon, Save, Building, Clock, Lock, Plus, X, 
  Check, HelpCircle, AlertCircle, Download, Activity, Globe, Sparkles,
  Phone, CheckCircle2, Key, Info, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface SettingsViewProps {
  onSaveSettings?: (data: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSaveSettings }) => {
  const [activeMenu, setActiveMenu] = useState('general');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // General Settings States
  const [practiceName, setPracticeName] = useState('Sentinel Health Urgent Care');
  const [practicePhone, setPracticePhone] = useState('(555) 019-2834');
  const [timezone, setTimezone] = useState('Eastern Time (US & Canada)');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('20:00');
  const [language, setLanguage] = useState('en');
  const [themeMode, setThemeMode] = useState('system');

  // AI Preferences States
  const [schedulingAggressiveness, setSchedulingAggressiveness] = useState(2); // 1 = Conservative, 2 = Balanced, 3 = Aggressive
  const [autoOutreach, setAutoOutreach] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState('85% (Recommended)');
  const [aiModel, setAiModel] = useState('gpt-4o');

  // Team & Access States
  const [teamMembers, setTeamMembers] = useState([
    { id: 'usr-1', name: 'Dr. Sarah Jenkins', email: 's.jenkins@sentinel.com', role: 'Clinic Administrator', status: 'Active' },
    { id: 'usr-2', name: 'Dr. Alan Grant', email: 'a.grant@sentinel.com', role: 'Operations Manager', status: 'Active' },
    { id: 'usr-3', name: 'Sarah Jenkins', email: 'manager@sentinel.com', role: 'Practice Manager', status: 'Active' },
    { id: 'usr-4', name: 'Dr. Emily Chen', email: 'e.chen@sentinel.com', role: 'Staff User', status: 'Active' },
    { id: 'usr-5', name: 'John Davis', email: 'j.davis@sentinel.com', role: 'Staff User', status: 'Active' }
  ]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Staff User');

  // Notifications States
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyDesktop, setNotifyDesktop] = useState(true);
  const [notifyCopay, setNotifyCopay] = useState(true);
  const [reminderInterval, setReminderInterval] = useState('24h');

  // Integrations States
  const [integrationsList, setIntegrationsList] = useState([
    { id: 'practice-fusion', name: 'Practice Fusion EHR', type: 'Clinical Integration', connected: true, lastSync: '1 hr ago' },
    { id: 'gmail', name: 'Google Workspace Gmail', type: 'Secure Communication', connected: true, lastSync: '30 mins ago' },
    { id: 'twilio', name: 'Twilio Outbound Gateway', type: 'Voice & SMS API', connected: true, lastSync: '10 mins ago' },
    { id: 'clearinghouse', name: 'Approved Clearinghouse API', type: 'Billing Integration', connected: true, lastSync: '2 hrs ago' },
    { id: 'openai', name: 'OpenAI Intelligence Engine', type: 'AI Service (Approved V1)', connected: true, lastSync: '5 mins ago' }
  ]);

  // Billing States
  const [activePlan, setActivePlan] = useState('professional'); // starter, professional, enterprise
  const [paymentCard, setPaymentCard] = useState('Visa ending in 4242');
  const [invoices, setInvoices] = useState([
    { id: 'INV-4019', date: 'Jun 15, 2026', amount: 199.00, status: 'Paid' },
    { id: 'INV-3982', date: 'May 15, 2026', amount: 199.00, status: 'Paid' },
    { id: 'INV-3829', date: 'Apr 15, 2026', amount: 199.00, status: 'Paid' }
  ]);

  // Compliance & Audits States
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  const menuItems = [
    { id: 'general', label: 'General Settings', icon: SettingsIcon },
    { id: 'ai', label: 'AI Preferences', icon: BrainCircuit },
    { id: 'ai-usage', label: 'AI Costs & Usage', icon: Sparkles },
    { id: 'team', label: 'Team & Access', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'security', label: 'Compliance & Audit Trails', icon: Shield },
  ];

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Audits
  const fetchAudits = async () => {
    setLoadingAudits(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback HIPAA audits
      setAuditLogs([
        { id: 1, timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), user_email: 'admin@clinic.com', action: 'ACCESS_PATIENT_RECORD', resource: 'ENC-1092 (Michael R.)', ip_address: '192.168.1.45' },
        { id: 2, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user_email: 'dr.jenkins@clinic.com', action: 'WRITE_SOAP_NOTES', resource: 'ENC-1091 (Sarah J.)', ip_address: '10.0.0.12' },
        { id: 3, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), user_email: 'admin@clinic.com', action: 'GENERATE_INVOICE', resource: 'ENC-1090 (David L.)', ip_address: '192.168.1.45' },
        { id: 4, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), user_email: 'biller.officer@clinic.com', action: 'CHECK_INSURANCE_ELIGIBILITY', resource: 'Emily D. (Aetna)', ip_address: '192.168.1.80' },
      ]);
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'security') {
      fetchAudits();
    }
  }, [activeMenu]);

  // Load clinical settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`);
        if (res.ok) {
          const data = await res.json();
          setPracticeName(data.practice_name || '');
          setPracticePhone(data.practice_phone || '');
          setTimezone(data.timezone || 'Eastern Time (US & Canada)');
          setOpenTime(data.open_time || '08:00');
          setCloseTime(data.close_time || '20:00');
          setLanguage(data.language || 'en');
          setThemeMode(data.theme_mode || 'system');
          setSchedulingAggressiveness(data.scheduling_aggressiveness ?? 2);
          setAutoOutreach(data.auto_outreach ?? true);
          setConfidenceThreshold(data.confidence_threshold || '85% (Recommended)');
          setAiModel(data.ai_model || 'gpt-4o');
          setNotifySms(data.notify_sms ?? true);
          setNotifyEmail(data.notify_email ?? false);
          setNotifyDesktop(data.notify_desktop ?? true);
          setNotifyCopay(data.notify_copay ?? true);
          setReminderInterval(data.reminder_interval || '24h');
          setActivePlan(data.active_plan || 'professional');
          setPaymentCard(data.payment_card || 'Visa ending in 4242');
        }
      } catch (err) {
        console.error("Failed to load settings from clinical server:", err);
      }
    };
    fetchSettings();
  }, []);

  // Handle Save All Changes to clinical SQLite server
  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practice_name: practiceName,
          practice_phone: practicePhone,
          timezone: timezone,
          open_time: openTime,
          close_time: closeTime,
          language: language,
          theme_mode: themeMode,
          scheduling_aggressiveness: schedulingAggressiveness,
          auto_outreach: autoOutreach,
          confidence_threshold: confidenceThreshold,
          ai_model: aiModel,
          notify_sms: notifySms,
          notify_email: notifyEmail,
          notify_desktop: notifyDesktop,
          notify_copay: notifyCopay,
          reminder_interval: reminderInterval,
          active_plan: activePlan,
          payment_card: paymentCard
        })
      });

      if (res.ok) {
        showToast('Settings saved & synced to SQLite database!');
        onSaveSettings?.({
          practiceName,
          activePlan,
          themeMode,
          aiModel
        });
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing changes with clinical server.', 'error');
    }
  };

  // Handle Invite Member Submit
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newMember = {
      id: `usr-${Math.floor(100 + Math.random() * 900)}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Active'
    };

    setTeamMembers(prev => [...prev, newMember]);
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
    showToast(`Invitation email successfully sent to ${newMember.email}`);
  };

  // Toggle Integration Status
  const handleToggleIntegration = (id: string) => {
    setIntegrationsList(prev => prev.map(integration => {
      if (integration.id === id) {
        const nextState = !integration.connected;
        showToast(`${integration.name} ${nextState ? 'connected successfully!' : 'disconnected.'}`);
        return { 
          ...integration, 
          connected: nextState,
          lastSync: nextState ? 'Just now' : 'Never'
        };
      }
      return integration;
    }));
  };

  // Handle Invoice Download Simulate
  const handleDownloadInvoice = (invId: string) => {
    showToast(`Downloading receipt for ${invId}...`);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8 relative">
      
      {/* Toast Alert Banner */}
      {mounted && toast && typeof window !== 'undefined' && createPortal(
        <div className={`fixed top-6 right-6 z-[99999] flex items-center gap-2.5 px-5 py-3 rounded-[16px] border shadow-xl animate-in slide-in-from-top-6 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-[#111827] mb-1">Settings</h2>
          <p className="text-sm text-[#6B7280] font-medium">Manage your clinic preferences, credentials, and AI configurations.</p>
        </div>
        <button 
          onClick={handleSaveChanges}
          className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 text-white font-bold text-xs px-6 py-3 rounded-[14px] premium-shadow transition-transform active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* Left Sidebar Menu */}
        <div className="w-64 shrink-0">
           <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-4 premium-shadow flex flex-col gap-1">
             {menuItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveMenu(item.id)}
                 className={`flex items-center gap-3 px-4 py-3.5 rounded-[12px] transition-all text-sm font-bold w-full text-left border ${activeMenu === item.id ? 'bg-[#EEF4FF] text-[#2563EB] shadow-sm border-[#BFDBFE]/50' : 'text-[#6B7280] border-transparent hover:bg-[#F9FAFB] hover:text-[#111827]'}`}
               >
                 <item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`} />
                 {item.label}
               </button>
             ))}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow min-h-[580px]">
           
           {/* 1. GENERAL SETTINGS */}
           {activeMenu === 'general' && (
             <div className="space-y-8 animate-in fade-in">
               <div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-[#2563EB]" /> General Settings
                  </h3>
                  <p className="text-sm text-[#6B7280] font-medium">Configure primary clinic profile, working hours, and localization preferences.</p>
               </div>
               
               <div className="h-px w-full bg-[#E8EDF5]"></div>

               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Practice Name</label>
                     <input 
                       type="text" 
                       value={practiceName} 
                       onChange={(e) => setPracticeName(e.target.value)}
                       className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Primary Phone Number</label>
                     <input 
                       type="text" 
                       value={practicePhone} 
                       onChange={(e) => setPracticePhone(e.target.value)}
                       className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                     />
                   </div>
                 </div>

                 <div className="h-px w-full bg-[#F3F4F6]"></div>

                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Timezone</label>
                     <select 
                       value={timezone} 
                       onChange={(e) => setTimezone(e.target.value)}
                       className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all cursor-pointer"
                     >
                       <option value="Eastern Time (US & Canada)">Eastern Time (US & Canada)</option>
                       <option value="Central Time (US & Canada)">Central Time (US & Canada)</option>
                       <option value="Mountain Time (US & Canada)">Mountain Time (US & Canada)</option>
                       <option value="Pacific Time (US & Canada)">Pacific Time (US & Canada)</option>
                     </select>
                   </div>

                   <div>
                     <label className="block text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Language Preferences</label>
                     <select 
                       value={language} 
                       onChange={(e) => setLanguage(e.target.value)}
                       className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all cursor-pointer"
                     >
                       <option value="en">English (US)</option>
                       <option value="es">Español (ES)</option>
                       <option value="hi">हिन्दी (Hindi)</option>
                     </select>
                   </div>
                 </div>

                 <div className="h-px w-full bg-[#F3F4F6]"></div>

                 <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-[#111827] mb-1">Standard Operating Hours</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed">Establish check-in periods for patients waitlists.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="time" 
                        value={openTime} 
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="bg-[#F9FAFB] border border-[#E8EDF5] rounded-[10px] py-2 px-3 text-sm font-bold text-[#111827]"
                      />
                      <span className="text-xs text-[#9CA3AF] font-bold">to</span>
                      <input 
                        type="time" 
                        value={closeTime} 
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="bg-[#F9FAFB] border border-[#E8EDF5] rounded-[10px] py-2 px-3 text-sm font-bold text-[#111827]"
                      />
                    </div>
                 </div>

                 <div className="h-px w-full bg-[#F3F4F6]"></div>

                 <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-[#111827] mb-1">System Interface Theme</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed">Change standard display theme modes.</p>
                    </div>
                    <div className="flex gap-2">
                       {['light', 'dark', 'system'].map(mode => (
                         <button 
                           key={mode} 
                           onClick={() => setThemeMode(mode)}
                           className={`px-4 py-2 border rounded-[10px] text-xs font-bold transition-all uppercase tracking-wider ${
                             themeMode === mode 
                               ? 'bg-[#111827] text-white border-[#111827]' 
                               : 'bg-white text-[#6B7280] border-[#E8EDF5] hover:bg-[#F9FAFB]'
                           }`}
                         >
                           {mode}
                         </button>
                       ))}
                    </div>
                 </div>
               </div>
             </div>
           )}

           {/* 2. AI PREFERENCES */}
           {activeMenu === 'ai' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5 text-[#7C3AED]" /> AI Preferences
                   </h3>
                   <p className="text-sm text-[#6B7280] font-medium">Configure how the Sentinel AI engine behaves in your environment.</p>
                </div>
                
                <div className="h-px w-full bg-[#E8EDF5]"></div>

                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">Auto-Scheduling Aggressiveness</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Determine how proactively Sentinel will try to fill empty slots from the waitlist.</p>
                      </div>
                      <div className="w-64">
                         <input 
                           type="range" 
                           min="1" 
                           max="3" 
                           value={schedulingAggressiveness} 
                           onChange={(e) => setSchedulingAggressiveness(parseInt(e.target.value))}
                           className="w-full accent-[#4F46E5] h-2 bg-[#F3F4F6] rounded-lg appearance-none cursor-pointer" 
                         />
                         <div className="flex justify-between text-[10px] font-bold text-[#9CA3AF] mt-2 uppercase tracking-wider">
                           <span className={schedulingAggressiveness === 1 ? 'text-[#4F46E5]' : ''}>Conservative</span>
                           <span className={schedulingAggressiveness === 2 ? 'text-[#4F46E5]' : ''}>Balanced</span>
                           <span className={schedulingAggressiveness === 3 ? 'text-[#4F46E5]' : ''}>Aggressive</span>
                         </div>
                      </div>
                   </div>

                   <div className="h-px w-full bg-[#F3F4F6]"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">Automated Patient Outreach</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Allow AI to send SMS confirmations and waitlist offers directly without human review.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={autoOutreach}
                           onChange={() => setAutoOutreach(!autoOutreach)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-[#F3F4F6]"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">LLM Confidence Threshold</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Minimum confidence score required before Sentinel flags a potential revenue leak.</p>
                      </div>
                      <select 
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(e.target.value)}
                        className="bg-[#F9FAFB] border border-[#E8EDF5] text-[#111827] text-sm font-bold rounded-[10px] focus:ring-[#4F46E5] focus:border-[#4F46E5] block p-2.5 outline-none cursor-pointer"
                      >
                        <option>70% (Loose)</option>
                        <option>85% (Recommended)</option>
                        <option>95% (Strict)</option>
                      </select>
                   </div>
                   
                   <div className="h-px w-full bg-[#F3F4F6]"></div>

                   <div className="flex justify-between items-start">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">Active AI Model</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Select the foundational model powering your Intelligence Layer.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label 
                          onClick={() => setAiModel('gpt-4o')}
                          className={`flex items-center gap-3 p-3 border rounded-[10px] cursor-pointer transition-all ${
                            aiModel === 'gpt-4o' 
                              ? 'border-[#4F46E5] bg-[#EEF4FF]' 
                              : 'border-[#E8EDF5] bg-white hover:bg-[#F9FAFB]'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="model" 
                            checked={aiModel === 'gpt-4o'} 
                            onChange={() => setAiModel('gpt-4o')}
                            className="w-4 h-4 text-[#4F46E5] bg-white border-gray-300 focus:ring-[#4F46E5]" 
                          />
                          <span className={`text-sm font-bold ${aiModel === 'gpt-4o' ? 'text-[#4F46E5]' : 'text-[#6B7280]'}`}>GPT-4o (Default)</span>
                        </label>
                        <label 
                          onClick={() => setAiModel('claude')}
                          className={`flex items-center gap-3 p-3 border rounded-[10px] cursor-pointer transition-all ${
                            aiModel === 'claude' 
                              ? 'border-[#2563EB] bg-[#EFF6FF]' 
                              : 'border-[#E8EDF5] bg-white hover:bg-[#F9FAFB]'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="model" 
                            checked={aiModel === 'claude'} 
                            onChange={() => setAiModel('claude')}
                            className="w-4 h-4 text-[#2563EB] bg-white border-gray-300 focus:ring-[#2563EB]" 
                          />
                          <span className={`text-sm font-bold ${aiModel === 'claude' ? 'text-[#2563EB]' : 'text-[#6B7280]'}`}>Claude 3.5 Sonnet</span>
                        </label>
                      </div>
                   </div>

                </div>
             </div>
           )}

           {/* AI COSTS & USAGE */}
           {activeMenu === 'ai-usage' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-[#F59E0B]" /> AI Costs & Token Usage
                   </h3>
                   <p className="text-sm text-[#6B7280] font-medium">Track your clinic's AI consumption and associated API costs.</p>
                </div>
                
                <div className="h-px w-full bg-[#E8EDF5]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 border border-indigo-100 bg-indigo-50/50 rounded-[16px]">
                    <BrainCircuit className="w-8 h-8 text-indigo-600 mb-4" />
                    <p className="text-[#6B7280] text-sm font-bold mb-1">Clinic Tokens Used (MTD)</p>
                    <p className="text-4xl font-black text-[#111827]">2.4M</p>
                    <p className="text-xs text-indigo-600 font-bold mt-2 bg-indigo-100 px-3 py-1 rounded-full inline-block">Est. Cost: $24.00</p>
                  </div>
                  <div className="p-6 border border-emerald-100 bg-emerald-50/50 rounded-[16px]">
                    <Activity className="w-8 h-8 text-emerald-600 mb-4" />
                    <p className="text-[#6B7280] text-sm font-bold mb-1">Cache Hit Ratio</p>
                    <p className="text-4xl font-black text-[#111827]">92.1%</p>
                    <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-100 px-3 py-1 rounded-full inline-block">High Efficiency</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E8EDF5] rounded-[16px] p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-[#111827] mb-4">Top AI Workflows</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Patient Triage Chatbot', usage: '1.2M tokens', cost: '$12.00' },
                      { name: 'Automated Clinical Summaries', usage: '800K tokens', cost: '$8.00' },
                      { name: 'Billing Code Extraction', usage: '400K tokens', cost: '$4.00' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-[#F3F4F6] rounded-[12px] hover:bg-[#F9FAFB] transition-colors">
                        <span className="text-sm font-bold text-[#111827]">{item.name}</span>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-[#4F46E5]">{item.usage}</span>
                          <span className="block text-xs font-medium text-[#6B7280]">{item.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           )}

           {/* 3. TEAM & ACCESS CONTROL */}
           {activeMenu === 'team' && (
             <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#4F46E5]" /> Team & Access Control
                    </h3>
                    <p className="text-sm text-[#6B7280] font-medium">Manage clinical staff members, physicians, and billing agents access permissions.</p>
                  </div>
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs px-4 py-2.5 rounded-[10px] transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Invite Staff Member
                  </button>
                </div>

                <div className="h-px w-full bg-[#E8EDF5]"></div>

                <div className="overflow-x-auto border border-[#E8EDF5] rounded-[16px] premium-shadow bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFBFD] border-b border-[#E8EDF5] text-[10px] uppercase font-extrabold text-[#6B7280]">
                        <th className="py-3.5 px-4">Member Name</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">System Role</th>
                        <th className="py-3.5 px-4">Access Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold text-[#111827]">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]/50 last:border-0">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#EEF4FF] flex items-center justify-center text-[10px] font-bold text-[#4F46E5] border border-[#BFDBFE]">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-bold text-[#111827]">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{member.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              member.role.includes('Administrator') 
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : member.role.includes('Manager')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-[#D1FAE5]">
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={() => {
                                setTeamMembers(prev => prev.filter(m => m.id !== member.id));
                                showToast(`Revoked clinical access for ${member.name}.`);
                              }}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           )}

           {/* 4. NOTIFICATIONS */}
           {activeMenu === 'notifications' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                     <Bell className="w-5 h-5 text-amber-500" /> Notifications Settings
                   </h3>
                   <p className="text-sm text-[#6B7280] font-medium">Control routing and intervals for clinic telemetry triggers and alerts.</p>
                </div>
                
                <div className="h-px w-full bg-[#E8EDF5]"></div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">SMS Real-time Signals</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Send high-priority waitlist and schedule updates to administrators mobile.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifySms}
                           onChange={() => setNotifySms(!notifySms)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-[#F3F4F6]"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">Secure Email Daily Reports</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Receive secure daily clinical logs summaries and revenue intelligence outcomes.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifyEmail}
                           onChange={() => setNotifyEmail(!notifyEmail)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-[#F3F4F6]"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">Desktop Push Alerts</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Enable system notification alerts for incoming patient messages and calls.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifyDesktop}
                           onChange={() => setNotifyDesktop(!notifyDesktop)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-[#F3F4F6]"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">Copay Collection Alerts</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Notify billing staff immediately when co-pays are verified and pending collection.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifyCopay}
                           onChange={() => setNotifyCopay(!notifyCopay)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-[#F3F4F6]"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-[#111827] mb-1">Patient Reminders Delay</h4>
                         <p className="text-xs text-[#6B7280] leading-relaxed">Default timing for sending automated text messages before a booked slot.</p>
                      </div>
                      <select 
                        value={reminderInterval}
                        onChange={(e) => setReminderInterval(e.target.value)}
                        className="bg-[#F9FAFB] border border-[#E8EDF5] text-[#111827] text-sm font-bold rounded-[10px] focus:ring-[#4F46E5] focus:border-[#4F46E5] block p-2.5 outline-none cursor-pointer"
                      >
                        <option value="12h">12 Hours Prior</option>
                        <option value="24h">24 Hours Prior</option>
                        <option value="48h">48 Hours Prior</option>
                      </select>
                   </div>
                </div>
             </div>
           )}

           {/* 5. INTEGRATIONS */}
           {activeMenu === 'integrations' && (
             <div className="space-y-6 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                     <Database className="w-5 h-5 text-indigo-600" /> System Connectors & Integrations
                   </h3>
                   <p className="text-sm text-[#6B7280] font-medium">Verify active connection links and API synchronizations with clinic platforms.</p>
                </div>
                
                <div className="h-px w-full bg-[#E8EDF5]"></div>

                <div className="grid grid-cols-1 gap-4">
                  {integrationsList.map(integration => (
                    <div 
                      key={integration.id} 
                      className="border border-[#E8EDF5] rounded-[20px] p-5 flex justify-between items-center bg-[#F9FAFB]/50 hover:bg-white transition-all premium-shadow group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                          integration.connected 
                            ? 'bg-[#ECFDF5] border-[#D1FAE5] text-[#10B981]' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111827]">{integration.name}</p>
                          <p className="text-[10px] text-[#6B7280] font-semibold">{integration.type} • Synced: {integration.lastSync}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                         <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-[8px] border ${
                           integration.connected 
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                             : 'bg-slate-50 text-slate-500 border-slate-200'
                         }`}>
                           {integration.connected ? 'Active Link' : 'Disabled'}
                         </span>
                         
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={integration.connected}
                              onChange={() => handleToggleIntegration(integration.id)}
                            />
                            <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                         </label>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {/* 6. BILLING & PLANS */}
           {activeMenu === 'billing' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                     <CreditCard className="w-5 h-5 text-[#2563EB]" /> Billing & Plans
                   </h3>
                   <p className="text-sm text-[#6B7280] font-medium">Select pricing packages, configure primary Stripe card, and read past transaction receipts.</p>
                </div>
                
                <div className="h-px w-full bg-[#E8EDF5]"></div>

                {/* Subscriptions Grid */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-4">Choose Sentinel Package</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'starter', name: 'Sentinel Starter', price: '$0', desc: 'Basic patient logs tracking.' },
                      { id: 'professional', name: 'Sentinel Pro', price: '$199/mo', desc: 'Complete revenue logs, outbound Twilio dialer.' },
                      { id: 'enterprise', name: 'Sentinel Enterprise', price: '$499/mo', desc: 'Unlimited attending staff, multi-tenant EHR sync.' }
                    ].map(plan => (
                      <div 
                        key={plan.id}
                        onClick={() => {
                          setActivePlan(plan.id);
                          showToast(`Switched package to ${plan.name}`);
                        }}
                        className={`p-5 rounded-[20px] border cursor-pointer transition-all flex flex-col justify-between premium-shadow ${
                          activePlan === plan.id 
                            ? 'border-[#2563EB] bg-[#EEF4FF]/50 ring-1 ring-[#2563EB]' 
                            : 'border-[#E8EDF5] bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-[#111827]">{plan.name}</span>
                            {activePlan === plan.id && <span className="bg-[#2563EB] text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">Active</span>}
                          </div>
                          <p className="text-2xl font-extrabold text-[#111827] mb-3">{plan.price}</p>
                          <p className="text-[10px] text-[#6B7280] leading-relaxed">{plan.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-[#F3F4F6]"></div>

                {/* Payment Card Details */}
                <div className="flex justify-between items-center bg-[#FAFBFD] p-5 border border-[#E8EDF5] rounded-[18px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-[#E8EDF5] rounded-full flex items-center justify-center text-[#2563EB]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">{paymentCard}</p>
                      <p className="text-[9px] text-[#9CA3AF] font-bold uppercase">Expires 12/28 • Primary Card</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const num = Math.floor(1000 + Math.random() * 9000);
                      setPaymentCard(`Mastercard ending in ${num}`);
                      showToast(`Primary payment card updated successfully.`);
                    }}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Edit Card
                  </button>
                </div>

                <div className="h-px w-full bg-[#F3F4F6]"></div>

                {/* Invoice Logs */}
                <div>
                   <h4 className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-4">Past Transaction Receipts</h4>
                   <div className="overflow-x-auto border border-[#E8EDF5] rounded-[16px] premium-shadow bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAFBFD] border-b border-[#E8EDF5] text-[10px] uppercase font-extrabold text-[#6B7280]">
                            <th className="py-3.5 px-4">Invoice ID</th>
                            <th className="py-3.5 px-4">Billing Date</th>
                            <th className="py-3.5 px-4">Amount Paid</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-semibold text-[#111827]">
                          {invoices.map(inv => (
                            <tr key={inv.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]/50 last:border-0">
                              <td className="py-3.5 px-4 font-mono text-[#2563EB] font-bold">{inv.id}</td>
                              <td className="py-3.5 px-4 text-slate-500">{inv.date}</td>
                              <td className="py-3.5 px-4 text-slate-800 font-bold">${inv.amount.toFixed(2)}</td>
                              <td className="py-3.5 px-4">
                                <span className="bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-[#D1FAE5]">
                                  {inv.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button 
                                  onClick={() => handleDownloadInvoice(inv.id)}
                                  className="text-[11px] font-bold text-[#6B7280] hover:text-[#111827] flex items-center gap-1.5 ml-auto cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" /> PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>

             </div>
           )}

           {/* 7. COMPLIANCE & AUDIT TRAILS */}
           {activeMenu === 'security' && (
             <div className="space-y-6 animate-in fade-in">
               <div>
                 <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                   <Shield className="w-5 h-5 text-emerald-600" /> HIPAA Security & Compliance Audit Trails
                 </h3>
                 <p className="text-sm text-[#6B7280] font-medium">Review immutable access logs and security policy audit logs.</p>
               </div>
               
               <div className="h-px w-full bg-[#E8EDF5]"></div>

               {loadingAudits ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <div className="w-8 h-8 border-4 border-[#EEF4FF] border-t-[#2563EB] rounded-full animate-spin"></div>
                   <p className="text-xs text-[#6B7280] mt-2 font-bold">Fetching secure audit records...</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto border border-[#E8EDF5] rounded-[16px] premium-shadow bg-white">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-[#FAFBFD] border-b border-[#E8EDF5] text-[10px] uppercase font-bold text-[#6B7280]">
                         <th className="py-3.5 px-4">Timestamp</th>
                         <th className="py-3.5 px-4">Operator</th>
                         <th className="py-3.5 px-4">Action</th>
                         <th className="py-3.5 px-4">Target Resource</th>
                         <th className="py-3.5 px-4">Host IP</th>
                       </tr>
                     </thead>
                     <tbody className="text-xs font-semibold text-[#111827]">
                       {auditLogs.map((log) => (
                         <tr key={log.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]/50 last:border-0">
                           <td className="py-3.5 px-4 text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                           <td className="py-3.5 px-4 text-[#2563EB] font-bold">{log.user_email}</td>
                           <td className="py-3.5 px-4">
                             <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-extrabold">
                               {log.action}
                             </span>
                           </td>
                           <td className="py-3.5 px-4 text-slate-700">{log.resource || 'N/A'}</td>
                           <td className="py-3.5 px-4 text-slate-400 font-mono">{log.ip_address}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
           )}

         </div>
      </div>

      {/* Invite Staff Member Modal */}
      {showInviteModal && createPortal(
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#E8EDF5] w-full max-w-md rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#F8FAFC] border-b border-[#E8EDF5] px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-[#4F46E5]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Invite Staff Member</h3>
                  <span className="text-[10px] font-semibold text-[#6B7280]">Authorize clinical portal access permissions</span>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 hover:bg-[#EEF2F6] rounded-full text-[#6B7280] hover:text-[#111827] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Staff Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Dr. Robert Pattinson"
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[12px] px-4 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all placeholder:text-[#9CA3AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. r.pattinson@sentinel.com"
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[12px] px-4 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all placeholder:text-[#9CA3AF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">System Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[12px] px-3 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all cursor-pointer"
                >
                  <option value="Clinic Administrator">Clinic Administrator</option>
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Practice Manager">Practice Manager</option>
                  <option value="Staff User">Staff User</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[#E8EDF5] mt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="bg-white border border-[#E8EDF5] hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-[12px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs px-6 py-2.5 rounded-[12px] transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
