import sys

with open('src/components/CommandCenter/IntelligenceView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Header Area
code = code.replace('text-gray-900 tracking-tight', 'text-white tracking-tight')
code = code.replace('text-gray-500 font-medium ml-12', 'text-white/70 font-medium ml-12')
code = code.replace('bg-emerald-50 text-emerald-700 border-emerald-100', 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30')

# 2. Left Sidebar (New Notifications)
code = code.replace('className="bg-white rounded-3xl p-6 border border-gray-100 premium-shadow"', 'className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-3xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white"')
code = code.replace('text-gray-900 mb-6', 'text-white mb-6')
code = code.replace('bg-[#E0D9FD] text-[#120524]', 'bg-[#A78BFA]/20 text-[#C4B5FD]')

# Left Sidebar List Items
code = code.replace(
    "'bg-[#EEEAFE] border-indigo-200 ring-2 ring-[#EEEAFE]0/20 shadow-md'",
    "'bg-white/20 border-white/40 ring-2 ring-white/20 shadow-md'"
)
code = code.replace(
    "'bg-white border-gray-100 hover:border-[#E0D9FD] hover:bg-gray-50'",
    "'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'"
)
code = code.replace('bg-red-100 text-red-600', 'bg-red-500/20 text-red-400')
code = code.replace('bg-orange-100 text-orange-600', 'bg-orange-500/20 text-orange-400')
code = code.replace('bg-blue-100 text-blue-600', 'bg-blue-500/20 text-blue-400')
code = code.replace('text-gray-900 capitalize', 'text-white capitalize')
code = code.replace('text-gray-400 font-medium', 'text-white/60 font-medium')
code = code.replace('text-gray-600 line-clamp-2', 'text-white/80 line-clamp-2')

# Empty State
code = code.replace('text-gray-900', 'text-white')
code = code.replace('text-gray-500 mt-1', 'text-white/70 mt-1')

# 3. Right Side (Details)
code = code.replace(
    'className="bg-white rounded-3xl border border-gray-100 premium-shadow overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500 text-white"'
)
code = code.replace('bg-slate-900 p-8 text-white relative overflow-hidden', 'bg-white/5 p-8 text-white relative overflow-hidden border-b border-white/10')

# AI Analysis Boxes
code = code.replace('bg-gray-50/50', 'bg-transparent')
code = code.replace('bg-white p-6 rounded-2xl border border-[#E0D9FD]', 'bg-white/10 p-6 rounded-2xl border border-white/20')
code = code.replace('bg-[#E0D9FD] text-[#120524] px-3', 'bg-[#A78BFA] text-[#120524] px-3')
code = code.replace('text-gray-700 font-medium', 'text-white/90 font-medium')

code = code.replace('bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100', 'bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30')
code = code.replace('text-emerald-900 font-bold', 'text-emerald-300 font-bold')

# Action Buttons
code = code.replace('bg-white border-t border-gray-100', 'bg-transparent border-t border-white/10')
code = code.replace('text-gray-500 hover:bg-gray-100', 'text-white/70 hover:bg-white/10')
code = code.replace('bg-[#2E1055] hover:bg-[#120524] shadow-md', 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white')

# Right side ready/empty state
code = code.replace('bg-white rounded-3xl border border-gray-100 premium-shadow h-[600px] flex flex-col items-center justify-center text-center p-8', 'bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] h-[600px] flex flex-col items-center justify-center text-center p-8 text-white')
code = code.replace('text-gray-500 max-w-md mx-auto', 'text-white/70 max-w-md mx-auto')


with open('src/components/CommandCenter/IntelligenceView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed IntelligenceView")
