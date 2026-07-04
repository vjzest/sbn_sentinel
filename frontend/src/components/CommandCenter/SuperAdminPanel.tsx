import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Activity, DollarSign, BrainCircuit, 
  Settings, Server, Search, CheckCircle2, XCircle, MoreVertical,
  LogOut, ShieldCheck, Mail, Calendar, Menu, X
} from 'lucide-react';

interface SuperAdminProps {
  onLogout: () => void;
  user: any;
}

export const SuperAdminPanel: React.FC<SuperAdminProps> = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', clinic_name: '', temp_password: '', plan: 'Pro' });
  const [inviteMsg, setInviteMsg] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch Super Admin Stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/super-admin/stats`);
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/super-admin/users`);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) {
          const u = await usersRes.json();
          setUsersList(u);
          // Group users by clinic for the clinics view
          const clinicMap = new Map();
          u.forEach((user: any) => {
            if (user.role !== 'super_admin') {
              if (!clinicMap.has(user.clinic)) {
                clinicMap.set(user.clinic, {
                  id: user.clinic,
                  name: user.clinic,
                  owner: user.full_name,
                  plan: 'Pro', // Defaulting for demo
                  status: user.is_active ? 'Active' : 'Suspended',
                  usersCount: 1,
                  patientsCount: Math.floor(Math.random() * 500) + 50 // Mocking patient count per clinic
                });
              } else {
                clinicMap.get(user.clinic).usersCount += 1;
              }
            }
          });
          setClinics(Array.from(clinicMap.values()));
        }
      } catch (e) {
        console.error("Failed to load admin data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Mock Super Admin Audit Logs
    setAuditLogs([
      { id: 1, action: 'CLINIC_REGISTERED', resource: 'City Heart Clinic', time: '10 mins ago', ip: '192.168.1.1' },
      { id: 2, action: 'SUBSCRIPTION_UPGRADED', resource: 'Apex Medical - Pro Plan', time: '1 hour ago', ip: '10.0.0.5' },
      { id: 3, action: 'MAINTENANCE_TOGGLED', resource: 'System Down', time: 'Yesterday', ip: '127.0.0.1' },
      { id: 4, action: 'USER_SUSPENDED', resource: 'Dr. John (City Heart)', time: '2 days ago', ip: '192.168.1.1' }
    ]);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/super-admin/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });
      if (res.ok) {
        setInviteMsg('✅ Clinic owner invited successfully!');
        const data = await res.json();
        // Optimistic update
        setClinics([...clinics, { name: inviteForm.clinic_name, owner: inviteForm.full_name, plan: inviteForm.plan, status: 'Active', usersCount: 1 }]);
        setTimeout(() => setIsInviteOpen(false), 2000);
      } else {
        setInviteMsg('❌ Error inviting user.');
      }
    } catch (e) {
      setInviteMsg('❌ Network error.');
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/super-admin/users/${userId}/toggle`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsersList(usersList.map(u => u.id === updatedUser.id ? { ...u, is_active: updatedUser.is_active } : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleClinicStatus = (clinicName: string) => {
    // In a real app, this would call a backend endpoint to toggle the tenant's global active flag
    setClinics(clinics.map(c => {
      if (c.name === clinicName) {
        const newStatus = c.status === 'Active' ? 'Suspended' : 'Active';
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0B1121] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F9FC] text-[#111827] font-sans overflow-hidden w-full absolute inset-0">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Admin Sidebar */}
      <aside className={`w-64 bg-[#111827] text-white flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 pb-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center font-black text-xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none">Super Admin</h1>
              <p className="text-[9px] text-[#4F46E5] tracking-[0.2em] uppercase font-black mt-1.5 flex items-center gap-1.5">
                SaaS Control <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span>
              </p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-4">Platform</p>
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <Activity className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setActiveTab('clinics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'clinics' ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <Building2 className="w-4 h-4" /> Clinics (Tenants)
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <Users className="w-4 h-4" /> Platform Users
          </button>
          <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <DollarSign className="w-4 h-4" /> Subscriptions & Revenue
          </button>

          <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-4 mt-8">System</p>
          <button onClick={() => setActiveTab('ai-usage')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'ai-usage' ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <BrainCircuit className="w-4 h-4" /> AI Costs & Usage
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <Server className="w-4 h-4" /> Infrastructure Settings
          </button>
          <button onClick={() => setActiveTab('audit-logs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'audit-logs' ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <ShieldCheck className="w-4 h-4" /> Platform Audit Logs
          </button>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white border-b border-[#E8EDF5] z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-500 hover:text-gray-900">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-extrabold text-[#111827] capitalize hidden sm:block">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#F3F4F6] px-3 py-1.5 rounded-lg border border-[#E8EDF5]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold text-[#4B5563]">Super Admin Mode</span>
            </div>
            <div className="flex items-center gap-3 ml-0 md:ml-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold text-xs shadow-md">
                SA
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">{user?.full_name || 'System Admin'}</p>
                <p className="text-[10px] text-[#6B7280] font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-8 relative z-0 custom-scrollbar">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E8EDF5] shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Clinics</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{stats.total_clinics}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#E8EDF5] shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Users</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{stats.active_users}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#E8EDF5] shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Platform Revenue MRR</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{stats.platform_revenue_formatted}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#E8EDF5] shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">AI Tokens Today</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{stats.ai_token_usage_today}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-[#E8EDF5] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 mb-6">Recent Clinic Activity</h3>
                  <div className="space-y-4">
                    {clinics.slice(0, 5).map((clinic, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                            {clinic.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{clinic.name}</p>
                            <p className="text-xs text-gray-500">{clinic.usersCount} users • {clinic.plan} Plan</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                  <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                    <Server className="w-5 h-5 text-indigo-400" /> System Health
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400 font-medium">Database Storage</span>
                        <span className="text-white font-bold">45%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400 font-medium">OpenAI API Quota</span>
                        <span className="text-white font-bold">12%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400 font-medium">Server CPU Usage</span>
                        <span className="text-white font-bold">28%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white border border-[#E8EDF5] rounded-2xl shadow-sm animate-in fade-in max-w-[1400px] mx-auto">
              <div className="p-6 border-b border-[#E8EDF5] flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">All Platform Users</h3>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <th className="p-4 border-b border-gray-200">User</th>
                      <th className="p-4 border-b border-gray-200">Clinic / Tenant</th>
                      <th className="p-4 border-b border-gray-200">Role</th>
                      <th className="p-4 border-b border-gray-200">Status</th>
                      <th className="p-4 border-b border-gray-200 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0">
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{u.full_name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">{u.clinic}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' :
                            u.role === 'clinic_admin' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.is_active ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                              <XCircle className="w-4 h-4" /> Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => toggleUserStatus(u.id)}
                            disabled={u.role === 'super_admin'}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Clinics Tab */}
          {activeTab === 'clinics' && (
             <div className="bg-white border border-[#E8EDF5] rounded-2xl shadow-sm animate-in fade-in max-w-[1400px] mx-auto">
             <div className="p-6 border-b border-[#E8EDF5] flex justify-between items-center">
               <div>
                 <h3 className="text-base font-bold text-gray-900">Registered Clinics (Tenants)</h3>
                 <p className="text-sm text-gray-500 mt-1">Manage isolated workspaces and subscriptions.</p>
               </div>
               <button onClick={() => setIsInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
                 + Add Clinic
               </button>
             </div>
             
             {clinics.length === 0 ? (
               <div className="p-12 text-center text-gray-500 font-medium">
                 <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                 <p>No clinics registered yet.</p>
                 <button onClick={() => setIsInviteOpen(true)} className="text-indigo-600 font-bold mt-2 hover:underline">Register your first clinic</button>
               </div>
             ) : (
               <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                     <th className="p-4 border-b border-gray-200">Clinic Name</th>
                     <th className="p-4 border-b border-gray-200">Owner</th>
                     <th className="p-4 border-b border-gray-200">Users</th>
                     <th className="p-4 border-b border-gray-200">Plan</th>
                     <th className="p-4 border-b border-gray-200">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {clinics.map((c, i) => (
                     <tr key={i} className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0 cursor-pointer">
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                              {c.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{c.name}</span>
                         </div>
                       </td>
                       <td className="p-4 text-sm font-medium text-gray-600">{c.owner}</td>
                       <td className="p-4 text-sm font-medium text-gray-600">{c.usersCount} Active</td>
                       <td className="p-4">
                         <button 
                           onClick={() => toggleClinicStatus(c.name)}
                           className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider transition-colors border ${
                             c.status === 'Active' 
                               ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                               : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                           }`}
                         >
                           {c.status}
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             )}
           </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="bg-white border border-[#E8EDF5] rounded-2xl shadow-sm animate-in fade-in max-w-[1400px] mx-auto p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">Subscription & Revenue Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white shadow-lg">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Stripe MRR</p>
                  <p className="text-3xl font-black">{stats?.platform_revenue_formatted || '$0.00'}</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-2xl">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Payouts</p>
                  <p className="text-3xl font-black text-gray-900">$1,240.00</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-2xl">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Failed Payments</p>
                  <p className="text-3xl font-black text-rose-500">0</p>
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Recent Invoices</h4>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-gray-900">INV-2026-00{i}</p>
                      <p className="text-xs text-gray-500">City Heart Clinic • Pro Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">$299.00</p>
                      <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 uppercase">Paid</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Usage Tab */}
          {activeTab === 'ai-usage' && (
            <div className="bg-white border border-[#E8EDF5] rounded-2xl shadow-sm animate-in fade-in max-w-[1400px] mx-auto p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">OpenAI & LLM Token Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 border border-indigo-100 bg-indigo-50/50 rounded-2xl">
                  <BrainCircuit className="w-8 h-8 text-indigo-600 mb-4" />
                  <p className="text-gray-600 text-sm font-bold mb-1">Total Tokens Used (MTD)</p>
                  <p className="text-4xl font-black text-indigo-900">42.8M</p>
                  <p className="text-xs text-indigo-600 font-medium mt-2">Est. Cost: $428.00</p>
                </div>
                <div className="p-6 border border-emerald-100 bg-emerald-50/50 rounded-2xl">
                  <Activity className="w-8 h-8 text-emerald-600 mb-4" />
                  <p className="text-gray-600 text-sm font-bold mb-1">System Efficiency</p>
                  <p className="text-4xl font-black text-emerald-900">98.4%</p>
                  <p className="text-xs text-emerald-600 font-medium mt-2">Cache Hit Ratio</p>
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Top Consumers</h4>
              <div className="space-y-3">
                {clinics.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                    <span className="text-sm font-bold text-gray-900">{c.name}</span>
                    <span className="text-sm font-medium text-gray-500">{(Math.random() * 5 + 1).toFixed(1)}M tokens</span>
                  </div>
                ))}
                {clinics.length === 0 && <p className="text-sm text-gray-500">No data available.</p>}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[#E8EDF5] rounded-2xl shadow-sm animate-in fade-in max-w-[1400px] mx-auto p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">Global Infrastructure Settings</h3>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Platform Name</label>
                  <input type="text" defaultValue="SBN Sentinel" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Master LLM API Key (OpenAI)</label>
                  <input type="password" defaultValue="sk-sentinel-abcdef1234567890" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Default LLM Engine</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50">
                    <option>GPT-4o (Default)</option>
                    <option>Claude 3.5 Sonnet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Maintenance Mode</label>
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${maintenanceMode ? 'bg-rose-500' : 'bg-gray-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${maintenanceMode ? 'left-[26px]' : 'left-0.5'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{maintenanceMode ? 'System Offline (Updates Active)' : 'Currently Live'}</span>
                  </div>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                  Save Global Settings
                </button>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && (
            <div className="bg-white border border-[#E8EDF5] rounded-2xl shadow-sm animate-in fade-in max-w-[1400px] mx-auto p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" /> Super Admin Audit Trail
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Resource Target</th>
                      <th className="p-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="p-4 text-xs font-bold text-gray-900">{log.time}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">{log.resource}</td>
                        <td className="p-4 text-xs text-gray-500 font-mono">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Invite Modal */}
        {isInviteOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Register New Clinic</h3>
              <p className="text-sm text-gray-500 mb-6">Create a new tenant workspace and invite the owner.</p>
              
              {inviteMsg && (
                <div className={`p-3 mb-4 rounded-xl text-sm font-bold ${inviteMsg.includes('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {inviteMsg}
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Name</label>
                  <input required type="text" value={inviteForm.clinic_name} onChange={e => setInviteForm({...inviteForm, clinic_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" placeholder="e.g. City Heart Clinic" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Owner Name</label>
                  <input required type="text" value={inviteForm.full_name} onChange={e => setInviteForm({...inviteForm, full_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" placeholder="Dr. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Owner Email</label>
                  <input required type="email" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" placeholder="doctor@clinic.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Temporary Password</label>
                  <input required type="text" value={inviteForm.temp_password} onChange={e => setInviteForm({...inviteForm, temp_password: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" placeholder="e.g. Clinic@2026" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subscription Plan</label>
                  <select value={inviteForm.plan} onChange={e => setInviteForm({...inviteForm, plan: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50">
                    <option value="Basic">Basic Plan</option>
                    <option value="Pro">Pro Plan (Most Popular)</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Create Tenant</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
