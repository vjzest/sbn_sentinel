import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, ShieldAlert } from 'lucide-react';

interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  resource: string;
  ip_address: string;
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#2563EB]" />
            Audit Logs
          </h2>
          <p className="text-[#9CA3AF] mt-2 font-medium">Review and monitor system activity across the platform.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[24px] overflow-hidden backdrop-blur-md p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search logs by user, action, or resource..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-[12px] py-2.5 pl-11 pr-4 text-sm font-medium text-white outline-none focus:border-[#2E1055] transition-colors"
            />
          </div>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-[12px] text-sm font-bold transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Timestamp</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Action</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">Resource</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-white/50">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-sm text-white/70 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-white">{log.user_email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-white/70">
                      {log.resource}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-white/50">
                      {log.ip_address}
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
