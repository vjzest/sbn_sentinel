import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Sidebar Container
old_aside = '''        <aside className={w-[260px] glass-panel bg-white/80 border border-[#E8EDF5] rounded-[24px] premium-shadow flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out text-slate-700 shrink-0 }>
          <div className="p-5 border-b border-[#E2E8F0] relative overflow-hidden group flex justify-between items-center shrink-0">
            {/* Subtle premium gradient indicator at the top border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#2E1055] to-transparent"></div>
            <div className="flex items-center gap-3 relative z-10 w-full">
              <div className="w-10 h-10 rounded-[12px] bg-white border border-[#E8EDF5] flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.15)] group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0">
                <img src="/logo.png" alt="SBN Sentinel Logo" className="w-full h-full object-cover p-1" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-black tracking-tight text-[#0F172A] leading-none truncate" title="SBN Sentinel">SBN Sentinel</h1>
                <p className="text-[9px] text-[#2E1055] tracking-[0.2em] uppercase font-black mt-1.5 flex items-center gap-1.5 truncate">
                  Command Center <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981] shrink-0"></span>
                </p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6 bg-[#F8FAFC]/50">'''

new_aside = '''        <aside className={w-[260px] bg-gradient-to-br from-[#2E1055] to-[#120524] shadow-[0_20px_60px_rgba(46,16,85,0.3)] rounded-[24px] flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out text-white shrink-0 }>
          <div className="p-5 border-b border-white/10 relative overflow-hidden group flex justify-between items-center shrink-0">
            {/* Subtle premium gradient indicator at the top border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex items-center gap-3 relative z-10 w-full">
              <div className="w-10 h-10 rounded-[12px] bg-white/10 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0">
                <div className="text-white font-extrabold text-xl">S</div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-black tracking-tight text-white leading-none truncate" title="SBN Sentinel">SBN Sentinel</h1>
                <p className="text-[9px] text-white/70 tracking-[0.2em] uppercase font-black mt-1.5 flex items-center gap-1.5 truncate">
                  Command Center <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981] shrink-0"></span>
                </p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6 bg-transparent">'''

code = code.replace(old_aside, new_aside)

# 2. Section Headers in sidebar
code = code.replace('text-[#94A3B8] uppercase tracking-[0.2em] mb-2 px-3', 'text-white/40 uppercase tracking-[0.2em] mb-2 px-3')

# 3. Disconnect button
old_disconnect = "className=\"mt-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-100\""
new_disconnect = "className=\"mt-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20\""
code = code.replace(old_disconnect, new_disconnect)

# 4. SidebarItem component
old_sidebaritem = '''const SidebarItem = ({ icon: Icon, label, active, onClick, className = '' }: { icon: any, label: string, active: boolean, onClick: () => void, className?: string }) => (
  <button
    onClick={onClick}
    className={group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] transition-all duration-300  }
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-[#2E1055] to-[#120524] rounded-r-full shadow-[0_0_8px_#2E1055]"></div>
    )}
    <Icon className={w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 } />
    <span className="text-[13px] tracking-wide">{label}</span>
  </button>
);'''

new_sidebaritem = '''const SidebarItem = ({ icon: Icon, label, active, onClick, className = '' }: { icon: any, label: string, active: boolean, onClick: () => void, className?: string }) => (
  <button
    onClick={onClick}
    className={group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] transition-all duration-300  }
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#8B3DFF] rounded-r-full shadow-[0_0_8px_rgba(139,61,255,0.5)]"></div>
    )}
    <Icon className={w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 } />
    <span className="text-[13px] tracking-wide">{label}</span>
  </button>
);'''

code = code.replace(old_sidebaritem, new_sidebaritem)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
