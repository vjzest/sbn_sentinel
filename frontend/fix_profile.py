import sys

with open('src/components/CommandCenter/UserProfileView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('bg-white p-8 rounded-[24px] border border-[#E8EDF5] premium-shadow', 'bg-gradient-to-br from-[#2E1055] to-[#120524] p-8 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white')
content = content.replace('bg-white p-6 rounded-[24px] border border-[#E8EDF5] premium-shadow', 'bg-gradient-to-br from-[#2E1055] to-[#120524] p-6 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white')

content = content.replace('bg-white', 'bg-white/5')
content = content.replace('text-[#111827]', 'text-white')
content = content.replace('text-[#6B7280]', 'text-white/70')
content = content.replace('text-[#4B5563]', 'text-white/60')
content = content.replace('text-[#9CA3AF]', 'text-white/50')
content = content.replace('bg-[#F7F9FC]', 'bg-white/5')
content = content.replace('bg-[#E8EDF5]', 'bg-white/10')
content = content.replace('border-[#E8EDF5]', 'border-white/10')
content = content.replace('border-[#F3F4F6]', 'border-white/10')

# Avatar
content = content.replace('bg-gradient-to-tr from-[#6D5DF6] to-[#7C3AED] p-[3px]', 'bg-gradient-to-tr from-[#6D5DF6] to-[#7C3AED] p-[2px]')

with open('src/components/CommandCenter/UserProfileView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed UserProfileView")
