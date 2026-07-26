import urllib.request
import json
from urllib.error import HTTPError

try:
    data = json.dumps({"email": "superadmin@sbnsentinel.com", "password": "wrong"}).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/auth/login", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        print("Auth Check:", json.loads(response.read().decode()))
except HTTPError as e:
    print("Auth Check Failed:", e.code)
    print("Response Body:", e.read().decode())
except Exception as e:
    print("Auth Check Exception:", e)
