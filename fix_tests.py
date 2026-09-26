import os, re
files = ['backend/tests/integration/test_governance.py', 'backend/tests/integration/test_d7_runtime_status.py']
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    content = re.sub(r'access_token=[\"\'][a-zA-Z0-9_]+[\"\']', 'config={\"client_id\": \"test\", \"base_url\": \"http://test\"}', content)
    content = re.sub(r'access_token=None', 'config={}', content)
    content = re.sub(r'pf1\.access_token = [\"\'][a-zA-Z0-9_]+[\"\']', 'pf1.config = {\"client_id\": \"test\", \"base_url\": \"http://test\"}', content)
    with open(f, 'w') as file:
        file.write(content)
