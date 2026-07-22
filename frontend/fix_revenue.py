import sys

with open('src/components/CommandCenter/RevenueImpact.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('bg-[#0B0F19]', 'bg-gradient-to-br from-[#2E1055] to-[#120524]')
code = code.replace('border-[#1E293B]', 'border-white/10')
code = code.replace('hover:border-[#EEEAFE]0/30', 'hover:border-white/30')

with open('src/components/CommandCenter/RevenueImpact.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
