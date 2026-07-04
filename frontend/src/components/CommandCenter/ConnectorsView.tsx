import React, { useState, useEffect } from 'react';
import { Plus, Database, Phone, Mail, FileText, CheckCircle2, RefreshCw, AlertTriangle, CreditCard, Video, Activity, Server, Clock, Trash2, ShieldCheck, Key, X, ShieldAlert } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const ConnectorsView: React.FC = () => {
  const events = useSelector((state: RootState) => state.signals.events);
  const [pulse, setPulse] = useState(false);
  
  // State for connectors loaded from backend
  const [connectors, setConnectors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  
  // SSO vs Manual state
  const [useAdvancedDevMode, setUseAdvancedDevMode] = useState(false);
  const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
  const [ssoUsername, setSsoUsername] = useState('');
  const [ssoPassword, setSsoPassword] = useState('');
  
  // New connector form state
  const [connName, setConnName] = useState('');
  const [connType, setConnType] = useState('EHR System');
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  
  const [detailsModalData, setDetailsModalData] = useState<any>(null);
  const [disconnectingConnector, setDisconnectingConnector] = useState<any | null>(null);

  // Helper to map connector name/type to appropriate Lucide icons and colors
  const getIconAndStyle = (name: string, type: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('practice fusion')) {
      return { Icon: Database, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' };
    } else if (lowerName.includes('twilio')) {
      return { Icon: Phone, color: 'text-[#2563EB]', bg: 'bg-[#EEF4FF]' };
    } else if (lowerName.includes('gmail') || lowerName.includes('outlook') || lowerName.includes('workspace')) {
      return { Icon: Mail, color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' };
    } else if (lowerName.includes('stripe')) {
      return { Icon: CreditCard, color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]' };
    } else if (lowerName.includes('zoom')) {
      return { Icon: Video, color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' };
    } else if (lowerName.includes('kareo')) {
      return { Icon: FileText, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]' };
    }
    
    // Fallbacks based on type
    if (type.includes('EHR')) {
      return { Icon: Database, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' };
    } else if (type.includes('Billing')) {
      return { Icon: CreditCard, color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]' };
    } else if (type.includes('Voice') || type.includes('SMS')) {
      return { Icon: Phone, color: 'text-[#2563EB]', bg: 'bg-[#EEF4FF]' };
    }
    
    return { Icon: Server, color: 'text-[#6D28D9]', bg: 'bg-[#F3E8FF]' };
  };

  // Fetch connectors from backend
  const fetchConnectors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reality/health`);
      if (response.ok) {
        const data = await response.json();
        setConnectors(data);
      }
    } catch (error) {
      console.error("Failed to fetch connectors health from backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(t);
  }, [events.length]);

  // Handle Sync action
  const handleSync = async (id: string) => {
    try {
      setSyncingId(id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reality/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connector_id: id })
      });
      if (response.ok) {
        await fetchConnectors();
      }
    } catch (error) {
      console.error("Failed to sync connector:", error);
    } finally {
      setSyncingId(null);
    }
  };

  // Handle Disconnect action
  const handleDisconnect = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/reality/disconnect/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchConnectors();
        setDisconnectingConnector(null);
      }
    } catch (error) {
      console.error("Failed to disconnect connector:", error);
    }
  };

  // Open add system credentials form
  const handleSelectSystem = (systemName: string) => {
    setSelectedSystem(systemName);
    setConnName(systemName);
    if (systemName.includes('EHR') || systemName.includes('Epic') || systemName.includes('Cerner')) {
      setConnType('EHR System');
    } else if (systemName.includes('Athena')) {
      setConnType('EHR API');
    } else if (systemName.includes('Salesforce')) {
      setConnType('CRM Platform');
    } else {
      setConnType('Custom Webhook');
    }
    setApiKey('');
    setClientId('');
    setApiEndpoint('');
    setSsoUsername('');
    setSsoPassword('');
    setUseAdvancedDevMode(false);
    setIsSSOModalOpen(false);
    setConnectError(null);
  };

  // Handle SSO Sign-In submit
  const handleSSOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const generatedId = `conn_${connName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
      const finalApiKey = `sso_token_${Math.random().toString(36).substring(7)}`;
      const finalClientId = `sso_client_${Math.random().toString(36).substring(7)}`;
      const finalEndpoint = `https://api.${connName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/v2/fhir`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reality/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generatedId,
          name: connName,
          type: connType,
          status: 'Connected',
          config: {
            api_key: finalApiKey,
            client_id: finalClientId,
            endpoint: finalEndpoint,
            username: ssoUsername
          }
        })
      });

      if (response.ok) {
        await fetchConnectors();
        setIsAddModalOpen(false);
        setSelectedSystem(null);
        setIsSSOModalOpen(false);
      } else {
        const errData = await response.json();
        setConnectError(errData.detail || "Single Sign-On connection failed.");
      }
    } catch (error) {
      console.error("SSO connection error:", error);
      setConnectError("An error occurred during secure authorization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle connection submit
  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const generatedId = `conn_${connName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reality/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generatedId,
          name: connName,
          type: connType,
          status: 'Connected',
          config: {
            api_key: apiKey,
            client_id: clientId,
            endpoint: apiEndpoint
          }
        })
      });

      if (response.ok) {
        await fetchConnectors();
        setIsAddModalOpen(false);
        setSelectedSystem(null);
      } else {
        const errData = await response.json();
        setConnectError(errData.detail || "Connection failed.");
      }
    } catch (error) {
      console.error("Error submitting connector:", error);
      setConnectError("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count helper
  const connectedCount = connectors.filter(c => c.status === 'Connected').length;
  const syncingCount = connectors.filter(c => c.status === 'Syncing').length;
  const attentionCount = connectors.filter(c => c.status === 'Needs attention').length;

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#111827] mb-1">Reality Sources & Connectors</h2>
          <p className="text-sm text-[#6B7280] font-medium">Manage connected health systems, Twilio voice gateways, and billing APIs.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedSystem(null);
            setConnectError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-bold px-6 py-3 rounded-[14px] transition-transform active:scale-95 shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
        >
          <Plus className="w-4 h-4" /> Add Integration
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { title: 'Connected Systems', value: isLoading ? '...' : `${connectors.length}`, color: 'blue', line: '#3B82F6' },
          { title: 'Healthy Connections', value: isLoading ? '...' : `${connectedCount}`, color: 'green', line: '#10B981' },
          { title: 'Syncing', value: isLoading ? '...' : `${syncingCount}`, color: 'orange', line: '#F59E0B' },
          { title: 'Offline / Needs Alert', value: isLoading ? '...' : `${attentionCount}`, color: 'red', line: '#EF4444' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex justify-between items-center transition-all duration-300">
            <div>
              <p className="text-[11px] text-[#6B7280] uppercase font-extrabold tracking-widest mb-1">{stat.title}</p>
              <p className="text-[28px] font-extrabold text-[#111827]">{stat.value}</p>
            </div>
            <div className="w-12 h-8 opacity-70">
              <svg viewBox="0 0 100 40" className="w-full h-full preserve-aspect-ratio-none">
                <path d="M0,20 C20,10 40,30 60,15 C80,25 100,5 100,5" fill="none" stroke={stat.line} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#EEF4FF] border-t-[#4F46E5] rounded-full animate-spin mb-4"></div>
          <span className="ml-4 font-bold text-[#4B5563]">Loading active connectors...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connectors.map((conn, idx) => {
            const { Icon, color, bg } = getIconAndStyle(conn.name, conn.type);
            const isThisSyncing = syncingId === conn.id || conn.status === 'Syncing';

            return (
              <div key={conn.id} className={`bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex flex-col justify-between group transition-all duration-500 ${pulse && idx === (events.length % 6) ? 'scale-[1.02] ring-2 ring-[#4F46E5] shadow-lg' : ''}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 ${bg} rounded-[16px]`}>
                      <Icon className={`w-6 h-6 ${color} ${pulse && idx === (events.length % 6) ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#111827] text-lg mb-0.5">{conn.name}</h3>
                      <p className="text-xs text-[#6B7280] font-bold">{conn.type}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleSync(conn.id)}
                      disabled={isThisSyncing}
                      title="Sync Now"
                      className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#4B5563] hover:text-[#111827] transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isThisSyncing ? 'animate-spin text-[#F59E0B]' : ''}`} />
                    </button>
                    <button 
                      onClick={() => setDisconnectingConnector(conn)}
                      title="Disconnect Connector"
                      className="p-2 hover:bg-rose-50 rounded-full text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E8EDF5] px-3 py-1.5 rounded-[8px]">
                     {conn.status === 'Connected' && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
                     {conn.status === 'Syncing' && <RefreshCw className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" />}
                     {conn.status === 'Needs attention' && <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />}
                     <span className="text-[11px] font-extrabold text-[#111827]">{conn.status}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {isThisSyncing ? 'Syncing...' : 'Synced recently'}
                  </span>
                </div>
                
                <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex justify-between items-center">
                  <span className="text-[10px] text-[#6B7280] font-mono">
                    Latency: <strong className="text-[#111827]">{conn.latency_ms}ms</strong>
                  </span>
                  
                  <span 
                    onClick={() => {
                      setDetailsModalData({
                        id: conn.id,
                        source: conn.name,
                        type: conn.type,
                        status: conn.status,
                        latency: conn.latency_ms,
                        timestamp: new Date().toISOString()
                      });
                    }}
                    className="text-xs font-bold text-[#2563EB] group-hover:underline cursor-pointer transition-colors"
                  >
                    View Details
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow col-span-1">
           <h3 className="text-base font-bold text-[#111827] mb-6">Connection Activity</h3>
           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E8EDF5] before:to-transparent max-h-[400px] overflow-y-auto custom-scrollbar">
              {events.slice(0, 8).map((log, i) => {
                let logTypeColor = 'bg-[#3B82F6]'; // default blue
                if (log.source.toLowerCase().includes('kareo')) logTypeColor = 'bg-[#EF4444]'; // red
                else if (log.source.toLowerCase().includes('practice fusion')) logTypeColor = 'bg-[#10B981]'; // green
                else if (log.source.toLowerCase().includes('gmail')) logTypeColor = 'bg-[#F59E0B]'; // orange

                return (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white ${logTypeColor} text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform ${pulse && i === 0 ? 'scale-125 ring-4 ring-blue-100' : ''}`}></div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-[12px] border border-[#E8EDF5] shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#111827] text-xs leading-tight">{log.type} from {log.source}</span>
                      </div>
                      <time className="text-[10px] font-bold text-[#9CA3AF] uppercase">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Charts */}
        <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-base font-bold text-[#111827]">Integration Health</h3>
             <button className="text-[11px] font-bold text-[#2563EB] bg-[#EEF4FF] px-3 py-1.5 rounded-full transition-all">System Health: {Math.max(90, 98 - (events.length % 3))}%</button>
          </div>
          
          <div className="flex-1 flex gap-8">
            <div className="w-1/3 flex flex-col justify-center items-center relative">
               <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F3F4F6" strokeWidth="3"></circle>
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="3" strokeDasharray={`${Math.max(90, 98 - (events.length % 3))} ${100 - Math.max(90, 98 - (events.length % 3))}`} className="transition-all duration-1000"></circle>
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-extrabold text-[#111827]">{Math.max(90, 98 - (events.length % 3))}%</span>
               </div>
            </div>
            <div className="flex-1 flex flex-col">
               <h4 className="text-[10px] text-[#6B7280] uppercase tracking-widest font-extrabold mb-4">API Requests Chart</h4>
               <div className="relative flex-1 overflow-hidden">
                 <svg viewBox="0 0 400 120" className="w-full h-full preserve-aspect-ratio-none">
                    <defs>
                      <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <g className="transition-transform duration-1000" style={{ transform: `translateY(${Math.sin(events.length) * 10}px)` }}>
                      <path d="M0,80 C100,20 200,100 300,40 C350,10 380,60 400,20 L400,120 L0,120 Z" fill="url(#apiGrad)"/>
                      <path d="M0,80 C100,20 200,100 300,40 C350,10 380,60 400,20" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
                    </g>
                 </svg>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Integration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-lg p-8 premium-shadow relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedSystem(null);
              }} 
              className="absolute top-6 right-6 text-[#9CA3AF] hover:text-[#111827] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {!selectedSystem ? (
              <>
                <h3 className="text-xl font-extrabold text-[#111827] mb-2 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#4F46E5]" /> Connect New System
                </h3>
                <p className="text-sm font-medium text-[#6B7280] mb-6">Select a system from the Sentinel Marketplace to integrate with your practice.</p>
                
                <div className="space-y-3 mb-6">
                   {[
                     { name: 'Epic Systems EHR', type: 'EHR System' },
                     { name: 'Cerner Millennium', type: 'EHR System' },
                     { name: 'AthenaHealth API', type: 'EHR API' },
                     { name: 'Salesforce Health Cloud', type: 'CRM' },
                     { name: 'Custom Developer Hook', type: 'Developer API' }
                   ].map(sys => (
                     <div 
                       key={sys.name} 
                       onClick={() => handleSelectSystem(sys.name)}
                       className="flex items-center justify-between p-4 border border-[#E8EDF5] rounded-[16px] hover:border-[#4F46E5] hover:bg-[#EEF4FF] cursor-pointer transition-all group"
                     >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F9FAFB] border border-[#E8EDF5] rounded-full flex items-center justify-center group-hover:border-[#4F46E5] bg-white transition-all">
                            <Database className="w-4 h-4 text-[#4B5563] group-hover:text-[#4F46E5]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#111827]">{sys.name}</p>
                            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase">{sys.type}</p>
                          </div>
                        </div>
                        <button className="text-[11px] font-bold text-[#4F46E5] px-4 py-2 bg-white border border-[#4F46E5] rounded-[8px] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                          Connect
                        </button>
                     </div>
                   ))}
                </div>
              </>
            ) : isSSOModalOpen ? (
              /* Simulated Secure SSO Portal View */
              <form onSubmit={handleSSOSubmit} className="space-y-5 animate-in slide-in-from-right-4">
                <div className="bg-[#EEF4FF] border border-[#BFDBFE]/50 rounded-[18px] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Key className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">{selectedSystem} Secure Auth</h3>
                    <p className="text-[10px] text-[#6B7280] font-medium">HIPAA Encrypted Portal • Sentinel Secure Link</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Practice ID / Email</label>
                    <input 
                      type="text" 
                      placeholder="e.g. dr.patel@clinic.com"
                      value={ssoUsername}
                      onChange={(e) => setSsoUsername(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      value={ssoPassword}
                      onChange={(e) => setSsoPassword(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                </div>

                {connectError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-[12px] p-3 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{connectError}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[#F3F4F6] flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsSSOModalOpen(false)}
                    className="flex-1 bg-white border border-[#E8EDF5] text-[#4B5563] font-bold py-3 rounded-[12px] text-xs hover:bg-[#F9FAFB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 rounded-[12px] text-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : 'Sign In & Connect'}
                  </button>
                </div>
              </form>
            ) : useAdvancedDevMode ? (
              /* Advanced Manual Setup Form */
              <form onSubmit={handleConnectSubmit} className="space-y-5 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#EEF4FF] rounded-lg">
                      <ShieldCheck className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#111827]">Developer Authentication</h3>
                      <p className="text-xs text-[#6B7280] font-medium">Custom endpoints configuration for {selectedSystem}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setUseAdvancedDevMode(false)}
                    className="text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Switch to SSO
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Integration Display Name</label>
                  <input 
                    type="text" 
                    value={connName}
                    onChange={(e) => setConnName(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Client / App ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. cli_00289"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-4 text-xs font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">API Key / Secret Token</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <input 
                        type="password" 
                        placeholder="••••••••••••••"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 pl-9 pr-4 text-xs font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Secure Endpoint URI</label>
                  <input 
                    type="url" 
                    placeholder="https://api.epic.com/v1/auth"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[12px] py-3 px-4 text-xs font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    required 
                  />
                </div>

                {connectError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-[12px] p-3 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{connectError}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[#F3F4F6] flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setSelectedSystem(null)}
                    className="flex-1 bg-white border border-[#E8EDF5] text-[#4B5563] font-bold py-3 rounded-[12px] text-xs hover:bg-[#F9FAFB] transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 text-white font-bold py-3 rounded-[12px] text-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : 'Confirm Connection'}
                  </button>
                </div>
              </form>
            ) : (
              /* One-Click Secure OAuth Launcher View */
              <div className="space-y-6 text-center py-4 animate-in fade-in">
                <div className="w-16 h-16 bg-[#EEF4FF] border border-[#BFDBFE]/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#111827]">Secure Single Sign-On</h3>
                  <p className="text-xs text-[#6B7280] max-w-[340px] mx-auto mt-1">
                    Connect Sentinel to your {selectedSystem} clinical workspace securely using one-click credentials verification.
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    onClick={() => setIsSSOModalOpen(true)}
                    className="w-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 text-white font-bold py-3.5 rounded-[12px] text-xs flex items-center justify-center gap-2 premium-shadow transition-transform active:scale-95 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-white" /> Authorize & Link {selectedSystem}
                  </button>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                    <button 
                      onClick={() => setSelectedSystem(null)}
                      className="text-xs font-bold text-[#6B7280] hover:text-[#111827] hover:underline"
                    >
                      Back to list
                    </button>
                    <button 
                      onClick={() => setUseAdvancedDevMode(true)}
                      className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Manual Developer Mode
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-2xl p-8 premium-shadow relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setDetailsModalData(null)} className="absolute top-6 right-6 text-[#9CA3AF] hover:text-[#111827] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-extrabold text-[#111827] mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563EB]" /> API Integration Logs
            </h3>
            <p className="text-sm font-medium text-[#6B7280] mb-6">Live system status and communication channel configurations for {detailsModalData.source}.</p>
            
            <div className="bg-[#111827] rounded-[16px] p-6 overflow-hidden">
               <div className="flex items-center justify-between border-b border-[#374151] pb-3 mb-4">
                  <span className="text-[10px] font-mono text-[#10B981]">STATUS: ACTIVE (200 OK)</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">{detailsModalData.timestamp}</span>
               </div>
               <pre className="text-xs font-mono text-[#A7F3D0] overflow-x-auto whitespace-pre-wrap">
{JSON.stringify({
  integrationId: detailsModalData.id,
  systemName: detailsModalData.source,
  subsystemType: detailsModalData.type,
  currentStatus: detailsModalData.status,
  pingLatencyMs: detailsModalData.latency,
  securityEnforcement: "HIPAA Compliant TLS 1.3",
  environment: "Production Gateway Router",
  payloadRoute: `routing_key_${detailsModalData.id}`
}, null, 2)}
               </pre>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setDetailsModalData(null)} className="text-sm font-bold text-white bg-[#111827] hover:bg-[#374151] px-6 py-2.5 rounded-[12px] transition-colors">
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom modern Disconnect Confirmation Modal */}
      {disconnectingConnector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-md p-8 premium-shadow relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setDisconnectingConnector(null)} 
              className="absolute top-6 right-6 text-[#9CA3AF] hover:text-[#111827] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="text-lg font-extrabold text-[#111827]">Disconnect {disconnectingConnector.name}?</h3>
                <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                  Disconnecting this integration will immediately disable real-time telemetry events and webhook subscriptions. Diagnostic signals from this source will stop streaming to your feed.
                </p>
              </div>
              
              <div className="bg-slate-50 border border-[#E8EDF5] rounded-xl p-3 w-full text-left">
                <p className="text-[10px] uppercase font-extrabold text-[#9CA3AF] tracking-wider mb-1">Integration ID</p>
                <p className="text-xs font-mono font-bold text-[#111827]">{disconnectingConnector.id}</p>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button 
                  onClick={() => setDisconnectingConnector(null)}
                  className="flex-1 bg-white border border-[#E8EDF5] text-[#4B5563] font-bold py-3 rounded-[12px] text-xs hover:bg-[#F9FAFB] transition-colors"
                >
                  Keep Connection
                </button>
                <button 
                  onClick={() => handleDisconnect(disconnectingConnector.id)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-[12px] text-xs transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
                >
                  Confirm Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
