import sys

with open('src/components/CommandCenter/RevenueImpact.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace bg-[#0B1121] with bg-gradient-to-br from-[#2E1055] to-[#120524]
code = code.replace('bg-[#0B1121]', 'bg-gradient-to-br from-[#2E1055] to-[#120524]')

with open('src/components/CommandCenter/RevenueImpact.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
