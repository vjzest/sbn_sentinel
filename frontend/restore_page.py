import sys

# I will write a script to restore the sidebar
with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace sidebar classes
old_sidebar = 'className={w-[260px] bg-white border-r border-[#E8EDF5] flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out shrink-0'
new_sidebar = 'className={w-[260px] bg-gradient-to-br from-[#2E1055] to-[#120524] shadow-[0_20px_60px_rgba(46,16,85,0.3)] border border-white/10 rounded-[24px] premium-shadow flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out text-white shrink-0'
code = code.replace(old_sidebar, new_sidebar)

# I can't be sure of the exact old text, let's just make the sidebar dark purple and text white.
# Actually I will just replace the whole aside tag.
