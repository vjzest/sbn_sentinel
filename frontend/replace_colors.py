import os
import glob

# The mapping of old vibrant purples to the new dark elite purples
color_map = {
    '#6C4CF5': '#2E1055',  # Primary
    '#6D5DF6': '#2E1055',  # Primary alt
    '#8B3DFF': '#4527A0',  # Hover / Accent
    '#5B4AE8': '#120524',  # Hover dark
    '#7C3AED': '#120524',  # Secondary
    'bg-[#6C4CF5]': 'bg-[#2E1055]',
    'text-[#6C4CF5]': 'text-[#2E1055]',
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for old_color, new_color in color_map.items():
        content = content.replace(old_color, new_color)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated colors in {filepath}")

# Recursively find all TSX files
tsx_files = glob.glob('src/**/*.tsx', recursive=True)
for f in tsx_files:
    replace_in_file(f)

print("Color replacement complete.")
