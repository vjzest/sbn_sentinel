import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make sidebar dark purple
old_sidebar = 'className={w-[260px] glass-panel bg-white/80 border border-[#E8EDF5] rounded-[24px] premium-shadow flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out text-slate-700 shrink-0 }>'
new_sidebar = 'className={w-[260px] bg-gradient-to-br from-[#2E1055] to-[#120524] shadow-[0_20px_60px_rgba(46,16,85,0.3)] border border-white/10 rounded-[24px] premium-shadow flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out text-white shrink-0 }>'
code = code.replace(old_sidebar, new_sidebar)

# We also need to fix text colors inside the sidebar so it looks good on dark purple
# The sidebar has <div className="p-6 pb-5 border-b border-[#E2E8F0] ...
code = code.replace('border-[#E2E8F0]', 'border-white/10')
code = code.replace('text-[#0F172A]', 'text-white')
code = code.replace('text-[#94A3B8]', 'text-white/40')
code = code.replace('text-[#6D5DF6]', 'text-white/70')
code = code.replace('bg-[#F8FAFC]/50', 'bg-transparent')
code = code.replace('bg-white/50', 'bg-transparent')
code = code.replace('border-[#E8EDF5]', 'border-white/10')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed sidebar")
