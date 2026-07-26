import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, ShieldAlert } from 'lucide-react';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

interface AuditLog {
  id: string;
  user_system?: string;
  user_email?: string;
  action?: string;
  module?: string;
  resource?: string;
  correlation_id?: string;
  ip_address?: string;
  timestamp: string;
}

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? [...data].reverse() : []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAudit = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HIPAA_Audit_Trail_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.dispatchEvent(new CustomEvent('show-sentinel-toast', { detail: { message: '📥 HIPAA Audit Trail exported to JSON file successfully!', type: 'info' } }));
  };

  const filteredLogs = logs.filter(log => {
    const userStr = log.user_system || log.user_email || '';
    const actionStr = log.action || '';
    const moduleStr = log.module || log.resource || '';
    const term = searchTerm.toLowerCase();
    return (
      userStr.toLowerCase().includes(term) ||
      actionStr.toLowerCase().includes(term) ||
      moduleStr.toLowerCase().includes(term)
    );
  });

  const getActionBadge = (action?: string) => {
    if (!action) return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/10 text-white/70 border border-white/10">SYSTEM</span>;
    const actUpper = action.toUpperCase();
    if (actUpper.includes('SECURITY') || actUpper.includes('FAILED')) {
      return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">{action}</span>;
    }
    if (actUpper.includes('LOGIN') || actUpper.includes('SUCCESS')) {
      return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{action}</span>;
    }
    return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">{action}</span>;
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-400" />
            Audit Logs & HIPAA Compliance
          </h2>
          <p className="text-white/70 mt-1.5 text-sm font-medium">Immutable, tamper-proof activity logs tracking platform operations, security events, and user logins.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAudit}
            className="flex items-center gap-2 bg-[#2E1055] hover:bg-[#120524] border border-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow transition-all hover:scale-105 active:scale-95"
          >
            Export HIPAA Audit
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] overflow-hidden p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search logs by user, action, or module..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[12px] py-2.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/40 outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="bg-white/5 border border-white/10 text-white/80 px-4 py-2.5 rounded-[12px] text-xs font-bold flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" /> Total Logs: <span className="text-white font-extrabold">{logs.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Timestamp</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">User / System</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Action Event</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Module</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-white/50">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-xs text-white/70 whitespace-nowrap font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-white">{log.user_system || log.user_email || 'System'}</p>
                    </td>
                    <td className="py-4 px-6">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-white/80">
                      {log.module || log.resource || 'System Core'}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-blue-400/80">
                      {log.correlation_id || log.ip_address || 'sys-local'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <ShieldAlert className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/50">No audit logs found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
