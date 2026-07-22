import sys

with open('app/api/v1/api.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import
old_import = "from app.api.v1.endpoints import reality_connectors, signals, auth, insurance, audit, settings, encounters, super_admin"
new_import = "from app.api.v1.endpoints import reality_connectors, signals, auth, insurance, audit, settings, encounters, super_admin, billing"
code = code.replace(old_import, new_import)

# Add route
old_route = "api_router.include_router(super_admin.router, prefix=\"/super-admin\", tags=[\"006_Super_Admin\"])"
new_route = "api_router.include_router(super_admin.router, prefix=\"/super-admin\", tags=[\"006_Super_Admin\"])\napi_router.include_router(billing.router, prefix=\"/billing\", tags=[\"007_Billing\"])"
code = code.replace(old_route, new_route)

with open('app/api/v1/api.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
