import { fetchWithAuth } from '@/utils/fetchWithAuth';
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

  // Clinics States
  const [clinicsList, setClinicsList] = useState<any[]>([
    { id: '1', name: 'Sentinel Health Urgent Care (Main)', address: '123 Health Ave, New York, NY', phone: '(555) 019-2834', status: 'Active' }
  ]);
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicAddress, setNewClinicAddress] = useState('');
  const [newClinicPhone, setNewClinicPhone] = useState('');

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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit`);
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/team`);
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/integrations`);
      if (res.ok) {
        const data = await res.json();
        setIntegrationsList(data);
      }
      
      // Fetch Clinics
      const clinicsRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/clinics`);
      if (clinicsRes.ok) {
        const clinicsData = await clinicsRes.json();
        setClinicsList(clinicsData);
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
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`);
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`, {
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/team/invite`, {
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/integrations/${id}/toggle`, {
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

  const handleAddClinic = async () => {
    if (!newClinicName) {
      setToast({ message: 'Clinic name is required', type: 'error' });
      return;
    }
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/clinics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClinicName,
          address: newClinicAddress,
          phone: newClinicPhone
        })
      });
      if (!res.ok) throw new Error('Failed to create clinic');
      const data = await res.json();
      setClinicsList([...clinicsList, data]);
      setToast({ message: 'Clinic created successfully', type: 'success' });
      setShowAddClinicModal(false);
      setNewClinicName('');
      setNewClinicAddress('');
      setNewClinicPhone('');
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
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

  const handleSubscribe = async (plan: any) => {
    if (activePlan === plan.id) {
      showToast(`Already on ${plan.name} plan`);
      return;
    }
    const amountNum = parseInt(plan.price.replace(/[^0-9]/g, '')) || 199;
    
    setIsProcessingPayment(true);
    showToast(`Initiating checkout for ${plan.name}...`);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/billing/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id, amount: amountNum * 100, currency: 'USD' })
      });
      if (!res.ok) throw new Error('Order creation failed');
      const data = await res.json();
      
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Sentinel Health',
        description: `Upgrade to ${plan.name}`,
        order_id: data.order_id,
        handler: async function (response: any) {
          const verifyRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/billing/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id || 'mock_pay_id',
              razorpay_signature: response.razorpay_signature || 'mock_sig'
            })
          });
          if (verifyRes.ok) {
            setActivePlan(plan.id);
            showToast(`Successfully upgraded to ${plan.name}!`);
            setInvoices([{ id: data.invoice_id, date: new Date().toLocaleDateString(), amount: amountNum, status: 'Paid' }, ...invoices]);
          } else {
            showToast('Payment verification failed', 'error');
          }
        },
        prefill: {
          name: practiceName,
          contact: '9999999999'
        },
        theme: {
          color: '#2563EB'
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        showToast('Payment failed', 'error');
      });
      rzp.open();
    } catch (err) {
      showToast('Error initiating checkout', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderContent = () => {
    switch (localActiveMenu) {
      case 'settings-clinics':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-[24px]">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Clinics & Facilities</h3>
                <p className="text-sm text-white/50">Manage your organization's physical clinic locations.</p>
              </div>
              <button 
                onClick={() => setShowAddClinicModal(true)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Clinic
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[24px] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Clinic Name</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Address</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Phone</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {clinicsList.map((clinic, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                          <div className="w-8 h-8 rounded-full bg-[#2E1055] flex items-center justify-center">
                            <Building className="w-4 h-4 text-white/70" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{clinic.name}</p>
                            <p className="text-[11px] text-white/40">ID: {clinic.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-white/70">{clinic.address || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-white/70">{clinic.phone || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${clinic.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/10 text-white/50 border border-white/20'}`}>
                          {clinic.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-[11px] font-bold text-[#2563EB] hover:text-white transition-colors bg-[#2563EB]/10 px-3 py-1.5 rounded-lg">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {clinicsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 px-6 text-center text-sm text-white/50">No clinics configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0 mb-4 md:mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
            {localActiveMenu === 'general' ? 'Organization Details' :
             localActiveMenu === 'clinics' || localActiveMenu === 'settings-clinics' ? 'Clinics & Facilities' :
             localActiveMenu === 'team' ? 'Users & Roles' :
             localActiveMenu === 'notifications' ? 'Notifications' :
             localActiveMenu === 'integrations' ? 'Integrations' :
             localActiveMenu === 'billing' ? 'Billing & Plans' :
             localActiveMenu === 'security' ? 'Compliance & Security' : 'Settings'}
          </h2>
          <p className="text-sm text-white/70 font-medium">Manage your system configurations and preferences.</p>
        </div>
        <button 
          onClick={handleSaveChanges}
          className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-bold text-xs px-6 py-3 rounded-[14px] transition-all active:scale-95 cursor-pointer w-full md:w-auto"
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
                     </select>
                   </div>
                 </div>

                 <div className="h-px w-full bg-white/10"></div>

                 <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Standard Operating Hours</h4>
                      <p className="text-xs text-white/70 leading-relaxed">Establish check-in periods for patients waitlists.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
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
                                  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings/team/${member.id}`, { method: 'DELETE' });
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
                          handleSubscribe(plan);
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
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
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
                   <Shield className="w-5 h-5 text-emerald-600" /> Security & Compliance Audit Trails
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

           {/* Dynamically render extras */}
           {renderContent()}

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

      {/* Add Clinic Modal */}
      {showAddClinicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddClinicModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#120524] border border-white/10 rounded-[24px] shadow-2xl p-6">
            <button onClick={() => setShowAddClinicModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Add New Clinic</h3>
            <p className="text-sm text-white/50 mb-6">Create a new clinic location under your organization.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-white/40 uppercase tracking-wider mb-2">Clinic Name</label>
                <input 
                  type="text"
                  placeholder="e.g. City Heart North"
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[12px] py-2.5 px-4 text-sm font-bold text-white outline-none focus:border-[#2E1055] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-white/40 uppercase tracking-wider mb-2">Address</label>
                <input 
                  type="text"
                  placeholder="e.g. 456 Medical Parkway, TX"
                  value={newClinicAddress}
                  onChange={(e) => setNewClinicAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[12px] py-2.5 px-4 text-sm font-bold text-white outline-none focus:border-[#2E1055] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-white/40 uppercase tracking-wider mb-2">Phone</label>
                <input 
                  type="text"
                  placeholder="e.g. (555) 123-4567"
                  value={newClinicPhone}
                  onChange={(e) => setNewClinicPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[12px] py-2.5 px-4 text-sm font-bold text-white outline-none focus:border-[#2E1055] transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowAddClinicModal(false)} className="px-5 py-2.5 rounded-[12px] text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddClinic} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold transition-colors">
                Create Clinic
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
