import sys

with open('src/components/CommandCenter/ScheduleOptimizerView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Revert broken transparent classes
code = code.replace('bg-transparent/5', 'bg-white/5')
code = code.replace('bg-transparent/10', 'bg-white/10')
code = code.replace('bg-transparent/20', 'bg-white/20')

# Fix One-Click Auto-fill Button
code = code.replace(
    'className="bg-transparent text-purple-300 hover:bg-white/5 font-extrabold py-2 px-4 rounded-[10px] text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02] active:scale-98 w-full cursor-pointer select-none"',
    'className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold py-2 px-4 rounded-[10px] text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02] active:scale-98 w-full cursor-pointer select-none border-0"'
)
code = code.replace(
    'className="bg-transparent text-[#6D5DF6] hover:bg-white/5 font-extrabold py-2 px-4 rounded-[10px] text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02] active:scale-98 w-full cursor-pointer select-none"',
    'className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold py-2 px-4 rounded-[10px] text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02] active:scale-98 w-full cursor-pointer select-none border-0"'
)

with open('src/components/CommandCenter/ScheduleOptimizerView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed ScheduleOptimizerView safely v4")
