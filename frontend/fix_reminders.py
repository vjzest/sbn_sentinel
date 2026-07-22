import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("'bg-white border-white/10 hover:border-[#7C3AED]/30 hover:shadow-sm'", "'bg-white/10 border-white/10 hover:border-[#7C3AED]/50 hover:shadow-sm'")

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed reminders list items bg")
