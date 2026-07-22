import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_filter = 'filter: invert(0.92) sepia(0.6) hue-rotate(220deg) saturate(1.5) !important;'
new_filter = 'filter: invert(0.88) sepia(0.9) hue-rotate(225deg) saturate(3.5) brightness(0.8) !important;'
code = code.replace(old_filter, new_filter)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
