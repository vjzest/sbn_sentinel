with open('src/components/CommandCenter/SuperAdminPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('http://localhost:8000/api/v1/super-admin/users/${userId}/toggle', '${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/super-admin/users/${userId}/toggle')

with open('src/components/CommandCenter/SuperAdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
