import sys

with open('src/components/CommandCenter/SuperAdminPanel.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Sidebar background
old_aside = "bg-slate-900/95 backdrop-blur-xl border border-gray-800 rounded-[24px] premium-shadow text-white"
new_aside = "bg-gradient-to-br from-[#2E1055] to-[#120524] shadow-[0_20px_60px_rgba(46,16,85,0.3)] rounded-[24px] text-white border border-white/10"
code = code.replace(old_aside, new_aside)

# 2. Border colors in sidebar
code = code.replace('border-gray-800', 'border-white/10')
code = code.replace('text-gray-500', 'text-white/40')

# 3. Active item styling
code = code.replace("bg-[#2E1055] text-white shadow-lg", "bg-white/10 text-white font-extrabold shadow-lg")
code = code.replace("text-gray-400 hover:text-white hover:bg-gray-800", "text-white/60 hover:text-white hover:bg-white/5")

# 4. Logo icon styling
code = code.replace("bg-gradient-to-br from-[#2E1055] to-[#4527A0]", "bg-white/10 border border-white/10")

with open('src/components/CommandCenter/SuperAdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
