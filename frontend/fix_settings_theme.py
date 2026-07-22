import sys

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Main Wrappers
content = content.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
)
content = content.replace(
    'bg-white border border-[#E8EDF5] rounded-[24px]',
    'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
)
content = content.replace('bg-white', 'bg-[#120524]')

# 2. Text Colors
content = content.replace('text-[#111827]', 'text-white')
content = content.replace('text-[#6B7280]', 'text-white/70')
content = content.replace('text-[#4B5563]', 'text-white/60')
content = content.replace('text-[#9CA3AF]', 'text-white/50')
content = content.replace('text-gray-900', 'text-white')
content = content.replace('text-gray-600', 'text-white/70')
content = content.replace('text-gray-500', 'text-white/60')

# 3. Borders & Dividers
content = content.replace('border-[#E8EDF5]', 'border-white/10')
content = content.replace('border-[#F3F4F6]', 'border-white/10')
content = content.replace('border-gray-200', 'border-white/10')
content = content.replace('border-gray-100', 'border-white/10')
content = content.replace('bg-[#E8EDF5]', 'bg-white/10')
content = content.replace('bg-[#F3F4F6]', 'bg-white/10')

# 4. Backgrounds & Cards
content = content.replace('bg-[#F7F9FC]', 'bg-white/5')
content = content.replace('bg-[#F9FAFB]', 'bg-white/5')
content = content.replace('bg-gray-50', 'bg-white/5')
content = content.replace('hover:bg-[#F3F4F6]', 'hover:bg-white/10')
content = content.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')
content = content.replace('hover:bg-gray-50', 'hover:bg-white/10')
content = content.replace('hover:bg-gray-100', 'hover:bg-white/10')

# 5. Form Elements Focus State
content = content.replace('focus:bg-white', 'focus:bg-white/10')

# 6. Checkbox / Specific Modals
content = content.replace('bg-[#120524]/5', 'bg-white/5')
content = content.replace('bg-[#120524]/10', 'bg-white/10')
content = content.replace('bg-[#120524]/20', 'bg-white/10')
content = content.replace('text-[#120524]', 'text-white')
content = content.replace('border-[#120524]/10', 'border-white/10')

# Specific for Save Button (It already has bg-gradient-to-r from-[#2E1055] to-[#120524])
# No change needed there.

# Write back
with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed SettingsView styling")
