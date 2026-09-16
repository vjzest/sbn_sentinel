import base64

img_path = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.png'
out_path = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.svg'

with open(img_path, 'rb') as f:
    img_data = f.read()

b64_str = base64.b64encode(img_data).decode('utf-8')

svg_content = f"""<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="darkThemeEnhance">
      <!-- Boost contrast and brightness for dark mode -->
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.2" intercept="0.05" />
        <feFuncG type="linear" slope="1.2" intercept="0.05" />
        <feFuncB type="linear" slope="1.5" intercept="0.1" />
      </feComponentTransfer>
      <!-- Drop shadow to make it pop -->
      <feDropShadow dx="0" dy="0" stdDeviation="15" flood-color="#F8B500" flood-opacity="0.3" />
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64_str}" width="100%" height="100%" filter="url(#darkThemeEnhance)" />
</svg>"""

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('SVG generated successfully.')
