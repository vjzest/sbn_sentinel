import sys

with open('src/components/CommandCenter/HelpSupportView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Wrappers
content = content.replace('bg-white border border-[#E8EDF5] rounded-[24px]', 'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px]')
content = content.replace('bg-[#111827] border border-[#1F2937] rounded-[24px]', 'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px]')

# Text Colors
content = content.replace('text-[#111827]', 'text-white')
content = content.replace('text-[#6B7280]', 'text-white/70')
content = content.replace('text-[#4B5563]', 'text-white/60')
content = content.replace('text-[#9CA3AF]', 'text-white/50')
content = content.replace('text-gray-900', 'text-white')

# Borders and Backgrounds
content = content.replace('border-[#F3F4F6]', 'border-white/10')
content = content.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')

# Icon Colors
content = content.replace('bg-[#EEF4FF]', 'bg-blue-500/20')
content = content.replace('text-[#2563EB]', 'text-blue-400')
content = content.replace('bg-[#ECFDF5]', 'bg-emerald-500/20')
content = content.replace('text-[#10B981]', 'text-emerald-400')
content = content.replace('bg-[#FFFBEB]', 'bg-orange-500/20')
content = content.replace('text-[#F59E0B]', 'text-orange-400')
content = content.replace('bg-[#F5F3FF]', 'bg-purple-500/20')
content = content.replace('text-[#120524]', 'text-purple-400')

# Specifics
content = content.replace('text-[#120524]', 'text-white') # if any leftovers
content = content.replace('bg-white shadow-xl', 'bg-white/10 border border-white/20 shadow-[0_4px_15px_rgba(46,16,85,0.3)]')
content = content.replace('hover:bg-[#F3F4F6]', 'hover:bg-white/90')

# Support Ticket Button text color (since we replaced #111827 with white, we need the button text to be dark)
content = content.replace('<button className="w-full bg-white text-white font-extrabold py-3.5 rounded-[16px] hover:bg-white/90 transition-colors shadow-lg">', '<button className="w-full bg-white text-[#120524] font-extrabold py-3.5 rounded-[16px] hover:bg-white/90 transition-colors shadow-lg">')

with open('src/components/CommandCenter/HelpSupportView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed HelpSupportView")
