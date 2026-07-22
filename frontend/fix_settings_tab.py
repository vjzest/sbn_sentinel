import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "{activeTab === 'settings' && (",
    "{activeTab.startsWith('settings') && ("
)

code = code.replace(
    "<SettingsView \n                onSaveSettings={(data) => {",
    "<SettingsView \n                activeMenuProp={activeTab === 'settings' ? 'general' : activeTab.replace('settings-', '')}\n                onSaveSettings={(data) => {"
)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed settings tab bug in page.tsx")
