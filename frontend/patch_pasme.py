import os

filepath = r"c:\Users\User\Desktop\New folder\sbnSentinal\sbn-sentinel\frontend\src\components\CommandCenter\SuperAdminPanel.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacement 1: State
state_target = """  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);"""
state_replace = """  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [pasmeHealth, setPasmeHealth] = useState<any>(null);
  const [pasmeRules, setPasmeRules] = useState<any[]>([]);"""

if state_target in content:
    content = content.replace(state_target, state_replace)
    print("Replaced State")
else:
    print("State target not found!")

# Replacement 2: Fetch
fetch_target = """        const auditRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/super-admin/audit-logs`);
        
        if (approvalsRes.ok) {
            setPendingApprovals(await approvalsRes.json());
        }
        if (auditRes.ok) {
            setAuditLogs(await auditRes.json());
        }"""
fetch_replace = """        const auditRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/super-admin/audit-logs`);
        const pasmeHealthRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/pasme/health`);
        const pasmeRulesRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/pasme/rules`);
        
        if (approvalsRes.ok) {
            setPendingApprovals(await approvalsRes.json());
        }
        if (auditRes.ok) {
            setAuditLogs(await auditRes.json());
        }
        if (pasmeHealthRes.ok) {
            const h = await pasmeHealthRes.json();
            setPasmeHealth(h);
            setMaintenanceMode(h.maintenance_mode);
        }
        if (pasmeRulesRes.ok) {
            setPasmeRules(await pasmeRulesRes.json());
        }"""

if fetch_target in content:
    content = content.replace(fetch_target, fetch_replace)
    print("Replaced Fetch")
else:
    print("Fetch target not found!")

# Replacement 3: Functions
func_target = """  const toggleClinicStatus = (clinicName: string) => {
    // In a real app, this would call a backend endpoint to toggle the tenant's global active flag
    setClinics(clinics.map(c => {
      if (c.name === clinicName) {
        const newStatus = c.status === 'Active' ? 'Suspended' : 'Active';
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };"""
func_replace = """  const toggleClinicStatus = (clinicName: string) => {
    // In a real app, this would call a backend endpoint to toggle the tenant's global active flag
    setClinics(clinics.map(c => {
      if (c.name === clinicName) {
        const newStatus = c.status === 'Active' ? 'Suspended' : 'Active';
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const togglePasmeRule = async (ruleId: string) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/pasme/rules/${ruleId}/toggle`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        setPasmeRules(pasmeRules.map(r => r.rule_id === updated.rule_id ? { ...r, is_active: updated.is_active } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePasmeMaintenance = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/pasme/maintenance/toggle`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        setMaintenanceMode(updated.maintenance_mode);
        if (pasmeHealth) {
            setPasmeHealth({ ...pasmeHealth, maintenance_mode: updated.maintenance_mode, status: updated.maintenance_mode ? 'maintenance' : 'healthy' });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };"""

if func_target in content:
    content = content.replace(func_target, func_replace)
    print("Replaced Functions")
else:
    print("Functions target not found!")

# Replacement 4: UI
ui_target = """                <div>
                  <label className="block text-sm font-bold text-white mb-2">Maintenance Mode</label>
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${maintenanceMode ? 'bg-rose-500' : 'bg-white/20'}`}
                    >
                      <div className={`w-5 h-5 bg-white/5 rounded-full absolute top-0.5 shadow-sm transition-all ${maintenanceMode ? 'left-[26px]' : 'left-0.5'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-white">{maintenanceMode ? 'System Offline (Updates Active)' : 'Currently Live'}</span>
                  </div>
                </div>
                <button className="bg-[#2E1055] text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-[#120524] transition-colors">
                  Save Global Settings
                </button>"""
ui_replace = """                <div>
                  <label className="block text-sm font-bold text-white mb-2">Maintenance Mode</label>
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={togglePasmeMaintenance}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${maintenanceMode ? 'bg-rose-500' : 'bg-[#2E1055]'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${maintenanceMode ? 'left-[26px]' : 'left-0.5'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-white">{maintenanceMode ? 'System Offline (Updates Active)' : 'Currently Live'}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Stops background processing across the platform.</p>
                </div>
                
                <div className="pt-6 border-t border-white/10 mt-6">
                  <h4 className="text-sm font-bold text-white mb-4">Business Rules Engine (PASME Config)</h4>
                  <div className="space-y-3">
                    {pasmeRules.map(rule => (
                      <div key={rule.rule_id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div>
                          <p className="text-sm font-bold text-white">{rule.name} <span className="text-xs text-white/40 ml-2 font-mono">{rule.rule_id}</span></p>
                          <p className="text-xs text-white/60">{rule.description}</p>
                        </div>
                        <button 
                          onClick={() => togglePasmeRule(rule.rule_id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${rule.is_active ? 'bg-[#2E1055] text-white' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                        >
                          {rule.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6">
                  <h4 className="text-sm font-bold text-white mb-4">Platform Health Monitor</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-[10px] text-white/50 uppercase font-black mb-1">CPU Usage</p>
                      <p className="text-lg font-bold text-white">{pasmeHealth?.metrics?.cpu_percent || 0}%</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-[10px] text-white/50 uppercase font-black mb-1">Memory</p>
                      <p className="text-lg font-bold text-white">{pasmeHealth?.metrics?.memory_usage_mb || 0} MB</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-[10px] text-white/50 uppercase font-black mb-1">DMAE Status</p>
                      <p className="text-sm font-bold text-emerald-400 capitalize">{pasmeHealth?.modules?.dmae || 'unknown'}</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-[10px] text-white/50 uppercase font-black mb-1">SIAME Status</p>
                      <p className="text-sm font-bold text-emerald-400 capitalize">{pasmeHealth?.modules?.siame || 'unknown'}</p>
                    </div>
                  </div>
                </div>"""
if ui_target in content:
    content = content.replace(ui_target, ui_replace)
    print("Replaced UI")
else:
    print("UI target not found!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
