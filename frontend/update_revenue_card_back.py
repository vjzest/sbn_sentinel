import sys

with open('src/components/CommandCenter/RevenueImpact.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('bg-gradient-to-br from-[#2E1055] to-[#120524]', 'bg-[#0B0F19]')
code = code.replace('border-white/10', 'border-[#1E293B]')
code = code.replace('hover:border-white/30', 'hover:border-[#EEEAFE]0/30')

with open('src/components/CommandCenter/RevenueImpact.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Reverted RevenueImpact")
