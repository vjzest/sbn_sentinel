import sys

with open('src/components/CommandCenter/ConnectorsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Helper styles
code = code.replace("'bg-[#ECFDF5]'", "'bg-emerald-500/20'")
code = code.replace("'text-[#10B981]'", "'text-emerald-400'")
code = code.replace("'bg-[#EEF4FF]'", "'bg-blue-500/20'")
code = code.replace("'text-[#2563EB]'", "'text-blue-400'")
code = code.replace("'bg-[#FFFBEB]'", "'bg-orange-500/20'")
code = code.replace("'text-[#F59E0B]'", "'text-orange-400'")
code = code.replace("'bg-[#F5F3FF]'", "'bg-[#A78BFA]/20'")
code = code.replace("'text-[#120524]'", "'text-[#A78BFA]'")
code = code.replace("'bg-[#EFF6FF]'", "'bg-sky-500/20'")
code = code.replace("'text-[#3B82F6]'", "'text-sky-400'")
code = code.replace("'bg-[#FEF2F2]'", "'bg-red-500/20'")
code = code.replace("'text-[#EF4444]'", "'text-red-400'")
code = code.replace("'bg-[#F3E8FF]'", "'bg-purple-500/20'")
code = code.replace("'text-[#6D28D9]'", "'text-purple-400'")

# General text
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#6B7280]', 'text-white/70')
code = code.replace('text-[#9CA3AF]', 'text-white/50')
code = code.replace('text-[#4B5563]', 'text-white/70')

# Header Add Integration Button
code = code.replace(
    'bg-gradient-to-r from-[#2E1055] to-[#120524] hover:from-[#120524] hover:to-[#6D28D9] text-white font-bold px-6 py-3 rounded-[14px] transition-transform active:scale-95 shadow-[0_4px_14px_rgba(79,70,229,0.3)]',
    'bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-[14px] transition-transform active:scale-95 shadow-[0_4px_14px_rgba(16,185,129,0.3)]'
)

# Top Stats
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex justify-between items-center',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover flex justify-between items-center text-white'
)

# Connector Cards
code = code.replace(
    'className={g-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex flex-col justify-between group transition-all duration-500',
    'className={g-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover flex flex-col justify-between group transition-all duration-500 text-white'
)
code = code.replace("ring-2 ring-[#2E1055]", "ring-2 ring-white/30")

code = code.replace('hover:bg-[#F3F4F6] rounded-full text-[#4B5563] hover:text-[#111827]', 'hover:bg-white/10 rounded-full text-white/50 hover:text-white')
code = code.replace('hover:bg-rose-50 rounded-full text-rose-400 hover:text-rose-600', 'hover:bg-rose-500/20 rounded-full text-rose-400 hover:text-rose-300')

code = code.replace('bg-[#F7F9FC] border border-[#E8EDF5]', 'bg-white/5 border border-white/10')
code = code.replace('border-t border-[#F3F4F6]', 'border-t border-white/10')

# Timeline & Charts
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
)
code = code.replace('via-[#E8EDF5]', 'via-white/20')
code = code.replace('bg-white p-3 rounded-[16px] border border-[#E8EDF5]', 'bg-white/5 p-3 rounded-[16px] border border-white/10')
code = code.replace('bg-[#EEF4FF] px-3 py-1.5', 'bg-blue-500/20 text-blue-300 px-3 py-1.5')
code = code.replace('stroke="#F3F4F6"', 'stroke="rgba(255,255,255,0.1)"')

# Modals Outer Wrapper
code = code.replace(
    'bg-white rounded-[24px] w-full max-w-lg p-8 premium-shadow relative',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] w-full max-w-lg p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] relative text-white'
)
code = code.replace(
    'bg-white rounded-[24px] w-full max-w-2xl p-8 premium-shadow relative',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] w-full max-w-2xl p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] relative text-white'
)
code = code.replace(
    'bg-white rounded-[24px] w-full max-w-md p-8 premium-shadow relative',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] w-full max-w-md p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] relative text-white'
)

# Modal Elements
code = code.replace('border border-[#E8EDF5] rounded-[16px] hover:border-[#2E1055] hover:bg-[#EEF4FF]', 'border border-white/10 rounded-[16px] hover:border-[#A78BFA]/50 hover:bg-white/10')
code = code.replace('bg-[#F7F9FC] border border-[#E8EDF5] rounded-full flex items-center justify-center group-hover:border-[#2E1055] bg-white', 'bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:border-white/30')
code = code.replace('text-[#4B5563] group-hover:text-[#2E1055]', 'text-white/50 group-hover:text-white')
code = code.replace('bg-white border border-[#2E1055] rounded-[8px] group-hover:bg-[#2E1055] group-hover:text-white', 'bg-transparent border border-white/20 rounded-[8px] group-hover:bg-emerald-500 group-hover:border-transparent group-hover:text-white')

code = code.replace('bg-[#EEF4FF] border border-[#BFDBFE]/50', 'bg-blue-500/10 border border-blue-500/30')
code = code.replace('bg-white rounded-full flex items-center justify-center shadow-sm shrink-0', 'bg-blue-500/20 rounded-full flex items-center justify-center shrink-0')
code = code.replace('text-[#2563EB]', 'text-blue-400')

code = code.replace('bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3 px-4 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:bg-white', 'bg-white/5 border border-white/10 rounded-[16px] py-3 px-4 text-sm font-bold text-white outline-none focus:border-[#A78BFA] focus:bg-white/10')
code = code.replace('text-xs font-bold text-white outline-none focus:border-[#2E1055] focus:bg-white', 'text-xs font-bold text-white outline-none focus:border-[#A78BFA] focus:bg-white/10')
code = code.replace('pl-9 pr-4 text-xs font-bold text-white outline-none focus:border-[#A78BFA] focus:bg-white/10', 'pl-9 pr-4 text-xs font-bold text-white outline-none focus:border-[#A78BFA] focus:bg-white/10')

# Actually for inputs, text-white already applied, just fixing backgrounds:
code = code.replace('bg-[#F7F9FC] border border-[#E8EDF5]', 'bg-white/5 border border-white/10')
code = code.replace('focus:border-[#2E1055] focus:bg-white', 'focus:border-[#A78BFA] focus:bg-white/10')

code = code.replace('bg-white border border-[#E8EDF5] text-white/70 font-bold py-3 rounded-[16px] text-xs hover:bg-[#F7F9FC]', 'bg-white/10 border border-white/10 text-white/70 font-bold py-3 rounded-[16px] text-xs hover:bg-white/20 hover:text-white')
code = code.replace('bg-white border border-[#E8EDF5] text-white/70 font-bold py-3 rounded-[16px] text-xs hover:bg-white/10', 'bg-white/10 border border-white/10 text-white/70 font-bold py-3 rounded-[16px] text-xs hover:bg-white/20 hover:text-white')

code = code.replace('flex-1 bg-[#111827] hover:bg-gray-800 text-white', 'flex-1 bg-emerald-500 hover:bg-emerald-400 text-white')
code = code.replace('bg-gradient-to-r from-[#2E1055] to-[#120524] hover:opacity-90', 'bg-emerald-500 hover:bg-emerald-400 text-white')
code = code.replace('w-16 h-16 bg-[#EEF4FF] border border-[#BFDBFE]/30', 'w-16 h-16 bg-blue-500/10 border border-blue-500/30')

code = code.replace('bg-[#111827] hover:bg-[#374151]', 'bg-emerald-600 hover:bg-emerald-500')
code = code.replace('bg-slate-50 border border-[#E8EDF5]', 'bg-white/5 border border-white/10')

code = code.replace('bg-rose-50 border border-rose-100', 'bg-rose-500/10 border border-rose-500/30')
code = code.replace('text-rose-500', 'text-rose-400')

with open('src/components/CommandCenter/ConnectorsView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed ConnectorsView")
