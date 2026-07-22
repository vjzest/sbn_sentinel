import sys, re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We look for the Revenue Reports item to know where to insert
search_pattern = r"(<SidebarItem icon=\{DollarSign\} label=\"Revenue Reports\".*?\n\s*\)\}\n\s*</div>\n\s*</div>)"

replacement_addition = '''
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 px-4 mt-4">Settings & Config</p>
                <div className="space-y-1">
                  {['org_admin', 'super_admin', 'clinic_admin'].includes(userRole) && (
                    <>
                      <SidebarItem icon={Settings} label="General Settings" active={activeTab === 'settings-general'} onClick={() => setActiveTab('settings-general')} />
                      <SidebarItem icon={BrainCircuit} label="AI Preferences" active={activeTab === 'settings-ai'} onClick={() => setActiveTab('settings-ai')} />
                      <SidebarItem icon={Sparkles} label="AI Costs & Usage" active={activeTab === 'settings-ai-usage'} onClick={() => setActiveTab('settings-ai-usage')} />
                      <SidebarItem icon={Users} label="Team & Access" active={activeTab === 'settings-team'} onClick={() => setActiveTab('settings-team')} />
                      <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'settings-notifications'} onClick={() => setActiveTab('settings-notifications')} />
                      <SidebarItem icon={Database} label="Integrations" active={activeTab === 'settings-integrations'} onClick={() => setActiveTab('settings-integrations')} />
                      <SidebarItem icon={CreditCard} label="Billing & Plans" active={activeTab === 'settings-billing'} onClick={() => setActiveTab('settings-billing')} />
                      <SidebarItem icon={Shield} label="Compliance & Audits" active={activeTab === 'settings-security'} onClick={() => setActiveTab('settings-security')} />
                    </>
                  )}
                </div>
              </div>'''

def replacer(match):
    return match.group(1) + replacement_addition

new_code = re.sub(search_pattern, replacer, code)

# Remove the old 'Settings' item from the bottom section
new_code = new_code.replace('<SidebarItem icon={Settings} label="Settings" active={activeTab === \'settings\'} onClick={() => setActiveTab(\'settings\')} />', '')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Settings appended using regex.")
