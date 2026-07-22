import sys

with open('src/components/CommandCenter/PatientFlowView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Header text
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#6B7280]', 'text-white/70')
code = code.replace('text-[#9CA3AF]', 'text-white/50')
code = code.replace('text-[#4B5563]', 'text-white/70')

# Card Backgrounds
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover flex justify-between items-center',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover flex justify-between items-center text-white'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow card-hover',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover text-white'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow col-span-2',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] col-span-2 text-white'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow card-hover',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover text-white'
)
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
)


# Filter / Header Buttons
code = code.replace('bg-white border-[#E8EDF5]', 'bg-white/5 border-white/10')
code = code.replace('bg-[#EEF4FF] border-[#BFDBFE] text-[#2563EB]', 'bg-white/20 border-white/40 text-white shadow-md')
code = code.replace('bg-white rounded-[16px] premium-shadow border border-[#E8EDF5]', 'bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-[16px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] border border-white/10')
code = code.replace('hover:bg-[#F3F4F6]', 'hover:bg-white/10')
code = code.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')
code = code.replace('bg-[#E8EDF5]', 'bg-white/10')
code = code.replace('bg-white border border-[#E8EDF5]', 'bg-white/5 border border-white/10')

# Modals
code = code.replace(
    'bg-white rounded-[24px] w-full max-w-6xl overflow-hidden premium-shadow relative flex flex-col max-h-[90vh]',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] w-full max-w-6xl overflow-hidden shadow-[0_20px_50px_rgba(46,16,85,0.3)] relative flex flex-col max-h-[90vh] text-white'
)
code = code.replace(
    'bg-[#F8FAFC] p-8 border-b border-[#E8EDF5]',
    'bg-white/5 p-8 border-b border-white/10'
)
code = code.replace('bg-white rounded-[16px] border border-[#E8EDF5] p-5 shadow-sm', 'bg-white/5 rounded-[16px] border border-white/10 p-5 shadow-sm')
code = code.replace('bg-white rounded-[16px] border border-[#E8EDF5] overflow-hidden shadow-sm', 'bg-white/5 rounded-[16px] border border-white/10 overflow-hidden shadow-sm')
code = code.replace('bg-[#F8FAFC] border-b border-[#E8EDF5] px-4 py-3', 'bg-white/10 border-b border-white/10 px-4 py-3')
code = code.replace('bg-slate-50', 'bg-white/5')
code = code.replace('bg-white px-5 py-4', 'bg-transparent px-5 py-4')

# Health Card Modals
code = code.replace(
    'bg-white rounded-[24px] w-full max-w-4xl p-8 premium-shadow relative flex flex-col max-h-[90vh]',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] w-full max-w-4xl p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] relative flex flex-col max-h-[90vh] text-white'
)

# Patient Journey Backgrounds
code = code.replace('bg-white px-2 relative group cursor-pointer', 'bg-transparent px-2 relative group cursor-pointer')
code = code.replace('bg-white border-4 border-[#E8EDF5]', 'bg-[#2E1055] border-4 border-white/20')

# Table Backgrounds
code = code.replace('border-b border-[#E8EDF5]', 'border-b border-white/10')
code = code.replace('border-b border-[#F3F4F6]', 'border-b border-white/10')

# Inputs
code = code.replace('bg-white border border-[#E8EDF5] rounded-xl px-4 py-3 text-sm text-[#111827] focus:border-[#111827] outline-none transition-colors w-full', 'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#A78BFA] outline-none transition-colors w-full')
code = code.replace('bg-white border border-[#E8EDF5] rounded-xl px-4 py-3 text-sm text-white focus:border-[#111827] outline-none transition-colors w-full', 'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#A78BFA] outline-none transition-colors w-full')

# Colors
code = code.replace("'bg-[#EFF6FF]'", "'bg-blue-500/20'")
code = code.replace("'bg-[#ECFDF5]'", "'bg-emerald-500/20'")
code = code.replace("'bg-[#FFFBEB]'", "'bg-orange-500/20'")
code = code.replace("'bg-[#FEF2F2]'", "'bg-red-500/20'")
code = code.replace("'bg-blue-50'", "'bg-blue-500/20'")
code = code.replace("'text-blue-600'", "'text-blue-400'")

code = code.replace("'bg-[#F7F9FC]'", "'bg-white/5'")

# Specific fixes
code = code.replace('border-[#E8EDF5]', 'border-white/10')
code = code.replace('border-[#F3F4F6]', 'border-white/10')
code = code.replace('bg-[#F7F9FC]', 'bg-white/5')
code = code.replace('bg-[#111827]', 'bg-emerald-500')
code = code.replace('hover:bg-gray-800', 'hover:bg-emerald-400')


with open('src/components/CommandCenter/PatientFlowView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed PatientFlowView")
