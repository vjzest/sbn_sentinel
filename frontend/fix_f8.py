import sys

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('bg-[#F8FAFC]', 'bg-white/5')
content = content.replace('text-gray-900', 'text-white')
content = content.replace('text-gray-700', 'text-white/70')

with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed bg-[#F8FAFC] in SettingsView")
