import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_style = '''      {isDarkMode && (
        <style dangerouslySetInnerHTML={{
          __html: 
          html {
            /* 
              invert(0.93) turns white into dark grey (#121212) instead of pure black.
              sepia(0.4) adds a warm brownish tint.
              hue-rotate(195deg) shifts that brown into a beautiful rich dark blue/slate!
              saturate(1.2) boosts the blue slightly.
            */
            filter: invert(0.93) sepia(0.4) hue-rotate(195deg) saturate(1.2) !important;
            background-color: #0B1121 !important;
          }
          img, video, aside {
            filter: invert(1) hue-rotate(180deg) !important;
          }
        }} />
      )}'''

new_style = '''      {isDarkMode && (
        <style dangerouslySetInnerHTML={{
          __html: 
          html, body, .bg-\\[\\#F7F9FC\\] {
            background-color: #120524 !important;
          }
          /* Apply filter ONLY to main content so the sidebar stays exactly its premium purple */
          main {
            filter: invert(0.92) sepia(0.6) hue-rotate(220deg) saturate(1.5) !important;
          }
          main img, main video {
            filter: invert(1) hue-rotate(180deg) !important;
          }
        }} />
      )}'''

code = code.replace(old_style, new_style)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
