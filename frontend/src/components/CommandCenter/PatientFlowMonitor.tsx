import React, { useState } from 'react';
import { 
  Users, UserCheck, Clock, AlertCircle, Phone, CreditCard, 
  ArrowRight, PhoneCall, HeartPulse, Stethoscope, 
  TestTube2, Activity, ArrowUpRight, ArrowDownRight, MoreVertical, Check
} from 'lucide-react';

export const PatientFlowMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const kpis = [
    { title: 'Checked In', value: '42', trend: '+12%', isUp: true, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'In Consultation', value: '18', trend: 'Stable', isUp: true, icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Avg Wait Time', value: '14 min', trend: '-2 min', isUp: true, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Delayed', value: '3', trend: '+1', isUp: false, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' }
  ];

  const stages = [
    { name: 'Check In', count: 12, active: true },
    { name: 'Waiting', count: 8, active: true },
    { name: 'Consultation', count: 18, active: true },
    { name: 'Lab / X-Ray', count: 5, active: false },
    { name: 'Billing', count: 4, active: false },
    { name: 'Completed', count: 142, active: false },
  ];

  const queue = [
    { id: 'PT-1024', name: 'Sarah Jenkins', provider: 'Dr. Smith', dept: 'Cardiology', wait: '12 min', status: 'Waiting' },
    { id: 'PT-1025', name: 'Michael Chen', provider: 'Dr. Lee', dept: 'General', wait: '28 min', status: 'Delayed' },
    { id: 'PT-1026', name: 'Emma Watson', provider: 'Dr. Verma', dept: 'Pediatrics', wait: '5 min', status: 'In Room' },
    { id: 'PT-1027', name: 'James Wilson', provider: 'Dr. Smith', dept: 'Cardiology', wait: '0 min', status: 'Consultation' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Waiting': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Delayed': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'In Room': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Consultation': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F7F8FC] p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Patient Flow Monitor</h1>
          <p className="text-gray-500 mt-1">Real-time patient journey monitoring across clinic locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full premium-shadow border border-gray-100 text-sm font-medium text-emerald-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live System Active
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] premium-shadow border border-white/50 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${kpi.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpi.trend}
                {kpi.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{kpi.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Journey & Queue */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Journey Tracker */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[24px] premium-shadow border border-white/50">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Live Patient Journey</h2>
            
            <div className="relative flex justify-between items-center w-full">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[60%] h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full z-0"></div>
              
              {stages.map((stage, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300
                    ${stage.active ? 'bg-white border-2 border-blue-500 text-blue-600 scale-110' : 'bg-gray-50 border-2 border-gray-200 text-gray-400'}`}>
                    {i + 1}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${stage.active ? 'text-gray-900' : 'text-gray-400'}`}>{stage.name}</p>
                    <p className="text-xs text-gray-500">{stage.count} patients</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting Queue Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] premium-shadow border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
              <h2 className="text-lg font-bold text-gray-900">Waiting Queue</h2>
              <div className="flex gap-2">
                {['All', 'Urgent', 'Delayed'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4 pl-6">Patient</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Wait Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {queue.map((pt, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shadow-inner">
                            {pt.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{pt.name}</p>
                            <p className="text-xs text-gray-500">{pt.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-700">{pt.provider}</p>
                        <p className="text-xs text-gray-500">{pt.dept}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Clock className={`w-4 h-4 ${pt.wait.includes('28') ? 'text-rose-500' : 'text-gray-400'}`} />
                          {pt.wait}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(pt.status)}`}>
                          {pt.status}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" title="Call Patient">
                            <PhoneCall className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" title="View Chart">
                            <Activity className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Heat Map & Alerts */}
        <div className="space-y-8">
          
          {/* Clinic Heat Map */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] premium-shadow border border-white/50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Clinic Heat Map
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Room 1', status: 'Occupied', color: 'bg-rose-50 border-rose-200 text-rose-700', icon: UserCheck },
                { name: 'Room 2', status: 'Available', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: Check },
                { name: 'Room 3', status: 'Cleaning', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: AlertCircle },
                { name: 'Lab', status: 'Busy', color: 'bg-rose-50 border-rose-200 text-rose-700', icon: TestTube2 },
                { name: 'Billing', status: 'Available', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CreditCard },
                { name: 'Triage', status: 'Occupied', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: HeartPulse },
              ].map((room, i) => (
                <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-3 transition-transform hover:scale-105 cursor-pointer ${room.color}`}>
                  <div className="flex justify-between items-start">
                    <room.icon className="w-5 h-5 opacity-70" />
                    <span className="w-2 h-2 rounded-full bg-current opacity-50 animate-pulse"></span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{room.name}</p>
                    <p className="text-xs font-medium opacity-80">{room.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] premium-shadow border border-white/50">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
              Recent Alerts
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Wait Time Exceeded</p>
                  <p className="text-xs text-gray-500 mt-0.5">Michael Chen has been waiting for &gt;25 mins.</p>
                  <p className="text-xs font-semibold text-rose-500 mt-1">2 mins ago</p>
                </div>
              </div>
              <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <TestTube2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Lab Results Ready</p>
                  <p className="text-xs text-gray-500 mt-0.5">CBC results uploaded for Sarah Jenkins.</p>
                  <p className="text-xs font-semibold text-blue-500 mt-1">14 mins ago</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
};
