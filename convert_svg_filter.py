import base64

img_path = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.png'
out_path = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.svg'

with open(img_path, 'rb') as f:
    img_data = f.read()

b64_str = base64.b64encode(img_data).decode('utf-8')

svg_content = f"""<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="removeBg" color-interpolation-filters="sRGB">
      <!-- 1. Convert image luminance to alpha -->
      <feColorMatrix type="luminanceToAlpha" result="lum" />
      
      <!-- 2. Boost the alpha using linear transfer: slope=5, intercept=-0.5 
           This pushes dark areas (luminance < 0.1) to 0 alpha, 
           and bright areas (luminance > 0.3) to 1.0 alpha -->
      <feComponentTransfer in="lum" result="alphaMask">
        <feFuncA type="linear" slope="5" intercept="-0.5" />
      </feComponentTransfer>
      
      <!-- 3. Mask the original image with our new alpha channel -->
      <feComposite in="SourceGraphic" in2="alphaMask" operator="in" result="maskedImage" />
      
      <!-- 4. Boost the colors of the masked image so it pops on dark mode -->
      <feComponentTransfer in="maskedImage" result="enhanced">
        <feFuncR type="linear" slope="1.2" intercept="0.05" />
        <feFuncG type="linear" slope="1.2" intercept="0.05" />
        <feFuncB type="linear" slope="1.5" intercept="0.1" />
      </feComponentTransfer>

      <!-- 5. Add a subtle gold glow drop shadow -->
      <feDropShadow in="enhanced" dx="0" dy="0" stdDeviation="15" flood-color="#F8B500" flood-opacity="0.4" />
    </filter>
  </defs>
  <!-- We apply the filter to the image -->
  <image href="data:image/png;base64,{b64_str}" width="100%" height="100%" filter="url(#removeBg)" />
</svg>"""

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('SVG with background-removal filter generated.')
