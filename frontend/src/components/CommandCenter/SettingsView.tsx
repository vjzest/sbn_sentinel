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
  activeMenuProp?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSaveSettings, activeMenuProp = 'general' }) => {
  const [localActiveMenu, setLocalActiveMenu] = useState(activeMenuProp);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Sync localActiveMenu when parent changes activeMenuProp (e.g. sidebar click)
  useEffect(() => {
    setLocalActiveMenu(activeMenuProp);
  }, [activeMenuProp]);

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
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
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoadingAudits(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/team`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setTeamMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/integrations`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setIntegrationsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch integrations:", err);
    }
  };

  useEffect(() => {
    if (localActiveMenu === 'security') fetchAudits();
    if (localActiveMenu === 'team') fetchTeam();
    if (localActiveMenu === 'integrations') fetchIntegrations();
  }, [localActiveMenu]);

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
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole })
      });
      if (res.ok) {
        const newMember = await res.json();
        setTeamMembers(prev => [...prev, newMember]);
        setInviteName('');
        setInviteEmail('');
        setShowInviteModal(false);
        showToast(`Invitation email successfully sent to ${newMember.email}`);
      } else {
        const errData = await res.json();
        showToast(errData.detail || 'Failed to send invite', 'error');
      }
    } catch (err) {
      showToast('Error syncing with clinical server.', 'error');
    }
  };

  // Toggle Integration Status
  const handleToggleIntegration = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/integrations/${id}/toggle`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        setIntegrationsList(prev => prev.map(integration => 
          integration.id === id ? { ...integration, connected: updated.connected, lastSync: updated.lastSync } : integration
        ));
        showToast(`Integration ${updated.connected ? 'connected successfully!' : 'disconnected.'}`);
      } else {
        showToast('Failed to toggle integration.', 'error');
      }
    } catch {
      showToast('Error syncing with clinical server.', 'error');
    }
  };

  // Handle Invoice Download Simulate
  const handleDownloadInvoice = (invId: string) => {
    const csvContent = `Invoice ID,Date,Amount,Status\n${invId},${new Date().toLocaleDateString()},199.00,Paid`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Invoice_${invId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h2 className="text-3xl font-extrabold text-white mb-1">Settings</h2>
          <p className="text-sm text-white/70 font-medium">Manage your clinic preferences, credentials, and AI configurations.</p>
        </div>
        <button 
          onClick={handleSaveChanges}
          className="flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-bold text-xs px-6 py-3 rounded-[14px] transition-all active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="w-full">

        {/* Main Content Area */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 text-white min-h-[580px] w-full">
           
           {/* 1. GENERAL SETTINGS */}
           {localActiveMenu === 'general' && (
             <div className="space-y-8 animate-in fade-in">
               <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-[#2563EB]" /> General Settings
                  </h3>
                  <p className="text-sm text-white/70 font-medium">Configure primary clinic profile, working hours, and localization preferences.</p>
               </div>
               
               <div className="h-px w-full bg-white/10"></div>

               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider mb-2">Practice Name</label>
                     <input 
                       type="text" 
                       value={practiceName} 
                       onChange={(e) => setPracticeName(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-[16px] py-3 px-4 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:bg-[#120524] transition-all"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider mb-2">Primary Phone Number</label>
                     <input 
                       type="text" 
                       value={practicePhone} 
                       onChange={(e) => setPracticePhone(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-[16px] py-3 px-4 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:bg-[#120524] transition-all"
                     />
                   </div>
                 </div>

                 <div className="h-px w-full bg-white/10"></div>

                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider mb-2">Clinic Timezone</label>
                     <select 
                       value={timezone} 
                       onChange={(e) => setTimezone(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-[16px] py-3 px-3 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:bg-[#120524] transition-all cursor-pointer"
                     >
                       <option value="Eastern Time (US & Canada)" className="bg-[#120524] text-white">Eastern Time (US & Canada)</option>
                       <option value="Central Time (US & Canada)" className="bg-[#120524] text-white">Central Time (US & Canada)</option>
                       <option value="Mountain Time (US & Canada)" className="bg-[#120524] text-white">Mountain Time (US & Canada)</option>
                       <option value="Pacific Time (US & Canada)" className="bg-[#120524] text-white">Pacific Time (US & Canada)</option>
                     </select>
                   </div>

                   <div>
                     <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider mb-2">Language Preferences</label>
                     <select 
                       value={language} 
                       onChange={(e) => setLanguage(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-[16px] py-3 px-3 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:bg-[#120524] transition-all cursor-pointer"
                     >
                       <option value="en" className="bg-[#120524] text-white">English (US)</option>
                       <option value="es" className="bg-[#120524] text-white">Español (ES)</option>
                       <option value="hi" className="bg-[#120524] text-white">हिंदी (Hindi)</option>
                     </select>
                   </div>
                 </div>

                 <div className="h-px w-full bg-white/10"></div>

                 <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Standard Operating Hours</h4>
                      <p className="text-xs text-white/70 leading-relaxed">Establish check-in periods for patients waitlists.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="time" 
                        value={openTime} 
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-[10px] py-2 px-3 text-sm font-bold text-white"
                      />
                      <span className="text-xs text-white/50 font-bold">to</span>
                      <input 
                        type="time" 
                        value={closeTime} 
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-[10px] py-2 px-3 text-sm font-bold text-white"
                      />
                    </div>
                 </div>

                 <div className="h-px w-full bg-white/10"></div>

                 <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">System Interface Theme</h4>
                      <p className="text-xs text-white/70 leading-relaxed">Change standard display theme modes.</p>
                    </div>
                    <div className="flex gap-2">
                       {['light', 'dark', 'system'].map(mode => (
                         <button 
                           key={mode} 
                           onClick={() => setThemeMode(mode)}
                           className={`px-4 py-2 border rounded-[10px] text-xs font-bold transition-all uppercase tracking-wider ${
                             themeMode === mode 
                               ? 'bg-[#111827] text-white border-[#111827]' 
                               : 'bg-[#120524] text-white/70 border-white/10 hover:bg-white/5'
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
           {localActiveMenu === 'ai' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5 text-white" /> AI Preferences
                   </h3>
                   <p className="text-sm text-white/70 font-medium">Configure how the Sentinel AI engine behaves in your environment.</p>
                </div>
                
                <div className="h-px w-full bg-white/10"></div>

                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">Auto-Scheduling Aggressiveness</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Determine how proactively Sentinel will try to fill empty slots from the waitlist.</p>
                      </div>
                      <div className="w-64">
                         <input 
                           type="range" 
                           min="1" 
                           max="3" 
                           value={schedulingAggressiveness} 
                           onChange={(e) => setSchedulingAggressiveness(parseInt(e.target.value))}
                           className="w-full accent-[#2E1055] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                         />
                         <div className="flex justify-between text-[10px] font-bold text-white/50 mt-2 uppercase tracking-wider">
                           <span className={schedulingAggressiveness === 1 ? 'text-[#A78BFA]' : ''}>Conservative</span>
                           <span className={schedulingAggressiveness === 2 ? 'text-[#A78BFA]' : ''}>Balanced</span>
                           <span className={schedulingAggressiveness === 3 ? 'text-[#A78BFA]' : ''}>Aggressive</span>
                         </div>
                      </div>
                   </div>

                   <div className="h-px w-full bg-white/10"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">Automated Patient Outreach</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Allow AI to send SMS confirmations and waitlist offers directly without human review.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={autoOutreach}
                           onChange={() => setAutoOutreach(!autoOutreach)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#120524] after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-white/10"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">LLM Confidence Threshold</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Minimum confidence score required before Sentinel flags a potential revenue leak.</p>
                      </div>
                      <select 
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-sm font-bold rounded-[10px] focus:ring-[#2E1055] focus:border-[#2E1055] block p-2.5 outline-none cursor-pointer"
                      >
                        <option className="bg-[#120524] text-white">70% (Loose)</option>
                        <option className="bg-[#120524] text-white">85% (Recommended)</option>
                        <option className="bg-[#120524] text-white">95% (Strict)</option>
                      </select>
                   </div>
                   
                   <div className="h-px w-full bg-white/10"></div>

                   <div className="flex justify-between items-start">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">Active AI Model</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Select the foundational model powering your AI Assistant.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label 
                          onClick={() => setAiModel('gpt-4o')}
                          className={`flex items-center gap-3 p-3 border rounded-[10px] cursor-pointer transition-all ${
                            aiModel === 'gpt-4o' 
                              ? 'border-[#2E1055] bg-[#EEF4FF]' 
                              : 'border-white/10 bg-[#120524] hover:bg-white/5'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="model" 
                            checked={aiModel === 'gpt-4o'} 
                            onChange={() => setAiModel('gpt-4o')}
                            className="w-4 h-4 text-[#A78BFA] bg-[#120524] border-white/10 focus:ring-[#2E1055]" 
                          />
                          <span className={`text-sm font-bold ${aiModel === 'gpt-4o' ? 'text-[#A78BFA]' : 'text-white/70'}`}>GPT-4o (Default)</span>
                        </label>
                        <label 
                          onClick={() => setAiModel('claude')}
                          className={`flex items-center gap-3 p-3 border rounded-[10px] cursor-pointer transition-all ${
                            aiModel === 'claude' 
                              ? 'border-[#2563EB] bg-[#EFF6FF]' 
                              : 'border-white/10 bg-[#120524] hover:bg-white/5'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="model" 
                            checked={aiModel === 'claude'} 
                            onChange={() => setAiModel('claude')}
                            className="w-4 h-4 text-[#2563EB] bg-[#120524] border-white/10 focus:ring-[#2563EB]" 
                          />
                          <span className={`text-sm font-bold ${aiModel === 'claude' ? 'text-[#2563EB]' : 'text-white/70'}`}>Claude 3.5 Sonnet</span>
                        </label>
                      </div>
                   </div>

                </div>
             </div>
           )}

           {/* AI COSTS & USAGE */}
           {localActiveMenu === 'ai-usage' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-[#F59E0B]" /> AI Costs & Token Usage
                   </h3>
                   <p className="text-sm text-white/70 font-medium">Track your clinic's AI consumption and associated API costs.</p>
                </div>
                
                <div className="h-px w-full bg-white/10"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 border border-[#E0D9FD] bg-[#EEEAFE]/50 rounded-[16px]">
                    <BrainCircuit className="w-8 h-8 text-[#A78BFA] mb-4" />
                    <p className="text-white/70 text-sm font-bold mb-1">Clinic Tokens Used (MTD)</p>
                    <p className="text-4xl font-black text-white">2.4M</p>
                    <p className="text-xs text-[#A78BFA] font-bold mt-2 bg-[#E0D9FD] px-3 py-1 rounded-full inline-block">Est. Cost: $24.00</p>
                  </div>
                  <div className="p-6 border border-emerald-100 bg-emerald-50/50 rounded-[16px]">
                    <Activity className="w-8 h-8 text-emerald-600 mb-4" />
                    <p className="text-white/70 text-sm font-bold mb-1">Cache Hit Ratio</p>
                    <p className="text-4xl font-black text-white">92.1%</p>
                    <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-100 px-3 py-1 rounded-full inline-block">High Efficiency</p>
                  </div>
                </div>

                <div className="bg-[#120524] border border-white/10 rounded-[16px] p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-white mb-4">Top AI Workflows</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Patient Triage Chatbot', usage: '1.2M tokens', cost: '$12.00' },
                      { name: 'Automated Clinical Summaries', usage: '800K tokens', cost: '$8.00' },
                      { name: 'Billing Code Extraction', usage: '400K tokens', cost: '$4.00' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-white/10 rounded-[16px] hover:bg-white/5 transition-colors">
                        <span className="text-sm font-bold text-white">{item.name}</span>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-[#A78BFA]">{item.usage}</span>
                          <span className="block text-xs font-medium text-white/70">{item.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           )}

           {/* 3. TEAM & ACCESS CONTROL */}
           {localActiveMenu === 'team' && (
             <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#A78BFA]" /> Team & Access Control
                    </h3>
                    <p className="text-sm text-white/70 font-medium">Manage clinical staff members, physicians, and billing agents access permissions.</p>
                  </div>
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-1.5 bg-[#2E1055] hover:bg-[#120524] text-white font-bold text-xs px-4 py-2.5 rounded-[10px] transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Invite Staff Member
                  </button>
                </div>

                <div className="h-px w-full bg-white/10"></div>

                <div className="overflow-x-auto border border-white/10 rounded-[16px] premium-shadow bg-[#120524]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase font-extrabold text-white/70">
                        <th className="py-3.5 px-4">Member Name</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">System Role</th>
                        <th className="py-3.5 px-4">Access Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold text-white">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="border-b border-white/10 hover:bg-white/5/50 last:border-0">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#EEF4FF] flex items-center justify-center text-[10px] font-bold text-[#A78BFA] border border-[#BFDBFE]">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-bold text-white">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{member.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              member.role.includes('Administrator') 
                                ? 'bg-[#EEEAFE] text-white border border-indigo-200'
                                : member.role.includes('Manager')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-emerald-500/30">
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/team/${member.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    setTeamMembers(prev => prev.filter(m => m.id !== member.id));
                                    showToast(`Revoked clinical access for ${member.name}.`);
                                  } else {
                                    showToast('Failed to revoke access.', 'error');
                                  }
                                } catch {
                                  showToast('Error syncing with clinical server.', 'error');
                                }
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
           {localActiveMenu === 'notifications' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                     <Bell className="w-5 h-5 text-amber-500" /> Notifications Settings
                   </h3>
                   <p className="text-sm text-white/70 font-medium">Control routing and intervals for clinic telemetry triggers and alerts.</p>
                </div>
                
                <div className="h-px w-full bg-white/10"></div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">SMS Real-time Signals</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Send high-priority waitlist and schedule updates to administrators mobile.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifySms}
                           onChange={() => setNotifySms(!notifySms)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#120524] after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-white/10"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">Secure Email Daily Reports</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Receive secure daily clinical logs summaries and revenue intelligence outcomes.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifyEmail}
                           onChange={() => setNotifyEmail(!notifyEmail)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#120524] after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-white/10"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">Desktop Push Alerts</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Enable system notification alerts for incoming patient messages and calls.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifyDesktop}
                           onChange={() => setNotifyDesktop(!notifyDesktop)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#120524] after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-white/10"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">Copay Collection Alerts</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Notify billing staff immediately when co-pays are verified and pending collection.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={notifyCopay}
                           onChange={() => setNotifyCopay(!notifyCopay)}
                         />
                         <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#120524] after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                   </div>

                   <div className="h-px w-full bg-white/10"></div>

                   <div className="flex justify-between items-center">
                      <div className="max-w-md">
                         <h4 className="text-sm font-bold text-white mb-1">Patient Reminders Delay</h4>
                         <p className="text-xs text-white/70 leading-relaxed">Default timing for sending automated text messages before a booked slot.</p>
                      </div>
                      <select 
                        value={reminderInterval}
                        onChange={(e) => setReminderInterval(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-sm font-bold rounded-[10px] focus:ring-[#2E1055] focus:border-[#2E1055] block p-2.5 outline-none cursor-pointer"
                      >
                        <option value="12h" className="bg-[#120524] text-white">12 Hours Prior</option>
                        <option value="24h" className="bg-[#120524] text-white">24 Hours Prior</option>
                        <option value="48h" className="bg-[#120524] text-white">48 Hours Prior</option>
                      </select>
                   </div>
                </div>
             </div>
           )}

           {/* 5. INTEGRATIONS */}
           {localActiveMenu === 'integrations' && (
             <div className="space-y-6 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                     <Database className="w-5 h-5 text-[#A78BFA]" /> System Connectors & Integrations
                   </h3>
                   <p className="text-sm text-white/70 font-medium">Verify active connection links and API synchronizations with clinic platforms.</p>
                </div>
                
                <div className="h-px w-full bg-white/10"></div>

                <div className="grid grid-cols-1 gap-4">
                  {integrationsList.map(integration => (
                    <div 
                      key={integration.id} 
                      className="border border-white/10 rounded-[20px] p-5 flex justify-between items-center bg-white/5/50 hover:bg-[#120524] transition-all premium-shadow group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                          integration.connected 
                            ? 'bg-[#ECFDF5] border-emerald-500/30 text-[#10B981]' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{integration.name}</p>
                          <p className="text-[10px] text-white/70 font-semibold">{integration.type} • Synced: {integration.lastSync}</p>
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
                            <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#120524] after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                         </label>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {/* 6. BILLING & PLANS */}
           {localActiveMenu === 'billing' && (
             <div className="space-y-8 animate-in fade-in">
                <div>
                   <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                     <CreditCard className="w-5 h-5 text-[#2563EB]" /> Billing & Plans
                   </h3>
                   <p className="text-sm text-white/70 font-medium">Select pricing packages, configure primary Stripe card, and read past transaction receipts.</p>
                </div>
                
                <div className="h-px w-full bg-white/10"></div>

                {/* Subscriptions Grid */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider mb-4">Choose Sentinel Package</h4>
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
                            : 'border-white/10 bg-[#120524] hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-white">{plan.name}</span>
                            {activePlan === plan.id && <span className="bg-[#2563EB] text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">Active</span>}
                          </div>
                          <p className="text-2xl font-extrabold text-white mb-3">{plan.price}</p>
                          <p className="text-[10px] text-white/70 leading-relaxed">{plan.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-white/10"></div>

                {/* Payment Card Details */}
                <div className="flex justify-between items-center bg-white/5 p-5 border border-white/10 rounded-[18px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#120524] border border-white/10 rounded-full flex items-center justify-center text-[#2563EB]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{paymentCard}</p>
                      <p className="text-[9px] text-white/50 font-bold uppercase">Expires 12/28 • Primary Card</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setPendingPlan(null); setShowPaymentModal(true); }}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Edit Card
                  </button>
                </div>

                <div className="h-px w-full bg-white/10"></div>

                {/* Invoice Logs */}
                <div>
                   <h4 className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider mb-4">Past Transaction Receipts</h4>
                   <div className="overflow-x-auto border border-white/10 rounded-[16px] premium-shadow bg-[#120524]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase font-extrabold text-white/70">
                            <th className="py-3.5 px-4">Invoice ID</th>
                            <th className="py-3.5 px-4">Billing Date</th>
                            <th className="py-3.5 px-4">Amount Paid</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-semibold text-white">
                          {invoices.map(inv => (
                            <tr key={inv.id} className="border-b border-white/10 hover:bg-white/5/50 last:border-0">
                              <td className="py-3.5 px-4 font-mono text-[#2563EB] font-bold">{inv.id}</td>
                              <td className="py-3.5 px-4 text-slate-500">{inv.date}</td>
                              <td className="py-3.5 px-4 text-slate-800 font-bold">${inv.amount.toFixed(2)}</td>
                              <td className="py-3.5 px-4">
                                <span className="bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-emerald-500/30">
                                  {inv.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button 
                                  onClick={() => handleDownloadInvoice(inv.id)}
                                  className="text-[11px] font-bold text-white/70 hover:text-white flex items-center gap-1.5 ml-auto cursor-pointer"
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
           {localActiveMenu === 'security' && (
             <div className="space-y-6 animate-in fade-in">
               <div>
                 <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                   <Shield className="w-5 h-5 text-emerald-600" /> HIPAA Security & Compliance Audit Trails
                 </h3>
                 <p className="text-sm text-white/70 font-medium">Review immutable access logs and security policy audit logs.</p>
               </div>
               
               <div className="h-px w-full bg-white/10"></div>

               {loadingAudits ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <div className="w-8 h-8 border-4 border-[#EEF4FF] border-t-[#2563EB] rounded-full animate-spin"></div>
                   <p className="text-xs text-white/70 mt-2 font-bold">Fetching secure audit records...</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto border border-white/10 rounded-[16px] premium-shadow bg-[#120524]">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase font-bold text-white/70">
                         <th className="py-3.5 px-4">Timestamp</th>
                         <th className="py-3.5 px-4">Operator</th>
                         <th className="py-3.5 px-4">Action</th>
                         <th className="py-3.5 px-4">Target Resource</th>
                         <th className="py-3.5 px-4">Host IP</th>
                       </tr>
                     </thead>
                     <tbody className="text-xs font-semibold text-white">
                       {auditLogs.map((log) => (
                         <tr key={log.id} className="border-b border-white/10 hover:bg-white/5/50 last:border-0">
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
          <div className="bg-[#120524] border border-white/10 w-full max-w-md rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#EEEAFE] text-[#A78BFA]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Invite Staff Member</h3>
                  <span className="text-[10px] font-semibold text-white/70">Authorize clinical portal access permissions</span>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 hover:bg-[#EEF2F6] rounded-full text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider block mb-1.5">Staff Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Dr. Robert Pattinson"
                  className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:ring-1 focus:ring-[#2E1055] transition-all placeholder:text-white/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. r.pattinson@sentinel.com"
                  className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:ring-1 focus:ring-[#2E1055] transition-all placeholder:text-white/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider block mb-1.5">System Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[16px] px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:ring-1 focus:ring-[#2E1055] transition-all cursor-pointer"
                >
                  <option value="Clinic Administrator" className="bg-[#120524] text-white">Clinic Administrator</option>
                  <option value="Operations Manager" className="bg-[#120524] text-white">Operations Manager</option>
                  <option value="Practice Manager" className="bg-[#120524] text-white">Practice Manager</option>
                  <option value="Staff User" className="bg-[#120524] text-white">Staff User</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-white/10 mt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="bg-[#120524] border border-white/10 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-[16px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2E1055] hover:bg-[#120524] text-white font-bold text-xs px-6 py-2.5 rounded-[16px] transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
