import sys

with open('src/components/CommandCenter/PatientFlowView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Heat Map Colors
code = code.replace("bgClass = 'bg-[#ECFDF5] border-[#A7F3D0] hover:bg-[#D1FAE5]';", "bgClass = 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20';")
code = code.replace("colorClass = 'text-[#10B981]';", "colorClass = 'text-emerald-400';")
code = code.replace("bgClass = 'bg-[#EEF4FF] border-[#BFDBFE] hover:bg-[#DBEAFE]';", "bgClass = 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20';")
code = code.replace("colorClass = 'text-[#2563EB]';", "colorClass = 'text-blue-400';")
code = code.replace("bgClass = 'bg-[#FEF2F2] border-[#FECACA] hover:bg-[#FEE2E2]';", "bgClass = 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20';")
code = code.replace("colorClass = 'text-[#EF4444]';", "colorClass = 'text-red-400';")

# AI Suggestions Card
code = code.replace(
    'className="bg-emerald-500 border border-[#1F2937] rounded-[24px] p-8 premium-shadow relative overflow-hidden text-white"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] relative overflow-hidden text-white"'
)
code = code.replace(
    'className="bg-emerald-500 border border-white/10 rounded-[24px] p-8 premium-shadow relative overflow-hidden text-white"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] relative overflow-hidden text-white"'
)

# AI Suggestion Buttons
code = code.replace(
    'className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2.5 rounded-[12px] font-bold text-sm transition-colors shadow-sm"',
    'className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2.5 rounded-[12px] font-bold text-sm transition-colors shadow-sm"'
)
code = code.replace(
    'className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-[12px] font-bold text-sm transition-colors shadow-sm"',
    'className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-[12px] font-bold text-sm transition-colors border border-white/10"'
)

with open('src/components/CommandCenter/PatientFlowView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed PatientFlowView part 3")
