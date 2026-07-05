'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, Mail, Sun, LayoutDashboard, BrainCircuit, Users, Calendar, DollarSign, FileText, BarChart2, Settings, HelpCircle, LogOut, ChevronDown, CheckCircle2, Clock, AlertTriangle, ChevronRight, Plus, Moon, User, Activity, X, Cpu, Check, Menu } from 'lucide-react';
import { StatCard } from '@/components/CommandCenter/StatCard';
import { SignalFeed } from '@/components/CommandCenter/SignalFeed';
import { AIInsights } from '@/components/CommandCenter/AIInsights';
import { RevenueImpact } from '@/components/CommandCenter/RevenueImpact';
import { ConnectorsView } from '@/components/CommandCenter/ConnectorsView';
import { IntelligenceView } from '@/components/CommandCenter/IntelligenceView';
import { PatientFlowMonitor } from '@/components/CommandCenter/PatientFlowMonitor';
import { ScheduleOptimizerView } from '@/components/CommandCenter/ScheduleOptimizerView';
import { ClinicalLogsView } from '@/components/CommandCenter/ClinicalLogsView';
import { RevenueReportsView } from '@/components/CommandCenter/RevenueReportsView';
import { SettingsView } from '@/components/CommandCenter/SettingsView';
import { HelpSupportView } from '@/components/CommandCenter/HelpSupportView';
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
  const [userRole, setUserRole] = useState('admin');
  const [isDarkMode, setIsDarkMode] = useState(false);
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
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'Dr. Alan Grant', text: 'Can we review the Q3 revenue projections and the undercoding claims today?', time: '10:42 AM', isMe: false },
    { sender: 'Me', text: 'Yes, I just approved the AI recode recommendations which recovered $540.', time: '10:45 AM', isMe: true },
    { sender: 'Dr. Alan Grant', text: 'Excellent! That is a significant recovery. Let me know when the billing batch is completed.', time: '10:47 AM', isMe: false }
  ]);
  const [newMessageText, setNewMessageText] = useState('');

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
    if (!token) {
      router.push('/');
      return;
    }
    
    setIsLoggedIn(true);
    if (role) setUserRole(role);
    setIsBooting(false);
    
    // Load practice configuration from database
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.practice_name) setPracticeName(data.practice_name);
        if (data.active_plan) setActivePlan(data.active_plan);
        if (data.ai_model === 'claude') {
          setActiveModelName('Claude 3.5 Sonnet');
        } else {
          setActiveModelName('GPT-4o');
        }
        if (data.theme_mode === 'dark') {
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        } else if (data.theme_mode === 'light') {
          setIsDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      })
      .catch(() => {});

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0B1121] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isBooting) {
    return <BootScreen onComplete={() => setIsBooting(false)} />;
  }

  return (
    <>
      {isDarkMode && (
        <style dangerouslySetInnerHTML={{
          __html: `
          html {
            /* Premium Instant Dark Mode: 
               - Invert 100% to perfectly flip lightness 
               - Hue-rotate 180deg to perfectly restore original color hues
               - Slight brightness & contrast bump for crisp text 
            */
            filter: invert(1) hue-rotate(180deg) brightness(1.1) contrast(0.95) !important;
            background-color: #030712 !important;
          }
          /* Re-invert images and videos so they don't look like negatives */
          img, video {
            filter: invert(1) hue-rotate(180deg) !important;
            opacity: 0.9; /* Soften bright images in dark mode */
          }
          /* Specific overrides for gradients and shadows */
          .premium-shadow {
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.05) !important;
          }
        `}} />
      )}
      <div className="flex h-screen bg-[#F7F9FC] text-[#111827] font-sans overflow-hidden w-full absolute inset-0">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[55] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`w-64 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] border-r border-[#E2E8F0] flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out text-slate-700 shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 pb-5 border-b border-[#E2E8F0] relative overflow-hidden group flex justify-between items-center">
            {/* Subtle premium gradient indicator at the top border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-black text-xl shadow-[0_4px_15px_rgba(79,70,229,0.25)] group-hover:scale-105 transition-transform duration-300">
                {practiceName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-black tracking-tight text-[#0F172A] leading-none truncate" title={practiceName}>{practiceName}</h1>
                <p className="text-[9px] text-[#4F46E5] tracking-[0.2em] uppercase font-black mt-1.5 flex items-center gap-1.5">
                  Command Center <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span>
                </p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-8 bg-[#F8FAFC]/50">

            <div>
              <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-3 px-4">Core System</p>
              <div className="space-y-1">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                {['admin', 'clinic_admin'].includes(userRole) && (
                  <>
                    <SidebarItem icon={BrainCircuit} label="Intelligence Layer" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} />
                    <SidebarItem icon={Cpu} label="Signals Hub" active={activeTab === 'signals'} onClick={() => setActiveTab('signals')} />
                    <SidebarItem icon={Activity} label="Reality Sources" active={activeTab === 'connectors'} onClick={() => setActiveTab('connectors')} />
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-3 px-4">Operations</p>
              <div className="space-y-1">
                {['admin', 'clinic_admin', 'provider', 'frontdesk'].includes(userRole) && (
                  <SidebarItem icon={Users} label="Patient Flow" active={activeTab === 'patient-flow'} onClick={() => setActiveTab('patient-flow')} />
                )}
                {['admin', 'clinic_admin', 'provider', 'frontdesk'].includes(userRole) && (
                  <SidebarItem icon={Calendar} label="Schedule Optimizer" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
                )}
                {['admin', 'clinic_admin', 'provider', 'biller'].includes(userRole) && (
                  <SidebarItem icon={FileText} label="Clinical Logs" active={activeTab === 'clinical-logs'} onClick={() => setActiveTab('clinical-logs')} />
                )}
                {['admin', 'clinic_admin', 'biller'].includes(userRole) && (
                  <SidebarItem icon={DollarSign} label="Revenue Reports" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} />
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-1 border-t border-[#E2E8F0] bg-[#F1F5F9]/50">
            <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <SidebarItem icon={HelpCircle} label="Help & Support" active={activeTab === 'help'} onClick={() => setActiveTab('help')} />
            <SidebarItem icon={LogOut} label="Disconnect" active={false} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userRole'); router.push('/'); }} className="mt-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-100" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F7F9FC]">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#4F46E5]/5 to-[#7C3AED]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
          <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-[#2563EB]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
          {/* Topbar */}
          <header className="h-20 flex items-center justify-between px-4 md:px-8 relative z-50 shrink-0">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-500 hover:text-gray-900 mr-1">
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 md:gap-4 bg-white border border-[#E8EDF5] rounded-[14px] px-3 md:px-4 py-2 w-full max-w-[200px] md:max-w-96 premium-shadow">
                <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-[#111827] w-full placeholder:text-[#9CA3AF]" />
                <div className="hidden md:flex items-center gap-1">
                  <span className="text-[10px] bg-[#F7F9FC] text-[#6B7280] px-1.5 py-0.5 rounded border border-[#E8EDF5] font-mono">⌘</span>
                  <span className="text-[10px] bg-[#F7F9FC] text-[#6B7280] px-1.5 py-0.5 rounded border border-[#E8EDF5] font-mono">K</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-4 text-[#6B7280]">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsMsgOpen(false); setIsProfileOpen(false); }}
                    className="relative hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#F7F9FC]">3</span>
                  </button>
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-4 w-80 bg-white border border-[#E8EDF5] rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-[#F3F4F6] flex justify-between items-center">
                        <p className="text-sm font-bold text-[#111827]">Notifications</p>
                        <span className="text-xs text-[#4F46E5] font-bold cursor-pointer hover:underline">Mark all as read</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {[
                          { title: 'Critical Wait Time', msg: 'ED wait times exceeded 45 mins.', time: '2 mins ago', type: 'alert' },
                          { title: 'Schedule Optimized', msg: 'Dr. Smith\'s afternoon schedule was auto-balanced.', time: '1 hr ago', type: 'success' },
                          { title: 'New Signal Source', msg: 'Epic EHR connector is now active.', time: '3 hrs ago', type: 'info' }
                        ].map((n, i) => (
                          <div key={i} className="p-3 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors flex gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'alert' ? 'bg-[#EF4444]' : n.type === 'success' ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}></div>
                            <div>
                              <p className="text-sm font-bold text-[#111827]">{n.title}</p>
                              <p className="text-xs text-[#6B7280] font-medium mt-0.5">{n.msg}</p>
                              <p className="text-[10px] text-[#9CA3AF] font-bold mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 border-t border-[#F3F4F6] text-center">
                        <button onClick={() => { setActiveTab('intelligence'); setIsNotifOpen(false); }} className="text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer">View All Notifications</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="relative">
                  <button
                    onClick={() => { setIsMsgOpen(!isMsgOpen); setIsNotifOpen(false); setIsProfileOpen(false); }}
                    className="relative hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2563EB] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#F7F9FC]">5</span>
                  </button>
                  {isMsgOpen && (
                    <div className="absolute right-0 mt-4 w-80 bg-white border border-[#E8EDF5] rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-[#F3F4F6] flex justify-between items-center">
                        <p className="text-sm font-bold text-[#111827]">Messages</p>
                        <span className="text-xs text-[#4F46E5] font-bold cursor-pointer hover:underline">New Message</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {[
                          { name: 'Dr. Alan Grant', msg: 'Can we review the Q3 revenue projections?', time: '10:42 AM', unread: true },
                          { name: 'System Admin', msg: 'Server maintenance scheduled for tonight.', time: 'Yesterday', unread: true },
                          { name: 'Jane Doe (Billing)', msg: 'Insurance claims batch processed successfully.', time: 'Yesterday', unread: false }
                        ].map((m, i) => (
                          <div key={i} onClick={() => { setActiveChat(m.name); setIsMsgOpen(false); }} className="p-3 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                              {m.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm text-[#111827] truncate ${m.unread ? 'font-bold' : 'font-medium'}`}>{m.name}</p>
                              <p className={`text-xs truncate mt-0.5 ${m.unread ? 'text-[#4B5563] font-semibold' : 'text-[#6B7280]'}`}>{m.msg}</p>
                            </div>
                            {m.unread && <div className="w-2 h-2 rounded-full bg-[#2563EB]"></div>}
                          </div>
                        ))}
                      </div>
                      <div className="p-2 border-t border-[#F3F4F6] text-center">
                        <button onClick={() => { setActiveChat('Dr. Alan Grant'); setIsMsgOpen(false); }} className="text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer">Open Inbox</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative mr-2">
                  <select 
                    value={userRole} 
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setUserRole(newRole);
                      if (newRole === 'provider' && ['connectors', 'revenue'].includes(activeTab)) {
                        setActiveTab('dashboard');
                      } else if (newRole === 'biller' && ['intelligence', 'connectors', 'patient-flow', 'schedule'].includes(activeTab)) {
                        setActiveTab('dashboard');
                      } else if (newRole === 'frontdesk' && ['revenue', 'clinical-logs', 'intelligence', 'connectors'].includes(activeTab)) {
                        setActiveTab('dashboard');
                      }
                    }}
                    className="bg-[#F3F4F6] border border-[#E8EDF5] text-xs font-bold text-[#4B5563] rounded-[10px] px-2.5 py-1.5 outline-none cursor-pointer hover:bg-gray-100 hover:text-[#111827] transition-colors"
                  >
                    <option value="admin">System Admin</option>
                    <option value="clinic_admin">Clinic Admin</option>
                    <option value="provider">Dr. Sarah Jenkins</option>
                    <option value="biller">Billing Officer</option>
                    <option value="frontdesk">Front Desk Agent</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const newMode = !isDarkMode;
                    setIsDarkMode(newMode);
                    if (newMode) document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                  }}
                  className="hidden md:block hover:text-[#111827] transition-colors cursor-pointer"
                  title={isDarkMode ? "Disable Dark Mode" : "Enable Dark Mode"}
                >
                  {isDarkMode ? <Moon className="w-5 h-5 text-[#4F46E5]" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
              <div className="h-8 w-px bg-[#E8EDF5]"></div>

              <div className="relative">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsMsgOpen(false); }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-[#111827] group-hover:text-[#4F46E5] transition-colors">
                      {userRole === 'admin' && 'Admin User'}
                      {userRole === 'clinic_admin' && 'Clinic Admin'}
                      {userRole === 'provider' && 'Dr. Sarah Jenkins'}
                      {userRole === 'biller' && 'Billing Officer'}
                      {userRole === 'frontdesk' && 'Front Desk Agent'}
                    </p>
                    <p className="text-[11px] text-[#6B7280] font-medium">
                      {userRole === 'admin' && `System Admin • ${activePlan.toUpperCase()}`}
                      {userRole === 'provider' && 'Clinical Provider'}
                      {userRole === 'biller' && 'Revenue Operations'}
                      {userRole === 'frontdesk' && 'Patient intake Coordinator'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#6B7280] group-hover:text-[#111827] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-[#E8EDF5] rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-[#F3F4F6]">
                      <p className="text-sm font-bold text-[#111827]">Admin User</p>
                      <p className="text-xs font-medium text-[#6B7280]">admin@sbnsentinel.com</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">
                        <User className="w-4 h-4" /> Profile Details
                      </button>
                      <button
                        onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Account Settings
                      </button>
                    </div>
                    <div className="p-2 border-t border-[#F3F4F6]">
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          localStorage.removeItem('userRole');
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-[10px] transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
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
                    <p className="text-[#4F46E5] font-semibold text-sm mb-1">Good Morning, Admin! 👋</p>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#111827] mb-1">Multi-Provider Operations</h2>
                    <p className="text-sm text-[#6B7280] font-medium hidden md:block">Real-time overview of clinic operations across all doctors and intelligence engine outputs.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <div className="relative">
                      <div
                        onClick={() => { setIsNotifOpen(false); setIsMsgOpen(false); setIsProfileOpen(false); document.getElementById('providerDropdown')?.classList.toggle('hidden'); }}
                        className="flex items-center gap-3 bg-white border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 premium-shadow cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#4F46E5]" />
                        <div className="text-sm">
                          <span className="font-bold text-[#111827]" id="selectedProviderText">All Providers</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      </div>
                      <div id="providerDropdown" className="hidden absolute right-0 mt-3 w-56 bg-white border border-[#E8EDF5] rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 space-y-1">
                          <button onClick={(e) => { document.getElementById('selectedProviderText')!.innerText = 'All Providers'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">All Providers</button>
                          <button onClick={(e) => { document.getElementById('selectedProviderText')!.innerText = 'Dr. Smith (Cardio)'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">Dr. Smith (Cardio)</button>
                          <button onClick={(e) => { document.getElementById('selectedProviderText')!.innerText = 'Dr. Patel (General)'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">Dr. Patel (General)</button>
                          <button onClick={(e) => { document.getElementById('selectedProviderText')!.innerText = 'Dr. Chen (X-Ray)'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">Dr. Chen (X-Ray)</button>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => { document.getElementById('dateDropdown')?.classList.toggle('hidden'); }}
                        className="flex items-center gap-3 bg-white border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 premium-shadow hover:bg-[#F9FAFB] transition-colors active:scale-95 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-[#6B7280]" />
                        <div className="text-sm">
                          <span className="font-bold text-[#111827]" id="selectedDateText">Today</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      </button>
                      <div id="dateDropdown" className="hidden absolute right-0 mt-3 w-48 bg-white border border-[#E8EDF5] rounded-[16px] premium-shadow z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 space-y-1">
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Today'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">Today</button>
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Yesterday'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">Yesterday</button>
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Last 7 Days'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">Last 7 Days</button>
                          <button onClick={(e) => { document.getElementById('selectedDateText')!.innerText = 'Last 30 Days'; e.currentTarget.parentElement?.parentElement?.classList.add('hidden'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-[10px] transition-colors">Last 30 Days</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 premium-shadow">
                      <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Live System</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <SignalFeed setActiveTab={setActiveTab} />
                  <AIInsights />
                  <RevenueImpact setActiveTab={setActiveTab} />
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Patient Flow Donut */}
                  <div className="bg-white rounded-[24px] border border-[#E8EDF5] p-6 premium-shadow card-hover">
                    <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 mb-6">
                      <Users className="w-5 h-5 text-[#2563EB]" /> Patient Flow Overview
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F3F4F6" strokeWidth="4"></circle>
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="72 28" strokeDashoffset="0"></circle>
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#7C3AED" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-72"></circle>
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-90"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-extrabold text-[#111827]">{stats.patientFlow}</span>
                          <span className="text-[9px] text-[#6B7280] font-bold uppercase">Total Patients</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                          <span className="text-[#6B7280] font-medium">Checked In</span>
                          <span className="font-bold text-[#111827] ml-2">72% ({Math.round(stats.patientFlow * 0.72)})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></div>
                          <span className="text-[#6B7280] font-medium">In Consultation</span>
                          <span className="font-bold text-[#111827] ml-2">18% ({Math.round(stats.patientFlow * 0.18)})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                          <span className="text-[#6B7280] font-medium">Checked Out</span>
                          <span className="font-bold text-[#111827] ml-2">10% ({Math.round(stats.patientFlow * 0.10)})</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <button onClick={() => setActiveTab('patient-flow')} className="text-sm font-bold text-[#2563EB] flex items-center gap-1 hover:underline cursor-pointer">View Full Report <ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {/* Critical Alerts */}
                  <div className="bg-white rounded-[24px] border border-[#E8EDF5] p-6 premium-shadow card-hover">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
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
                                  <p className="text-sm font-bold text-[#111827]">{alert.type} Alert</p>
                                  <p className="text-xs text-[#6B7280] font-medium mt-0.5 line-clamp-1">{alert.message}</p>
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
                  <div className="bg-white rounded-[24px] border border-[#E8EDF5] p-6 premium-shadow card-hover">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#7C3AED]" /> Clinical Reminders
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
                        <div className="flex items-center gap-2 p-2 border border-dashed border-[#7C3AED]/40 rounded-[16px] bg-[#F5F3FF]/30 mb-3 animate-in slide-in-from-top-2">
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
                            className="flex-1 bg-white border border-[#E8EDF5] text-xs font-bold text-[#1F2937] rounded-[10px] px-3 py-1.5 outline-none focus:border-[#7C3AED]"
                            autoFocus
                          />
                          <button
                            onClick={handleAddReminder}
                            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-1.5 rounded-[8px] transition-colors cursor-pointer"
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
                                : 'bg-white border-[#E8EDF5] hover:border-[#7C3AED]/30 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                  rem.completed 
                                    ? 'bg-[#10B981] border-[#10B981] text-white shadow-[0_0_8px_#10B981]' 
                                    : 'border-[#D1D5DB] group-hover:border-[#7C3AED]'
                                }`}
                              >
                                {rem.completed && <Check className="w-3 h-3 text-white stroke-[3]" />}
                              </div>
                              <div>
                                <p className={`text-sm font-bold transition-all ${
                                  rem.completed 
                                    ? 'text-[#6B7280] line-through font-medium' 
                                    : 'text-[#111827] group-hover:text-[#7C3AED]'
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
              </div>
            )}
            {activeTab === 'connectors' && <ConnectorsView />}
            {activeTab === 'signals' && <SignalsDetailView />}
            {activeTab === 'intelligence' && <IntelligenceView />}
            {activeTab === 'patient-flow' && <PatientFlowMonitor />}
            {activeTab === 'schedule' && <ScheduleOptimizerView />}
            {activeTab === 'clinical-logs' && <ClinicalLogsView />}
            {activeTab === 'revenue' && <RevenueReportsView />}
            {activeTab === 'settings' && (
              <SettingsView 
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
          </div>
        </main>
      </div>

      {/* Interactive Secure Messenger Modal */}
      {activeChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8EDF5] rounded-[28px] w-full max-w-md premium-shadow overflow-hidden flex flex-col h-[500px] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E8EDF5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                  {activeChat.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">{activeChat}</h4>
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
                  <div className={`px-4 py-2.5 rounded-[18px] max-w-[85%] text-xs font-semibold leading-relaxed shadow-sm ${msg.isMe ? 'bg-[#2563EB] text-white rounded-tr-none' : 'bg-white text-[#111827] border border-[#E8EDF5] rounded-tl-none'}`}>
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
              className="p-4 border-t border-[#E8EDF5] bg-white flex gap-2 items-center"
            >
              <input 
                type="text" 
                placeholder="Type your secure message..." 
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 bg-slate-50 border border-[#E8EDF5] rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#2563EB] transition-colors"
              />
              <button 
                type="submit" 
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
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
    onClick={onClick}
    className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] transition-all duration-300 ${
      active 
        ? 'bg-[#EEF2FF] text-[#4F46E5] font-extrabold border border-[#C7D2FE]/50 shadow-[0_4px_12px_rgba(79,70,229,0.06)]' 
        : 'text-[#475569] font-bold hover:bg-[#F1F5F9] hover:text-[#0F172A]'
    } ${className}`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-[#4F46E5] to-[#7C3AED] rounded-r-full shadow-[0_0_8px_#4F46E5]"></div>
    )}
    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-[#4F46E5]' : 'text-[#94A3B8] group-hover:text-[#475569]'}`} />
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);
