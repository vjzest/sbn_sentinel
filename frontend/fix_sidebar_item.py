import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_active = "'bg-[#EEF2FF] text-white/70 font-extrabold border border-[#C7D2FE]/50 shadow-[0_4px_12px_rgba(79,70,229,0.06)]'"
new_active = "'bg-white/10 text-white font-extrabold border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]'"
code = code.replace(old_active, new_active)

old_inactive = "'text-[#475569] font-bold hover:bg-[#F1F5F9] hover:text-white'"
new_inactive = "'text-white/60 font-bold hover:bg-white/5 hover:text-white'"
code = code.replace(old_inactive, new_inactive)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed SidebarItem")
