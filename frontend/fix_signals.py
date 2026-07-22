import sys

with open('src/components/CommandCenter/SignalsDetailView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Header Area
code = code.replace('text-[#111827] mb-1', 'text-white mb-1')
code = code.replace('text-[#6B7280] font-medium', 'text-white/70 font-medium')
code = code.replace(
    'bg-white border border-[#E8EDF5] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow hover:bg-[#F7F9FC]',
    'bg-white/10 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] hover:bg-white/20'
)

# 2. Metrics Cards
code = code.replace(
    'className="bg-white border border-[#E8EDF5] p-6 rounded-[24px] premium-shadow flex items-center justify-between"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 p-6 rounded-[24px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex items-center justify-between text-white"'
)
code = code.replace('text-[#6B7280] uppercase', 'text-white/70 uppercase')
code = code.replace('text-2xl font-black text-[#111827]', 'text-2xl font-black text-white')
# Adjust icon backgrounds slightly for dark theme
code = code.replace('bg-[#EEF4FF] text-[#2563EB]', 'bg-[#3B82F6]/20 text-[#60A5FA]')
code = code.replace('bg-[#FEF3C7] text-[#F59E0B]', 'bg-[#F59E0B]/20 text-[#FBBF24]')
code = code.replace('bg-[#DBEAFE] text-[#3B82F6]', 'bg-[#3B82F6]/20 text-[#60A5FA]')
code = code.replace('bg-[#FEE2E2] text-[#EF4444]', 'bg-[#EF4444]/20 text-[#F87171]')

# 3. Main Signals Feed Table
code = code.replace(
    'className="lg:col-span-2 bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow"',
    'className="lg:col-span-2 bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white"'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[14px] px-3.5 py-2 premium-shadow w-72',
    'bg-white/5 border border-white/10 rounded-[14px] px-3.5 py-2 w-72'
)
code = code.replace('text-xs text-[#111827] w-full', 'text-xs text-white w-full')
code = code.replace('bg-[#2E1055] text-white border-transparent shadow-sm', 'bg-white/20 text-white border-white/40 shadow-md')
code = code.replace('bg-white text-[#6B7280] border-[#E8EDF5] hover:bg-[#F7F9FC]', 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10')
code = code.replace('border-b border-[#E8EDF5] text-[11px] uppercase text-[#6B7280]', 'border-b border-white/10 text-[11px] uppercase text-white/70')

code = code.replace('text-sm font-semibold text-[#111827]', 'text-sm font-semibold text-white')
code = code.replace('text-[#9CA3AF] font-medium', 'text-white/50 font-medium')
code = code.replace('border-b border-[#F3F4F6] hover:bg-[#F7F9FC]', 'border-b border-white/10 hover:bg-white/5')
code = code.replace("bg-[#EEF4FF]/50 border-l-4 border-l-[#2E1055]", "bg-white/10 border-l-4 border-l-[#A78BFA]")
code = code.replace('text-xs text-[#6B7280] font-bold mt-0.5', 'text-xs text-white/70 font-bold mt-0.5')
code = code.replace('text-sm font-bold text-[#111827] line-clamp-2', 'text-sm font-bold text-white line-clamp-2')
code = code.replace('text-[#9CA3AF] uppercase', 'text-white/50 uppercase')

code = code.replace('bg-red-50 text-red-600 border border-red-200', 'bg-red-500/20 text-red-400 border border-red-500/30')
code = code.replace('bg-emerald-50 text-emerald-600 border border-emerald-200', 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
code = code.replace('text-[#2E1055] bg-[#EEF4FF] hover:bg-[#DBEAFE]', 'text-white bg-white/10 hover:bg-white/20')

# 4. Side Panels
code = code.replace(
    'className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white"'
)
code = code.replace(
    'className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow flex-1"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex-1 text-white"'
)
code = code.replace('text-base font-extrabold text-[#111827]', 'text-base font-extrabold text-white')
code = code.replace('text-[#2E1055]', 'text-[#A78BFA]') # Only works if specific, let's target the Live Stream Shield
code = code.replace('text-[#2E1055]"} /> Live Stream Status', 'text-[#A78BFA]"} /> Live Stream Status')

code = code.replace('bg-[#ECFDF5] border border-[#A7F3D0]', 'bg-emerald-500/10 border border-emerald-500/30')
code = code.replace('text-[#065F46]', 'text-emerald-400')
code = code.replace('text-[#047857]', 'text-emerald-300')
code = code.replace('text-[#4B5563]', 'text-white/80')
code = code.replace('border-[#F3F4F6]', 'border-white/10')
code = code.replace('text-[#6B7280]', 'text-white/70')

code = code.replace('border-2 border-dashed border-[#E8EDF5]', 'border-2 border-dashed border-white/20')
code = code.replace('border border-[#E8EDF5] rounded-[16px] p-4 bg-slate-50 hover:border-emerald-500/30', 'border border-white/10 rounded-[16px] p-4 bg-white/5 hover:border-emerald-500/50')
code = code.replace('text-xs font-bold text-[#111827]', 'text-xs font-bold text-white')
code = code.replace('border-[#E8EDF5]', 'border-white/10')

# 5. Modal
code = code.replace(
    'className="bg-white border border-[#E8EDF5] w-full max-w-2xl rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white w-full max-w-2xl rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(46,16,85,0.3)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"'
)
code = code.replace('bg-[#F8FAFC] border-b border-[#E8EDF5]', 'bg-white/5 border-b border-white/10')
code = code.replace('bg-[#EEEAFE] border border-indigo-200 text-[#2E1055]', 'bg-[#A78BFA]/20 border border-[#A78BFA]/40 text-[#C4B5FD]')
code = code.replace('hover:bg-slate-200/50 flex items-center justify-center transition-colors cursor-pointer text-slate-500 hover:text-slate-900', 'hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-white/60 hover:text-white')

code = code.replace('bg-slate-50 border border-[#E8EDF5]', 'bg-white/5 border border-white/10')
code = code.replace('text-slate-400 uppercase', 'text-white/50 uppercase')

code = code.replace('bg-[#F5F3FF] border border-[#DDD6FE]', 'bg-[#A78BFA]/10 border border-[#A78BFA]/30')
code = code.replace('text-[#120524] uppercase', 'text-[#C4B5FD] uppercase')
code = code.replace('text-[#5B21B6] font-semibold', 'text-white/90 font-semibold')
code = code.replace('bg-white/60 border border-[#DDD6FE] rounded-2xl inline-block text-[11px] text-[#6D28D9]', 'bg-[#A78BFA]/20 border border-[#A78BFA]/40 rounded-2xl inline-block text-[11px] text-[#C4B5FD]')

code = code.replace('bg-slate-100 p-0.5 rounded-[8px] flex items-center border border-[#E8EDF5]', 'bg-white/10 p-0.5 rounded-[8px] flex items-center border border-white/10')
code = code.replace('bg-white text-[#2563EB] shadow-sm', 'bg-white/20 text-white shadow-sm')
code = code.replace('text-slate-500 hover:text-slate-900', 'text-white/50 hover:text-white')

code = code.replace('bg-white border border-[#E8EDF5] p-2 rounded-lg', 'bg-white/5 border border-white/10 p-2 rounded-lg text-white/70')

code = code.replace('bg-[#F8FAFC] border-t border-[#E8EDF5]', 'bg-white/5 border-t border-white/10')
code = code.replace(
    'bg-white border border-[#E8EDF5] hover:bg-[#F7F9FC] text-[#475569]',
    'bg-white/10 border border-white/10 hover:bg-white/20 text-white/90'
)
code = code.replace(
    'bg-[#2E1055] hover:bg-[#120524] text-white',
    'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white'
)


with open('src/components/CommandCenter/SignalsDetailView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed SignalsDetailView")
