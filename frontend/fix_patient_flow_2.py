import sys

with open('src/components/CommandCenter/PatientFlowView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('focus:bg-white', 'focus:bg-white/10')
code = code.replace('bg-white p-2 rounded-lg border border-slate-100', 'bg-white/5 p-2 rounded-lg border border-white/10')
code = code.replace("? 'bg-white text-[#2E1055] shadow-sm'", "? 'bg-white/20 text-white shadow-sm'")
code = code.replace('bg-[#F8FAFC]', 'bg-white/5')
code = code.replace('bg-slate-50', 'bg-white/5')
code = code.replace('text-slate-400', 'text-white/50')
code = code.replace('text-slate-500', 'text-white/60')
code = code.replace('text-slate-900', 'text-white')
code = code.replace('border-slate-200', 'border-white/10')
code = code.replace('border-slate-100', 'border-white/10')
code = code.replace('bg-slate-100', 'bg-white/10')
code = code.replace('hover:bg-slate-100', 'hover:bg-white/20')
code = code.replace('bg-slate-800', 'bg-emerald-500')
code = code.replace('bg-[#111827]', 'bg-emerald-500')

with open('src/components/CommandCenter/PatientFlowView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed PatientFlowView part 2")
