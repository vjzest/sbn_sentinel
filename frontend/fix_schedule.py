import sys

with open('src/components/CommandCenter/ScheduleOptimizerView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# General colors
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#6B7280]', 'text-white/70')
code = code.replace('text-slate-800', 'text-white')
code = code.replace('text-slate-400', 'text-white/50')
code = code.replace('border-[#E8EDF5]', 'border-white/10')
code = code.replace('border-[#F3F4F6]', 'border-white/10')
code = code.replace('border-slate-200', 'border-white/10')
code = code.replace('bg-[#F7F9FC]', 'bg-white/5')
code = code.replace('bg-white', 'bg-white/5')
code = code.replace('bg-white/5/10', 'bg-white/10')
code = code.replace('bg-white/5/20', 'bg-white/20')
code = code.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')
code = code.replace('hover:bg-slate-50', 'hover:bg-white/10')

# Specific Cards (Main wrappers)
code = code.replace(
    'bg-white/5 border border-white/10 rounded-[24px] p-6 premium-shadow card-hover flex flex-col justify-between min-h-[160px] transition-all duration-300',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover flex flex-col justify-between min-h-[160px] transition-all duration-300'
)
code = code.replace(
    'bg-white/5 border border-white/10 rounded-[24px] p-8 premium-shadow col-span-2 flex flex-col justify-between',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] col-span-2 flex flex-col justify-between'
)
code = code.replace(
    'bg-white/5 border border-white/10 rounded-[24px] p-6 premium-shadow flex-1 flex flex-col justify-between',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex-1 flex flex-col justify-between'
)
code = code.replace(
    'border border-white/10 rounded-[16px] overflow-hidden bg-white/5',
    'border border-white/10 rounded-[16px] overflow-hidden bg-transparent'
)

# Colors
code = code.replace('bg-[#EEF4FF]', 'bg-blue-500/20')
code = code.replace('text-[#2563EB]', 'text-blue-400')
code = code.replace('border-[#BFDBFE]', 'border-blue-500/30')
code = code.replace('hover:bg-[#EEF4FF]/30', 'hover:bg-blue-500/30')
code = code.replace('bg-[#FFFBEB]', 'bg-orange-500/20')
code = code.replace('text-[#F59E0B]', 'text-orange-400')
code = code.replace('border-[#FDE68A]', 'border-orange-500/30')
code = code.replace('bg-[#ECFDF5]', 'bg-emerald-500/20')
code = code.replace('text-[#10B981]', 'text-emerald-400')
code = code.replace('border-[#A7F3D0]', 'border-emerald-500/30')
code = code.replace('hover:bg-[#E6F4EA]/30', 'hover:bg-emerald-500/30')
code = code.replace('bg-[#FEF2F2]', 'bg-red-500/20')
code = code.replace('text-[#EF4444]', 'text-red-400')
code = code.replace('border-[#FECACA]', 'border-red-500/30')
code = code.replace('bg-[#EFF6FF]', 'bg-blue-500/20')
code = code.replace('text-[#3B82F6]', 'text-blue-400')
code = code.replace('bg-[#EEEAFE]', 'bg-purple-500/20')
code = code.replace('text-[#2E1055]', 'text-purple-300')
code = code.replace('border-indigo-200', 'border-purple-500/30')

# One-Click button
code = code.replace(
    'bg-white/5 text-purple-300 hover:bg-white/10',
    'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white border-0'
)

# Table grids
code = code.replace('bg-slate-50/20', 'bg-white/5')
code = code.replace('hover:bg-slate-50', 'hover:bg-white/10')
code = code.replace('text-[#9CA3AF]', 'text-white/50')
code = code.replace('border-dashed border-purple-500/30', 'border-dashed border-white/20')

# Dropdown / Date Range
code = code.replace(
    'bg-white/5 border border-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow hover:bg-white/10 cursor-pointer transition-colors active:scale-95 select-none',
    'bg-white/5 border border-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] shadow-lg hover:bg-white/10 cursor-pointer transition-colors active:scale-95 select-none'
)
code = code.replace(
    'absolute right-0 mt-3 w-48 bg-white/5 border border-white/10 rounded-[16px] premium-shadow z-50',
    'absolute right-0 mt-3 w-48 bg-[#120524] border border-white/10 rounded-[16px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] z-50'
)

with open('src/components/CommandCenter/ScheduleOptimizerView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed ScheduleOptimizerView")
