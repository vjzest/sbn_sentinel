import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_css = '''          img, video {
            filter: invert(1) hue-rotate(180deg) !important;
          }'''

new_css = '''          img, video, aside {
            filter: invert(1) hue-rotate(180deg) !important;
          }'''

code = code.replace(old_css, new_css)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
