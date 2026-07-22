import sys, re

# --- 1. SignalFeed.tsx ---
with open('src/components/CommandCenter/SignalFeed.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# The outer container might be g-white/10 border-white/10 text-white border-white/10 rounded-[24px] p-6 flex flex-col h-[480px] premium-shadow card-hover
# We'll just replace everything between className=" and ounded-[24px] for the main outer div, which is the first ounded-[24px] p-6 flex flex-col h-[480px]
code = re.sub(
    r'className="[^"]*rounded-\[24px\] p-6 flex flex-col h-\[480px\][^"]*"',
    r'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 flex flex-col h-[480px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] hover:border-white/30 transition-colors"',
    code, count=1
)
with open('src/components/CommandCenter/SignalFeed.tsx', 'w', encoding='utf-8') as f:
    f.write(code)


# --- 2. AIInsights.tsx ---
with open('src/components/CommandCenter/AIInsights.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Main outer div
code = re.sub(
    r'className="[^"]*rounded-\[24px\] p-6 premium-shadow flex flex-col h-\[480px\][^"]*"',
    r'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex flex-col h-[480px] hover:border-white/30 transition-colors relative overflow-hidden"',
    code, count=1
)

with open('src/components/CommandCenter/AIInsights.tsx', 'w', encoding='utf-8') as f:
    f.write(code)


# --- 3. page.tsx bottom cards ---
with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

bottom_row_start = code.find("{/* Bottom Row */}")
if bottom_row_start != -1:
    top_part = code[:bottom_row_start]
    bottom_part = code[bottom_row_start:]
    
    # We want to change the 3 bottom cards outer divs.
    # They currently might be g-white/5 or g-gradient-to-br... or something else because of my scripts.
    # We know they have p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover or p-6 premium-shadow card-hover
    bottom_part = re.sub(
        r'className="[^"]*p-6[^"]*card-hover[^"]*"',
        r'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 text-white rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover hover:-translate-y-1 transition-all duration-300"',
        bottom_part
    )
    
    code = top_part + bottom_part

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed card backgrounds.")
