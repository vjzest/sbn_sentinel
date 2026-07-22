import sys, re

# --- 1. REVENUE IMPACT ---
with open('src/components/CommandCenter/RevenueImpact.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('bg-[#0B0F19]', 'bg-gradient-to-br from-[#2E1055] to-[#120524]')
code = code.replace('border-[#1E293B]', 'border-white/10')
code = code.replace('hover:border-[#EEEAFE]0/30', 'hover:border-white/30')

with open('src/components/CommandCenter/RevenueImpact.tsx', 'w', encoding='utf-8') as f:
    f.write(code)


# --- 2. AI INSIGHTS ---
with open('src/components/CommandCenter/AIInsights.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('bg-white', 'bg-gradient-to-br from-[#2E1055] to-[#120524]')
code = code.replace('border-[#E8EDF5]', 'border-white/10')
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#6B7280]', 'text-white/70')
code = code.replace('text-[#4B5563]', 'text-white/80')
code = code.replace('bg-[#F3F4F6]', 'bg-white/5')
code = code.replace('bg-[#F9FAFB]', 'bg-white/5')
code = code.replace('border-[#F3F4F6]', 'border-white/10')
code = code.replace('text-[#2E1055]', 'text-[#A78BFA]') # If there's dark purple text, make it light purple

with open('src/components/CommandCenter/AIInsights.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

# --- 3. SIGNAL FEED ---
with open('src/components/CommandCenter/SignalFeed.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('bg-white', 'bg-gradient-to-br from-[#2E1055] to-[#120524]')
code = code.replace('border-[#E8EDF5]', 'border-white/10')
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#4B5563]', 'text-white/80')
code = code.replace('text-[#6B7280]', 'text-white/70')
code = code.replace('bg-[#F9FAFB]', 'bg-white/5')
code = code.replace('border-[#F3F4F6]', 'border-white/10')

with open('src/components/CommandCenter/SignalFeed.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated cards")
