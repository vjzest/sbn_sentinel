import sys
import re

with open('src/components/CommandCenter/ClinicalLogsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Main Wrappers
code = code.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
)

# 2. Add empty state to the table
target_table = """{encounters.map((log) => ("""
replacement_table = """{encounters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <p className="text-sm text-white/50 font-bold">No clinical records found.</p>
                    </td>
                  </tr>
                )}
                {encounters.map((log) => ("""
code = code.replace(target_table, replacement_table)

# 3. Targeted specific replacements (Colors, Text)
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#6B7280]', 'text-white/70')
code = code.replace('text-[#4B5563]', 'text-white/60')
code = code.replace('text-[#9CA3AF]', 'text-white/50')
code = code.replace('border-[#E8EDF5]', 'border-white/10')
code = code.replace('border-[#F3F4F6]', 'border-white/10')
code = code.replace('border-[#E2E8F0]', 'border-white/10')
code = code.replace('bg-[#F7F9FC]', 'bg-white/5')
code = code.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')
code = code.replace('bg-[#F8FAFC]', 'bg-white/5')
code = code.replace('bg-[#F1F5F9]', 'bg-white/5')
code = code.replace('bg-[#EEF4FF]', 'bg-blue-500/20')
code = code.replace('text-[#2563EB]', 'text-blue-400')
code = code.replace('bg-[#FFFBEB]', 'bg-orange-500/20')
code = code.replace('text-[#F59E0B]', 'text-orange-400')
code = code.replace('bg-[#ECFDF5]', 'bg-emerald-500/20')
code = code.replace('text-[#10B981]', 'text-emerald-400')
code = code.replace('bg-[#FEF2F2]', 'bg-red-500/20')
code = code.replace('text-[#EF4444]', 'text-red-400')
code = code.replace('bg-white hover:bg-gray-800', 'bg-white/10 hover:bg-white/20')

# Safe replace for other bg-white cases
code = code.replace(
    'bg-white border border-[#E8EDF5]',
    'bg-white/5 border border-white/10'
)
code = code.replace(
    'bg-white text-[#2E1055] shadow-sm',
    'bg-white/20 text-white shadow-sm'
)

# Convert remaining literal bg-whites carefully
code = re.sub(r'\bbg-white\b', 'bg-transparent', code)

with open('src/components/CommandCenter/ClinicalLogsView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed ClinicalLogsView")
