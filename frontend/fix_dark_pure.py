import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_style = '''      {isDarkMode && (
        <style dangerouslySetInnerHTML={{
          __html: 
          html, body {
            background-color: #120524 !important;
          }
          main {
            filter: invert(0.88) sepia(0.9) hue-rotate(225deg) saturate(3.5) brightness(0.8) !important;
          }
          main img, main video {
            filter: invert(1) hue-rotate(180deg) !important;
          }
        }} />
      )}'''

new_style = '''      {isDarkMode && (
        <style dangerouslySetInnerHTML={{
          __html: 
          html, body {
            background-color: #0c0418 !important;
          }
          main {
            background-color: transparent !important;
            border-color: rgba(255,255,255,0.05) !important;
          }
          /* Override all white/light backgrounds to dark purple cards */
          main .bg-white, main .bg-white\\\\/80, main .bg-white\\\\/60, main .bg-white\\\\/50, main .bg-slate-50, main .bg-gray-50 {
            background-color: #1a0b2e !important;
            border-color: rgba(255,255,255,0.05) !important;
          }
          main .bg-\\\\[\\\\#F3F4F6\\\\], main .bg-\\\\[\\\\#F7F9FC\\\\] {
            background-color: #241142 !important;
          }
          
          /* Override text colors to light */
          main .text-\\\\[\\\\#111827\\\\], main .text-\\\\[\\\\#0F172A\\\\], main .text-slate-900, main .text-slate-800, main .text-gray-900 {
            color: #ffffff !important;
          }
          main .text-\\\\[\\\\#6B7280\\\\], main .text-\\\\[\\\\#4B5563\\\\], main .text-\\\\[\\\\#475569\\\\], main .text-slate-500, main .text-gray-500, main .text-slate-600 {
            color: rgba(255,255,255,0.6) !important;
          }
          
          /* Borders */
          main .border-\\\\[\\\\#E8EDF5\\\\], main .border-\\\\[\\\\#E2E8F0\\\\], main .border-gray-200, main .border-slate-200 {
            border-color: rgba(255,255,255,0.05) !important;
          }
          
          /* Inputs */
          main input {
            color: white !important;
          }
          main input::placeholder {
            color: rgba(255,255,255,0.4) !important;
          }
          
          /* Fix specific icons or text that needs to remain green/red */
          main .text-\\\\[\\\\#10B981\\\\] { color: #10B981 !important; }
          main .text-\\\\[\\\\#EF4444\\\\] { color: #EF4444 !important; }
        }} />
      )}'''

# We also need to fix the wrapper background because I previously set it to:
# <div className={lex h-screen  ...
# It should be #0c0418 to match the body.
code = code.replace("bg-[#120524]", "bg-[#0c0418]")

code = code.replace(old_style, new_style)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
