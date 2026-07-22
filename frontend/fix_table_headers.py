import sys

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('bg-[#FAFBFD]', 'bg-white/5')

with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed bg-[#FAFBFD] in SettingsView")
