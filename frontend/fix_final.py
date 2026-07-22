import sys, re

# 1. SignalFeed.tsx
with open('src/components/CommandCenter/SignalFeed.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(
    r'className="bg-white/10 border-white/10 text-white border-white/10 rounded-\[24px\] p-6 flex flex-col\n*h-\[480px\] premium-shadow card-hover"',
    r'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 flex flex-col h-[480px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover hover:-translate-y-1 transition-all duration-300"',
    code
)
# Fix single line matching if there's no newline
code = re.sub(
    r'className="bg-white/10 border-white/10 text-white border-white/10 rounded-\[24px\] p-6 flex flex-col h-\[480px\] premium-shadow card-hover"',
    r'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 flex flex-col h-[480px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover hover:-translate-y-1 transition-all duration-300"',
    code
)

with open('src/components/CommandCenter/SignalFeed.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

# 2. AIInsights.tsx
with open('src/components/CommandCenter/AIInsights.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'className="bg-white border border-white/10 rounded-[24px] p-6 premium-shadow h-[480px] flex flex-col card-hover"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] h-[480px] flex flex-col card-hover hover:-translate-y-1 transition-all duration-300"'
)
code = code.replace('className="bg-white border border-white/10 rounded-[16px] p-4"', 'className="bg-white/10 border border-white/20 rounded-[16px] p-4"')
code = code.replace('className="bg-[#EEF4FF] border border-[#BFDBFE]', 'className="bg-[#3B82F6]/20 border border-white/20')
code = code.replace('className="bg-white border border-white/10 hover:bg-[#F7F9FC] text-white', 'className="bg-white/10 border border-white/10 hover:bg-white/20 text-white')

with open('src/components/CommandCenter/AIInsights.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

# 3. page.tsx bottom cards
with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

bottom_row_start = code.find("{/* Bottom Row */}")
if bottom_row_start != -1:
    top_part = code[:bottom_row_start]
    bottom_part = code[bottom_row_start:]
    
    bottom_part = bottom_part.replace(
        'className="bg-white rounded-[24px] border border-white/10 p-6 premium-shadow card-hover"',
        'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover hover:-translate-y-1 transition-all duration-300"'
    )
    
    code = top_part + bottom_part

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed card backgrounds")
