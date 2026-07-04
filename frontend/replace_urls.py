import os
import re

directory = r"c:\Users\User\Desktop\New folder\sbnSentinal\sbn-sentinel\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r"'http://localhost:8000(.*?)'", r"`${process.env.NEXT_PUBLIC_BACKEND_URL}\1`", content)
    new_content = re.sub(r'"http://localhost:8000(.*?)"', r"`${process.env.NEXT_PUBLIC_BACKEND_URL}\1`", new_content)
    
    new_content = re.sub(r"'ws://localhost:8000(.*?)'", r"`${process.env.NEXT_PUBLIC_BACKEND_WS_URL}\1`", new_content)
    new_content = re.sub(r'"ws://localhost:8000(.*?)"', r"`${process.env.NEXT_PUBLIC_BACKEND_WS_URL}\1`", new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, file))
