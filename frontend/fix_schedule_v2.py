import sys
import re

with open('src/components/CommandCenter/ScheduleOptimizerView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Main Wrappers (must do this first so bg-white inside them gets replaced cleanly)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex flex-col justify-between min-h-[160px] transition-all duration-300',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover flex flex-col justify-between min-h-[160px] transition-all duration-300'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow col-span-2 flex flex-col justify-between',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] col-span-2 flex flex-col justify-between'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow flex-1 flex flex-col justify-between',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex-1 flex flex-col justify-between'
)

# 2. Other Specific UI Components
code = code.replace(
    'border border-[#E8EDF5] rounded-[16px] overflow-hidden bg-white',
    'border border-white/10 rounded-[16px] overflow-hidden bg-transparent'
)
code = code.replace(
    'bg-white text-[#2E1055] hover:bg-[#F7F9FC]',
    'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white border-0'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow hover:bg-[#F7F9FC] cursor-pointer transition-colors active:scale-95 select-none',
    'bg-white/5 border border-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] shadow-lg hover:bg-white/10 cursor-pointer transition-colors active:scale-95 select-none'
)
code = code.replace(
    'absolute right-0 mt-3 w-48 bg-white border border-[#E8EDF5] rounded-[16px] premium-shadow z-50',
    'absolute right-0 mt-3 w-48 bg-[#120524] border border-white/10 rounded-[16px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] z-50'
)
code = code.replace(
    'w-full bg-[#EEF4FF] border border-[#BFDBFE] text-[#2563EB] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
    'w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md'
)
code = code.replace(
    'w-full bg-[#FFFBEB] border border-[#FDE68A] text-[#F59E0B] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
    'w-full bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md'
)
code = code.replace(
    'w-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
    'w-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md'
)
code = code.replace(
    'w-full bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
    'w-full bg-red-500/20 border border-red-500/30 text-red-400 rounded-[16px] p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md'
)

# 3. Targeted specific replacements (Colors, Text)
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#6B7280]', 'text-white/70')
code = code.replace('text-slate-800', 'text-white')
code = code.replace('text-slate-400', 'text-white/50')
code = code.replace('text-[#9CA3AF]', 'text-white/50')

code = code.replace('bg-[#F7F9FC]', 'bg-white/5')
code = code.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')
code = code.replace('bg-slate-50/20', 'bg-white/5')
code = code.replace('hover:bg-slate-50', 'hover:bg-white/10')
code = code.replace('bg-white hover:bg-slate-50', 'bg-white/5 hover:bg-white/10')
code = code.replace('bg-white', 'bg-transparent')  # Any remaining bg-white should be transparent or handled

code = code.replace('border-[#E8EDF5]', 'border-white/10')
code = code.replace('border-[#F3F4F6]', 'border-white/10')
code = code.replace('border-slate-200', 'border-white/10')
code = code.replace('border-indigo-200', 'border-purple-500/30')

code = code.replace('bg-[#EEF4FF]', 'bg-blue-500/20')
code = code.replace('text-[#2563EB]', 'text-blue-400')
code = code.replace('bg-[#FFFBEB]', 'bg-orange-500/20')
code = code.replace('text-[#F59E0B]', 'text-orange-400')
code = code.replace('bg-[#ECFDF5]', 'bg-emerald-500/20')
code = code.replace('text-[#10B981]', 'text-emerald-400')
code = code.replace('bg-[#FEF2F2]', 'bg-red-500/20')
code = code.replace('text-[#EF4444]', 'text-red-400')
code = code.replace('bg-[#EFF6FF]', 'bg-blue-500/20')
code = code.replace('text-[#3B82F6]', 'text-blue-400')
code = code.replace('bg-[#EEEAFE]', 'bg-purple-500/20')
code = code.replace('text-[#2E1055]', 'text-purple-300')

with open('src/components/CommandCenter/ScheduleOptimizerView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed ScheduleOptimizerView safely")
