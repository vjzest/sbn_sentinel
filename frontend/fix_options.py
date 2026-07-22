import sys

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<option>', '<option className="bg-[#120524] text-white">')

with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed options in SettingsView")
