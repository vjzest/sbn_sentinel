import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("{activeTab === 'revenue' && <RevenueReportsView />}", "{activeTab === 'revenue-reports' && <RevenueReportsView />}")

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed tab mismatch in page.tsx")
