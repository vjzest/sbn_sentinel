'use client';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, Mail, Sun, LayoutDashboard, BrainCircuit, Users, Calendar, DollarSign, FileText, BarChart2, Settings, HelpCircle, LogOut, ChevronDown, CheckCircle2, Clock, AlertTriangle, ChevronRight, Plus, Moon, User, Activity, X, Cpu, Check, Menu, Shield, CreditCard, Database, Building2, ClipboardList, MessageSquare } from 'lucide-react';
import { StatCard } from '@/components/CommandCenter/StatCard';
import { SignalFeed } from '@/components/CommandCenter/SignalFeed';
import { RevenueImpact } from '@/components/CommandCenter/RevenueImpact';
import { ConnectorsView } from '@/components/CommandCenter/ConnectorsView';
import { IntelligenceView } from '@/components/CommandCenter/IntelligenceView';
import { PatientFlowView } from '@/components/CommandCenter/PatientFlowView';
import { ScheduleOptimizerView } from '@/components/CommandCenter/ScheduleOptimizerView';
import { ClinicalLogsView } from '@/components/CommandCenter/ClinicalLogsView';
import { RevenueReportsView } from '@/components/CommandCenter/RevenueReportsView';
import { TeamMessagingView } from '@/components/CommandCenter/TeamMessagingView';
import { SettingsView } from '@/components/CommandCenter/SettingsView';
import { HelpSupportView } from '@/components/CommandCenter/HelpSupportView';
import { AuditLogsView } from '@/components/CommandCenter/AuditLogsView';
import { AccessDeniedView } from '@/components/CommandCenter/AccessDeniedView';
import { UserProfileView } from '@/components/CommandCenter/UserProfileView';
import { SignalsDetailView } from '@/components/CommandCenter/SignalsDetailView';
import { AuthScreen } from '@/components/Auth/AuthScreen';
import { BootScreen } from '@/components/CommandCenter/BootScreen';
import { SuperAdminPanel } from '@/components/CommandCenter/SuperAdminPanel';
import { useSignalStream } from '@/hooks/useSignalStream';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ClinicalReminder {
  id: string;
  text: string;
  source: string;
  timestamp: string;
  completed: boolean;
}

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('org_admin');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Set dark class immediately to avoid flash of light mode
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
    return true; // dark mode on by default
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [reminderAdded, setReminderAdded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dynamic Settings States synced globally
  const [practiceName, setPracticeName] = useState('Sentinel');
  const [activePlan, setActivePlan] = useState('professional');
  const [activeModelName, setActiveModelName] = useState('GPT-4o');
  
  // Interactive Chat States
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sentinel_team_chats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [
      { sender: 'City Heart - Dr Jenkins', text: 'Daily encounter charts auto-coded and submitted.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false },
      { sender: 'Vijay Maurya', text: 'Operations and patient flow running smoothly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false }
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && chatMessages.length > 0) {
      localStorage.setItem('sentinel_team_chats', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);
  const [toastMessage, setToastMessage] = useState<{ msg: string; type?: string } | null>(null);

  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail) {
        setToastMessage({ msg: e.detail.message || e.detail.msg || 'Action completed successfully!', type: e.detail.type || 'success' });
        setTimeout(() => {
          setToastMessage(null);
        }, 4000);
      }
    };
    window.addEventListener('show-sentinel-toast', handleToast);
    return () => window.removeEventListener('show-sentinel-toast', handleToast);
  }, []);

  const stats = useSelector((state: RootState) => state.signals.stats);
  const signals = useSelector((state: RootState) => state.signals.events);

  useSignalStream();

  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reminders, setReminders] = useState<ClinicalReminder[]>([]);
  const [showAddReminderInput, setShowAddReminderInput] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');

  useEffect(() => {
    setMounted(true);
    const handleCloseMenu = () => setIsMobileMenuOpen(false);
    window.addEventListener('close-mobile-menu', handleCloseMenu);
    return () => window.removeEventListener('close-mobile-menu', handleCloseMenu);
  }, []);

  const loadRemindersFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clinicalReminders');
      if (saved) {
        try {
          setReminders(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  useEffect(() => {
    loadRemindersFromStorage();
    window.addEventListener('clinicalRemindersUpdated', loadRemindersFromStorage);
    return () => {
      window.removeEventListener('clinicalRemindersUpdated', loadRemindersFromStorage);
    };
  }, []);

  // Sync with signals
  useEffect(() => {
    if (!signals || signals.length === 0) return;
    
    let savedReminders: ClinicalReminder[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clinicalReminders');
      if (saved) {
        try {
          savedReminders = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }

    const signalReminders = signals
      .filter(s => s.recommended_action)
      .map(s => ({
        id: `signal-${s.id}`,
        text: s.recommended_action!,
        source: s.source || 'Sentinel AI',
        timestamp: s.timestamp || new Date().toISOString(),
        completed: false
      }));

    const merged = [...savedReminders];
    signalReminders.forEach(sr => {
      const exists = merged.some(m => m.id === sr.id || m.text === sr.text);
      if (!exists) {
        merged.push(sr);
      }
    });

    setReminders(merged);
    localStorage.setItem('clinicalReminders', JSON.stringify(merged));
  }, [signals]);

  const handleAddReminder = () => {
    if (!newReminderText.trim()) return;
    const newReminder: ClinicalReminder = {
      id: `custom-${Date.now()}`,
      text: newReminderText.trim(),
      source: 'Manual',
      timestamp: new Date().toISOString(),
      completed: false
    };
    const updated = [newReminder, ...reminders];
    setReminders(updated);
    localStorage.setItem('clinicalReminders', JSON.stringify(updated));
    setNewReminderText('');
    setShowAddReminderInput(false);
    
    setToast("✨ Clinical Reminder Added Successfully!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextState = !r.completed;
        if (nextState) {
          setToast(`✨ Completed Reminder: "${r.text}"`);
          setTimeout(() => setToast(null), 3000);
        }
        return { ...r, completed: nextState };
      }
      return r;
    });
    setReminders(updated);
    localStorage.setItem('clinicalReminders', JSON.stringify(updated));
  };

  // Check for active session token and load settings on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch(e) {}
    }

    if (!token) {
      router.push('/');
      return;
    }
    
    setIsLoggedIn(true);
    if (role) setUserRole(role);
    setIsBooting(false);
    
    // Load practice configuration from database
    fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.practice_name) setPracticeName(data.practice_name);
        if (data.active_plan) setActivePlan(data.active_plan);
        if (data.ai_model === 'claude') {
          setActiveModelName('Claude 3.5 Sonnet');
        } else {
          setActiveModelName('GPT-4o');
        }
        // Default: set dark mode ON (our UI is dark by design)
        if (data.theme_mode === 'light') {
          setIsDarkMode(false);
          document.documentElement.classList.remove('dark');
        } else {
          // dark or system → dark mode on (our default)
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        }
      })
      .catch(() => {});

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0B1121] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[#EEEAFE]0 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isBooting) {
    return <BootScreen onComplete={() => setIsBooting(false)} />;
  }

  return (
    <>
      {/* Global Toast Banner */}
      {toastMessage && (
        <div className={`fixed top-6 right-8 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3 bg-[#120524] border ${toastMessage.type === 'critical' ? 'border-rose-500/50' : toastMessage.type === 'warning' ? 'border-amber-500/50' : 'border-white/20'} text-white px-5 py-3.5 rounded-[12px] shadow-lg backdrop-blur-2xl`}>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${toastMessage.type === 'critical' ? 'bg-rose-500' : toastMessage.type === 'warning' ? 'bg-amber-500' : toastMessage.type === 'recommendation' ? 'bg-purple-400' : toastMessage.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-wider text-white/50 mb-0.5">
              {toastMessage.type === 'critical' ? 'Critical Alert' : toastMessage.type === 'warning' ? 'Warning' : toastMessage.type === 'recommendation' ? 'Recommendation' : toastMessage.type === 'info' ? 'Information' : 'Success'}
            </span>
            <p className="text-xs font-bold tracking-wide">{toastMessage.msg}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="ml-4 text-white/50 hover:text-white text-xs font-bold cursor-pointer">✕</button>
        </div>
      )}

      <div className="flex h-screen bg-white/10 text-white font-sans overflow-hidden w-full absolute inset-0 p-3 gap-3">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[55] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar - Floating Premium SaaS Style */}
        <aside className={`w-[260px] bg-[#120524] border border-white/10 rounded-[24px] flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out text-white shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[300px] md:translate-x-0'}`}>
          <div className="p-5 border-b border-white/10 relative overflow-hidden group flex justify-between items-center shrink-0">
            {/* Subtle line at top border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-white/10"></div>
            <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1">
              {/* Logo */}
              <div className="w-10 h-10 rounded-[12px] overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-[0_4px_15px_rgba(139,61,255,0.3)]">
                <img src="/logo.png" alt="SBN Sentinel" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-black tracking-tight text-white leading-none">SBN Sentinel</h1>
                <p className="text-[9px] text-white/60 tracking-[0.15em] uppercase font-bold mt-1.5 flex items-center gap-1.5">
                  Command Center <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981] shrink-0"></span>
                </p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/50 hover:text-white shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-8 bg-transparent">

            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 px-4">Dashboard</p>
              <div className="space-y-1">
                <SidebarItem icon={LayoutDashboard} label="Command Center" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 px-4">Operations</p>
              <div className="space-y-1">
                {['org_admin', 'clinic_admin', 'ops_manager', 'practice_manager', 'staff'].includes(userRole) && (
                  <SidebarItem icon={Users} label="Patient Flow" active={activeTab === 'patient-flow'} onClick={() => { setActiveTab('patient-flow'); setIsMobileMenuOpen(false); }} />
                )}
                {['org_admin', 'clinic_admin', 'practice_manager'].includes(userRole) && (
                  <SidebarItem icon={FileText} label="Clinical Logs" active={activeTab === 'clinical-logs'} onClick={() => { setActiveTab('clinical-logs'); setIsMobileMenuOpen(false); }} />
                )}
                <SidebarItem icon={MessageSquare} label="Team Messaging" active={activeTab === 'team-messaging'} onClick={() => { setActiveTab('team-messaging'); setIsMobileMenuOpen(false); }} />
              </div>
            </div>

            {['org_admin', 'clinic_admin', 'practice_manager'].includes(userRole) && (
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 px-4">Revenue</p>
                <div className="space-y-1">
                  <SidebarItem icon={DollarSign} label="Revenue Risk" active={activeTab === 'revenue-reports'} onClick={() => { setActiveTab('revenue-reports'); setIsMobileMenuOpen(false); }} />
                </div>
              </div>
            )}

            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 px-4">Reports & Insights</p>
              <div className="space-y-1">
                <SidebarItem icon={BrainCircuit} label="Intelligence Reports" active={activeTab === 'intelligence'} onClick={() => { setActiveTab('intelligence'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={Cpu} label="Signals History" active={activeTab === 'signals'} onClick={() => { setActiveTab('signals'); setIsMobileMenuOpen(false); }} />
              </div>
            </div>

            {['super_admin', 'org_admin', 'clinic_admin'].includes(userRole) && (
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 px-4">Administration</p>
                <div className="space-y-1">
                  <SidebarItem icon={Users} label="User Management" active={activeTab === 'settings-team'} onClick={() => { setActiveTab('settings-team'); setIsMobileMenuOpen(false); }} />
                  {['super_admin', 'org_admin'].includes(userRole) && (
                    <SidebarItem icon={Database} label="Connectors" active={activeTab === 'settings-integrations' || activeTab === 'connectors'} onClick={() => { setActiveTab('settings-integrations'); setIsMobileMenuOpen(false); }} />
                  )}
                  <SidebarItem icon={ClipboardList} label="Audit Logs" active={activeTab === 'audit-logs'} onClick={() => { setActiveTab('audit-logs'); setIsMobileMenuOpen(false); }} />
                </div>
              </div>
            )}

            {['super_admin', 'org_admin', 'clinic_admin'].includes(userRole) && (
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 px-4">Settings</p>
                <div className="space-y-1">
                  {['super_admin'].includes(userRole) && (
                    <SidebarItem icon={Building2} label="Organization Details" active={activeTab === 'settings-general'} onClick={() => { setActiveTab('settings-general'); setIsMobileMenuOpen(false); }} />
                  )}
                  {['super_admin', 'org_admin'].includes(userRole) && (
                    <SidebarItem icon={Building2} label="Clinics & Facilities" active={activeTab === 'settings-clinics'} onClick={() => { setActiveTab('settings-clinics'); setIsMobileMenuOpen(false); }} />
                  )}
                  <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'settings-notifications'} onClick={() => { setActiveTab('settings-notifications'); setIsMobileMenuOpen(false); }} />
                  <SidebarItem icon={Settings} label="Preferences" active={activeTab === 'settings-security'} onClick={() => { setActiveTab('settings-security'); setIsMobileMenuOpen(false); }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 space-y-1 border-t border-white/10 bg-white/5 rounded-b-[24px]">
            <SidebarItem icon={HelpCircle} label="Help & Support" active={activeTab === 'help'} onClick={() => setActiveTab('help')} />
            <SidebarItem icon={LogOut} label="Disconnect" active={false} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userRole'); router.push('/'); }} className="mt-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#120524] rounded-[24px] border border-white/10 shadow-sm">
          {/* Topbar */}
          <header className="h-20 flex items-center justify-between px-4 md:px-8 relative z-50 shrink-0">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white/50 hover:text-white mr-1">
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 md:gap-4 bg-white/5 border border-white/10 rounded-[14px] px-3 md:px-4 py-2 w-full max-w-[200px] md:max-w-96 shadow-inner">
                <Search className="w-4 h-4 text-white/50 shrink-0" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40" />
                <div className="hidden md:flex items-center gap-1">
                  <span className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded border border-white/10 font-mono">⌘</span>
                  <span className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded border border-white/10 font-mono">K</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-4 text-white/70">
                {/* Notifications - Live Backend Signals */}
                <div className="relative">
                  <button
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsMsgOpen(false); setIsProfileOpen(false); }}
                    className="relative hover:text-white transition-colors cursor-pointer"
                  >
                    <Bell className="w-5 h-5 text-white/80 hover:text-white" />
                    {signals.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#120524]">
                        {signals.length > 99 ? '99+' : signals.length}
                      </span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-4 w-80 bg-[#120524] border border-white/10 rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-white/10 flex justify-between items-center">
                        <p className="text-sm font-bold text-white">Live Signals & Notifications ({signals.length})</p>
                        <span onClick={() => setIsNotifOpen(false)} className="text-xs text-blue-400 font-bold cursor-pointer hover:underline">Close</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {signals.length === 0 ? (
                          <div className="p-6 text-center text-xs text-white/50">No backend signals detected.</div>
                        ) : (
                          signals.slice(0, 10).map((n: any, i: number) => (
                            <div key={n.id || i} onClick={() => { setActiveTab('signals'); setIsNotifOpen(false); }} className="p-3 border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors flex gap-3">
                              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.risk_level === 'Critical' || n.risk_level === 'High' ? 'bg-[#EF4444]' : n.risk_level === 'Moderate' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`}></div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">{n.source} • {n.type}</p>
                                <p className="text-xs text-white/70 font-medium mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-white/40 font-bold mt-1">{n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : 'Live Stream'}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-white/10 text-center">
                        <button onClick={() => { setActiveTab('signals'); setIsNotifOpen(false); }} className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer">View Signals Hub</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages - Live Team Communications */}
                <div className="relative">
                  <button
                    onClick={() => { setIsMsgOpen(!isMsgOpen); setIsNotifOpen(false); setIsProfileOpen(false); }}
                    className="relative hover:text-white transition-colors cursor-pointer"
                  >
                    <Mail className="w-5 h-5 text-white/80 hover:text-white" />
                    {chatMessages.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2563EB] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#120524]">
                        {chatMessages.length}
                      </span>
                    )}
                  </button>
                  {isMsgOpen && (
                    <div className="absolute right-0 mt-4 w-80 bg-[#120524] border border-white/10 rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-white/10 flex justify-between items-center">
                        <p className="text-sm font-bold text-white">Team Chat ({chatMessages.length})</p>
                        <span onClick={() => setIsMsgOpen(false)} className="text-xs text-blue-400 font-bold cursor-pointer hover:underline">Close</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {chatMessages.length === 0 ? (
                          <div className="p-6 text-center text-xs text-white/50">No messages in team inbox.</div>
                        ) : (
                          chatMessages.map((m: any, i: number) => (
                            <div key={i} onClick={() => { setActiveChat(m.sender); setIsMsgOpen(false); }} className="p-3 border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors flex gap-3 items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                                {m.sender ? m.sender.charAt(0) : 'T'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{m.sender}</p>
                                <p className="text-xs truncate mt-0.5 text-white/70">{m.text}</p>
                              </div>
                              <span className="text-[9px] text-white/40">{m.time}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-white/10 text-center">
                        <button onClick={() => { setActiveTab('clinical-logs'); setIsMsgOpen(false); }} className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer">Open Clinical Workspace</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative mr-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-[10px] text-xs font-bold text-white flex items-center gap-1.5 select-none">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {userRole === 'org_admin' && 'Organization Admin'}
                    {userRole === 'clinic_admin' && 'Clinic Admin'}
                    {userRole === 'ops_manager' && 'Operations Manager'}
                    {userRole === 'practice_manager' && 'Practice Manager'}
                    {userRole === 'staff' && 'Staff User'}
                  </span>
                </div>

                <button
                  onClick={async () => {
                    const newMode = !isDarkMode;
                    setIsDarkMode(newMode);
                    if (newMode) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                    // Save to backend
                    try {
                      await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ theme_mode: newMode ? 'dark' : 'light' })
                      });
                    } catch {}
                  }}
                  className="hidden md:block hover:text-white transition-colors cursor-pointer"
                  title={isDarkMode ? "Disable Dark Mode" : "Enable Dark Mode"}
                >
                  {isDarkMode ? <Moon className="w-5 h-5 text-[#2E1055]" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
              <div className="h-8 w-px bg-[#E8EDF5]"></div>

              <div className="relative">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsMsgOpen(false); }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-[#2E1055] to-[#120524] flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-white group-hover:text-[#2E1055] transition-colors">
                      {userRole === 'org_admin' && 'Org Admin'}
                      {userRole === 'clinic_admin' && 'Clinic Admin'}
                      {userRole === 'ops_manager' && 'Ops Manager'}
                      {userRole === 'practice_manager' && 'Practice Manager'}
                      {userRole === 'staff' && 'Staff User'}
                    </p>
                    <p className="text-[11px] text-white/70 font-medium">
                      {userRole === 'org_admin' && `Global Admin • ${activePlan.toUpperCase()}`}
                      {userRole === 'clinic_admin' && `Clinic Admin • ${activePlan.toUpperCase()}`}
                      {userRole === 'ops_manager' && 'Operations'}
                      {userRole === 'practice_manager' && 'Practice Ops'}
                      {userRole === 'staff' && 'General Staff'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/70 group-hover:text-white transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-[#120524] border border-white/15 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 p-2">
                    <div className="p-3 border-b border-white/10 mb-1">
                      <p className="text-sm font-bold text-white tracking-wide">{currentUser?.full_name || 'Admin User'}</p>
                      <p className="text-xs font-medium text-white/60 truncate mt-0.5">{currentUser?.email || 'admin@sbnsentinel.com'}</p>
                    </div>
                    <div className="space-y-1">
                      <button 
                        onClick={() => { setActiveTab('profile'); setIsProfileOpen(false); }} 
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-[12px] transition-all cursor-pointer"
                      >
                        <User className="w-4 h-4 text-blue-400" /> Profile Details
                      </button>
                      <button
                        onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-[12px] transition-all cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-purple-400" /> Account Settings
                      </button>
                    </div>
                    <div className="mt-1 pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          localStorage.removeItem('userRole');
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-[12px] transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto px-8 pb-8 pt-2 relative z-10 custom-scrollbar">

            {activeTab === 'dashboard' && (
              <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Hero */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 md:mb-2 gap-4">
                  <div>
                    <p className="text-[#2E1055] font-semibold text-sm mb-1">Good Morning, Admin! 👋</p>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Multi-Provider Operations</h2>
                    <p className="text-sm text-white/70 font-medium hidden md:block">Real-time overview of clinic operations across all doctors and intelligence engine outputs.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <div className="relative">
                      <div
                        onClick={() => { setIsNotifOpen(false); setIsMsgOpen(false); setIsProfileOpen(false); document.getElementById('providerDropdown')?.classList.toggle('hidden'); }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[16px] px-4 py-2.5 premium-shadow cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#2E1055]" />
                        <div className="text-sm">
                          <span className="font-bold text-white" id="selectedProviderText">All Providers</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/70" />
                      </div>
                      <div id="providerDropdown" className="hidden absolute right-0 mt-3 w-[320px] bg-[#120524] border border-white/20 rounded-[16px] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 space-y-1">
                          <button onClick={(e) => { document.getElementById('selectedProviderText')!.innerText = 'All Providers'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-[10px] transition-colors">All Providers</button>
                          {[
                            { name: 'Dr. Sarah Mitchell', specialty: 'Internal Medicine' },
                            { name: 'Dr. James Okafor', specialty: 'Family Medicine' },
                            { name: 'Dr. Priya Sharma', specialty: 'Urgent Care' },
                            { name: 'Dr. Carlos Rivera', specialty: 'Pediatrics' },
                            { name: 'Dr. Emily Chen', specialty: 'Cardiology' }
                          ].map((doc) => (
                            <button 
                              key={doc.name} 
                              onClick={(e) => { document.getElementById('selectedProviderText')!.innerText = doc.name; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} 
                              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-[#9CA3AF] hover:text-white hover:bg-white/10 rounded-[10px] transition-colors"
                            >
                              <span>{doc.name}</span>
                              <span className="text-xs font-normal opacity-50 whitespace-nowrap">{doc.specialty}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => { document.getElementById('dateDropdown')?.classList.toggle('hidden'); }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[16px] px-4 py-2.5 premium-shadow hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-white/70" />
                        <div className="text-sm">
                          <span className="font-bold text-white" id="selectedDateText">Today</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/70" />
                      </button>
                      <div id="dateDropdown" className="hidden absolute right-0 mt-3 w-48 bg-[#120524] border border-white/20 rounded-[16px] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 space-y-1">
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Today'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-[10px] transition-colors">Today</button>
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Yesterday'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-white hover:bg-white/10 rounded-[10px] transition-colors">Yesterday</button>
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Last 7 Days'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-white hover:bg-white/10 rounded-[10px] transition-colors">Last 7 Days</button>
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Last 30 Days'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-white hover:bg-white/10 rounded-[10px] transition-colors">Last 30 Days</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[16px] px-4 py-2.5 premium-shadow">
                      <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Live System</p>
                        <p className="text-sm font-bold text-[#10B981]">Connected</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Active Signals" value={stats.activeSignals.toLocaleString()} trend="12.5%" trendUp={true} color="blue" sparkData="M0,40 C20,30 40,50 60,20 C80,-10 100,20 120,5" icon={Activity} onClick={() => setActiveTab('intelligence')} />
                  <StatCard title="Patient Flow" value={stats.patientFlow.toString()} trend="8.2%" trendUp={true} color="green" sparkData="M0,40 C20,45 40,20 60,30 C80,40 100,10 120,0" icon={Users} onClick={() => setActiveTab('patient-flow')} />
                  <StatCard title="Critical Events" value={stats.criticalEvents.toString()} trend="50%" trendUp={false} color="red" sparkData="M0,10 C20,10 40,30 60,10 C80,-10 100,40 120,20" icon={AlertTriangle} onClick={() => setActiveTab('clinical-logs')} />
                  <StatCard title="Actions Taken" value={stats.actionsTaken.toString()} trend="15.3%" trendUp={true} color="purple" sparkData="M0,30 C20,40 40,10 60,20 C80,30 100,-5 120,5" icon={CheckCircle2} onClick={() => setActiveTab('intelligence')} />
                </div>

                {/* Main Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SignalFeed setActiveTab={setActiveTab} />
                  <RevenueImpact setActiveTab={setActiveTab} />
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Patient Flow Donut */}
                  <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-[24px] border border-white/10 p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover text-white">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-6">
                      <Users className="w-5 h-5 text-[#2563EB]" /> Patient Flow Overview
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F3F4F6" strokeWidth="4"></circle>
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="72 28" strokeDashoffset="0"></circle>
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#120524" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-72"></circle>
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-90"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-extrabold text-white">{stats.patientFlow}</span>
                          <span className="text-[9px] text-white/70 font-bold uppercase">Total Patients</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                          <span className="text-white/70 font-medium">Checked In</span>
                          <span className="font-bold text-white ml-2">72% ({Math.round(stats.patientFlow * 0.72)})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#120524]"></div>
                          <span className="text-white/70 font-medium">In Consultation</span>
                          <span className="font-bold text-white ml-2">18% ({Math.round(stats.patientFlow * 0.18)})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                          <span className="text-white/70 font-medium">Checked Out</span>
                          <span className="font-bold text-white ml-2">10% ({Math.round(stats.patientFlow * 0.10)})</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <button onClick={() => setActiveTab('patient-flow')} className="text-sm font-bold text-[#2563EB] flex items-center gap-1 hover:underline cursor-pointer">View Full Report <ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {/* Critical Alerts */}
                  <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-[24px] border border-white/10 p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover text-white">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#EF4444]" /> Critical Event Alerts
                      </h3>
                      <button onClick={() => setActiveTab('clinical-logs')} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">View All</button>
                    </div>
                    <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {signals.filter(s => s.ai_insight?.toLowerCase().includes('loss')).slice(0, 3).length > 0 ? (
                        signals
                          .filter(s => s.ai_insight?.toLowerCase().includes('loss'))
                          .slice(0, 3)
                          .map((alert, i) => (
                            <div key={i} className="flex items-start justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5 bg-rose-50 text-rose-500">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{alert.type} Alert</p>
                                  <p className="text-xs text-white/70 font-medium mt-0.5 line-clamp-1">{alert.message}</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-[#EF4444] whitespace-nowrap ml-2">
                                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                      ) : (
                        <div className="flex items-center justify-center h-20 text-[#9CA3AF] text-sm font-medium">
                          No critical alerts currently.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clinical Reminders */}
                  <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-[24px] border border-white/10 p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover text-white">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#120524]" /> Clinical Reminders
                      </h3>
                      <button
                        onClick={() => setShowAddReminderInput(!showAddReminderInput)}
                        className="text-xs font-bold text-[#2563EB] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Reminder
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {/* Inline Input for Adding Reminder */}
                      {showAddReminderInput && (
                        <div className="flex items-center gap-2 p-2 border border-dashed border-[#120524]/40 rounded-[16px] bg-[#F5F3FF]/30 mb-3 animate-in slide-in-from-top-2">
                          <input
                            type="text"
                            placeholder="Type reminder and press Enter..."
                            value={newReminderText}
                            onChange={(e) => setNewReminderText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddReminder();
                              }
                            }}
                            className="flex-1 bg-white/5 border border-white/10 text-xs font-bold text-[#1F2937] rounded-[10px] px-3 py-1.5 outline-none focus:border-[#120524]"
                            autoFocus
                          />
                          <button
                            onClick={handleAddReminder}
                            className="bg-[#120524] hover:bg-[#6D28D9] text-white p-1.5 rounded-[8px] transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setShowAddReminderInput(false);
                              setNewReminderText('');
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1.5 rounded-[8px] transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {reminders.length > 0 ? (
                        reminders.map((rem) => (
                          <div 
                            key={rem.id} 
                            onClick={() => handleToggleReminder(rem.id)}
                            className={`flex items-center justify-between p-3 border rounded-[16px] transition-all cursor-pointer group ${
                              rem.completed 
                                ? 'bg-slate-50/70 border-[#E8EDF5] opacity-60' 
                                : 'bg-white/5 border-[#E8EDF5] hover:border-[#120524]/30 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                  rem.completed 
                                    ? 'bg-[#10B981] border-[#10B981] text-white shadow-[0_0_8px_#10B981]' 
                                    : 'border-[#D1D5DB] group-hover:border-[#120524]'
                                }`}
                              >
                                {rem.completed && <Check className="w-3 h-3 text-white stroke-[3]" />}
                              </div>
                              <div>
                                <p className={`text-sm font-bold transition-all ${
                                  rem.completed 
                                    ? 'text-white/70 line-through font-medium' 
                                    : 'text-white group-hover:text-[#120524]'
                                }`}>
                                  {rem.text}
                                </p>
                                <p className="text-xs text-[#9CA3AF] font-bold mt-0.5">{rem.source} Task</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap ml-2">
                              {new Date(rem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-[#9CA3AF] text-xs font-semibold border-2 border-dashed border-[#E8EDF5] rounded-[16px]">
                          No pending clinical reminders.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* MS-008 Executive Dashboard Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Decision Context */}
                  <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)]">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-[#A78BFA]" /> Decision Context Summary
                    </h3>
                    <div className="space-y-3">
                      {signals.length === 0 ? (
                        <p className="text-xs text-[#9CA3AF] font-medium">No context data available.</p>
                      ) : (
                        Object.entries(signals.reduce((acc: any, curr) => {
                          const ctx = curr.primary_context || 'Unknown';
                          acc[ctx] = (acc[ctx] || 0) + 1;
                          return acc;
                        }, {})).map(([ctx, count]: [string, any]) => (
                          <div key={ctx} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                            <span className="text-sm font-semibold text-white/80">{ctx}</span>
                            <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-[6px]">{count}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)]">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                      <Database className="w-5 h-5 text-[#10B981]" /> System Health
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-semibold text-white/90">Practice Fusion API</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-[6px]">Healthy</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-semibold text-white/90">Twilio Webhooks</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-[6px]">Healthy</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-semibold text-white/90">Last Sync</span>
                        </div>
                        <span className="text-xs font-mono text-white/50">Just now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'intelligence' && (['practice_manager', 'staff', 'ops_manager'].includes(userRole) ? <AccessDeniedView onReturn={() => setActiveTab('dashboard')} /> : <IntelligenceView />)}
            {activeTab === 'signals' && (['practice_manager', 'staff', 'ops_manager'].includes(userRole) ? <AccessDeniedView onReturn={() => setActiveTab('dashboard')} /> : <SignalFeed />)}
            {activeTab === 'signals-detail' && (['practice_manager', 'staff', 'ops_manager'].includes(userRole) ? <AccessDeniedView onReturn={() => setActiveTab('dashboard')} /> : <SignalsDetailView />)}
            {activeTab === 'connectors' && (['practice_manager', 'staff', 'ops_manager'].includes(userRole) ? <AccessDeniedView onReturn={() => setActiveTab('dashboard')} /> : <ConnectorsView />)}
            {activeTab === 'patient-flow' && <PatientFlowView />}
            {activeTab === 'schedule' && <ScheduleOptimizerView />}
            {activeTab === 'clinical-logs' && <ClinicalLogsView />}
            {activeTab === 'revenue-reports' && (['practice_manager', 'staff'].includes(userRole) ? <AccessDeniedView onReturn={() => setActiveTab('dashboard')} /> : <RevenueReportsView />)}
            {activeTab === 'team-messaging' && <TeamMessagingView currentUser={currentUser} />}
            {activeTab === 'audit-logs' && (['practice_manager', 'staff', 'ops_manager'].includes(userRole) ? <AccessDeniedView onReturn={() => setActiveTab('dashboard')} /> : <AuditLogsView />)}
            {activeTab.startsWith('settings-') && (
              (['practice_manager', 'staff', 'ops_manager'].includes(userRole) && ['settings-integrations', 'settings-clinics', 'settings-billing', 'settings-security', 'settings-team', 'settings-general'].includes(activeTab)) 
                ? <AccessDeniedView onReturn={() => setActiveTab('dashboard')} /> 
                : <SettingsView
                    activeMenuProp={activeTab === 'settings-general' ? 'general' : activeTab === 'settings-ai' ? 'ai' : activeTab === 'settings-team' ? 'team' : activeTab === 'settings-notifications' ? 'notifications' : activeTab === 'settings-integrations' ? 'integrations' : activeTab === 'settings-billing' ? 'billing' : activeTab === 'settings-security' ? 'security' : activeTab === 'settings-clinics' ? 'settings-clinics' : 'general'}
                    onSaveSettings={(data) => {
                      if (data.practiceName) setPracticeName(data.practiceName);
                      if (data.activePlan) setActivePlan(data.activePlan);
                      if (data.aiModel) {
                        if (data.aiModel === 'claude') {
                          setActiveModelName('Claude 3.5 Sonnet');
                        } else {
                          setActiveModelName('GPT-4o');
                        }
                      }
                      if (data.themeMode) {
                        const isDark = data.themeMode === 'dark';
                        setIsDarkMode(isDark);
                        if (isDark) document.documentElement.classList.add('dark');
                        else document.documentElement.classList.remove('dark');
                      }
                    }}
                  />
            )}
            {activeTab === 'help' && <HelpSupportView />}
            {activeTab === 'profile' && <UserProfileView />}
          </div>
        </main>
      </div>

      {/* Interactive Secure Messenger Modal */}
      {activeChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/5 border border-white/10 rounded-[28px] w-full max-w-md premium-shadow overflow-hidden flex flex-col h-[500px] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E8EDF5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                  {activeChat.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeChat}</h4>
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online • HIPAA Secure
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setActiveChat(null)} 
                className="w-8 h-8 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-colors cursor-pointer text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-[#9CA3AF] font-bold mb-1 px-1">{msg.sender} • {msg.time}</span>
                  <div className={`px-4 py-2.5 rounded-[18px] max-w-[85%] text-xs font-semibold leading-relaxed shadow-sm ${msg.isMe ? 'bg-[#2563EB] text-white rounded-tr-none' : 'bg-white/5 text-white border border-[#E8EDF5] rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMessageText.trim()) return;
                const newMsg = {
                  sender: 'Me',
                  text: newMessageText,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isMe: true
                };
                setChatMessages([...chatMessages, newMsg]);
                setNewMessageText('');
                
                // Simulate quick response from the recipient
                setTimeout(() => {
                  setChatMessages(prev => [
                    ...prev,
                    {
                      sender: activeChat,
                      text: `Thanks for the update. Let's touch base on the pipeline sync later!`,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      isMe: false
                    }
                  ]);
                }, 1500);
              }}
              className="p-4 border-t border-[#E8EDF5] bg-white/5 flex gap-2 items-center"
            >
              <input 
                type="text" 
                placeholder="Type your secure message..." 
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 bg-slate-50 border border-[#E8EDF5] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#2563EB] transition-colors"
              />
              <button 
                type="submit" 
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
      {mounted && toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#111827] text-white border border-[#374151] rounded-[20px] py-4 px-6 premium-shadow flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black tracking-wide text-slate-100">{toast}</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
const SidebarItem = ({ icon: Icon, label, active, onClick, className = '' }: { icon: any, label: string, active: boolean, onClick: () => void, className?: string }) => (
  <button
    onClick={(e) => {
      onClick();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('close-mobile-menu'));
    }}
    className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-[16px] transition-all duration-300 ${
      active 
        ? 'bg-white/10 text-white font-extrabold border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]' 
        : 'text-white/60 font-bold hover:bg-white/5 hover:text-white'
    } ${className}`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-[#2E1055] to-[#120524] rounded-r-full shadow-[0_0_8px_#2E1055]"></div>
    )}
    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white/70' : 'text-white/40 group-hover:text-[#475569]'}`} />
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);
