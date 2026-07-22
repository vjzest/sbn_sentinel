import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace bg-white with dark theme for the three bottom cards
# We look for "bg-white rounded-[24px] border border-[#E8EDF5] p-6 premium-shadow card-hover"
code = code.replace(
    'bg-white rounded-[24px] border border-[#E8EDF5] p-6 premium-shadow card-hover', 
    'bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-[24px] border border-white/10 p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] card-hover text-white'
)

# Text color replacements for the bottom row since their wrappers are now dark
code = code.replace('text-[#111827]', 'text-white')
code = code.replace('text-[#6B7280]', 'text-white/70')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated page.tsx")
