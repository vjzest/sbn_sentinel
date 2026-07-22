import sys, re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We want to replace the three bottom cards
# To be safe, we'll only do it inside the { /* Bottom Row */ } section
bottom_row_start = code.find("{/* Bottom Row */}")
if bottom_row_start != -1:
    top_part = code[:bottom_row_start]
    bottom_part = code[bottom_row_start:]
    
    # Replace outer wrapper
    bottom_part = bottom_part.replace(
        'className="bg-white rounded-[24px] border border-[#E8EDF5] p-6 premium-shadow card-hover"',
        'className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-[24px] border border-white/10 p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover text-white"'
    )
    
    # Text colors
    bottom_part = bottom_part.replace('text-[#111827]', 'text-white')
    bottom_part = bottom_part.replace('text-[#6B7280]', 'text-white/70')
    bottom_part = bottom_part.replace('text-[#4B5563]', 'text-white/90')
    bottom_part = bottom_part.replace('text-[#9CA3AF]', 'text-white/50')
    bottom_part = bottom_part.replace('text-[#2563EB]', 'text-[#A78BFA]') # View All / View Full Report
    bottom_part = bottom_part.replace('text-[#120524]', 'text-white') # Donut center text
    
    # Inner boxes/borders
    bottom_part = bottom_part.replace('bg-slate-50/70', 'bg-white/5')
    bottom_part = bottom_part.replace('bg-[#F9FAFB]', 'bg-white/5')
    bottom_part = bottom_part.replace('border-[#E8EDF5]', 'border-white/10')
    bottom_part = bottom_part.replace('border-[#F3F4F6]', 'border-white/10')
    
    code = top_part + bottom_part
    
with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done bottom cards")
