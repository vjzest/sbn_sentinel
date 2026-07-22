import sys

with open('src/components/CommandCenter/ClinicalLogsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix Modal classes
code = code.replace(
    'className="bg-transparent border border-white/10 w-full max-w-lg rounded-[28px]',
    'className="bg-[#120524] border border-white/10 w-full max-w-lg rounded-[28px]'
)
code = code.replace(
    'className="bg-transparent/5 border-b border-white/10 px-6 py-4 flex justify-between items-center"',
    'className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center"'
)
code = code.replace(
    'className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold text-xs py-2.5 rounded-[16px]"',
    'className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-[16px]"'
)

# Fix remaining bg-transparent/5 issues
code = code.replace('bg-transparent/5', 'bg-white/5')
code = code.replace('bg-transparent/10', 'bg-white/10')
code = code.replace('bg-transparent/20', 'bg-white/20')

# Also fix the inner form elements of the modal if they got ruined
code = code.replace(
    'className="w-full bg-transparent border border-white/10 rounded-[16px]',
    'className="w-full bg-white/5 border border-white/10 rounded-[16px]'
)

# Replace remaining `bg-transparent` buttons that were supposed to be white/5
code = code.replace('bg-transparent border border-[#E8EDF5]', 'bg-white/5 border border-white/10')
code = code.replace('bg-transparent border border-white/10 text-white font-bold text-xs', 'bg-white/5 border border-white/10 text-white font-bold text-xs')
code = code.replace('bg-transparent hover:bg-[#F7F9FC]', 'bg-white/5 hover:bg-white/10')

# One more fix for the tab switcher
code = code.replace(
    "activeTab === 'billing'\n                          ? 'bg-transparent text-[#2E1055] shadow-sm border border-white/10'\n                          : 'text-white/70 hover:text-white'",
    "activeTab === 'billing'\n                          ? 'bg-white/20 text-white shadow-sm border border-white/10'\n                          : 'text-white/70 hover:text-white'"
)
code = code.replace(
    "activeTab === 'clinical'\n                          ? 'bg-transparent text-[#2E1055] shadow-sm border border-white/10'\n                          : 'text-white/70 hover:text-white'",
    "activeTab === 'clinical'\n                          ? 'bg-white/20 text-white shadow-sm border border-white/10'\n                          : 'text-white/70 hover:text-white'"
)

with open('src/components/CommandCenter/ClinicalLogsView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed modal and transparent classes in ClinicalLogsView")
