import sys

# 1. SignalFeed.tsx
with open('src/components/CommandCenter/SignalFeed.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('bg-[#F8FAFC]', 'bg-white/5')
code = code.replace('bg-[#F5F3FF]', 'bg-[#7C3AED]/20')
code = code.replace('bg-[#EEEAFE]', 'bg-[#6D5DF6]/20')
code = code.replace('bg-[#D1FAE5]', 'bg-[#10B981]/20')
code = code.replace('text-[#5B4AE8]', 'text-[#A78BFA]')
code = code.replace('text-[#10B981]', 'text-[#34D399]')
code = code.replace('text-[#7C3AED]', 'text-[#C4B5FD]')
code = code.replace('bg-white/80', 'bg-white/10')
code = code.replace('text-indigo-950', 'text-white')
code = code.replace('text-indigo-900', 'text-white/90')

with open('src/components/CommandCenter/SignalFeed.tsx', 'w', encoding='utf-8') as f:
    f.write(code)


# 2. AIInsights.tsx
with open('src/components/CommandCenter/AIInsights.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('bg-[#F5F3FF]', 'bg-[#7C3AED]/20')
code = code.replace('bg-[#ECFDF5]', 'bg-[#10B981]/20')
code = code.replace('border-[#A7F3D0]', 'border-[#10B981]/30')
code = code.replace('text-[#065F46]', 'text-[#34D399]')
code = code.replace('text-[#7C3AED]', 'text-[#C4B5FD]')

with open('src/components/CommandCenter/AIInsights.tsx', 'w', encoding='utf-8') as f:
    f.write(code)


# 3. page.tsx bottom cards
with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

bottom_row_start = code.find("{/* Bottom Row */}")
if bottom_row_start != -1:
    top_part = code[:bottom_row_start]
    bottom_part = code[bottom_row_start:]
    
    bottom_part = bottom_part.replace('bg-slate-50/70', 'bg-white/5')
    bottom_part = bottom_part.replace('bg-slate-100', 'bg-white/10')
    bottom_part = bottom_part.replace('bg-[#F9FAFB]', 'bg-white/5')
    bottom_part = bottom_part.replace('text-slate-500', 'text-white/70')
    bottom_part = bottom_part.replace('text-[#111827]', 'text-white')
    bottom_part = bottom_part.replace('text-[#6B7280]', 'text-white/70')
    bottom_part = bottom_part.replace('text-[#4B5563]', 'text-white/90')
    bottom_part = bottom_part.replace('border-[#E8EDF5]', 'border-white/10')
    bottom_part = bottom_part.replace('border-[#F3F4F6]', 'border-white/10')
    bottom_part = bottom_part.replace('border-slate-200', 'border-white/10')
    
    code = top_part + bottom_part

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed inner cards")
