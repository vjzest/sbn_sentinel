from PIL import Image
import base64
import io
import math

img_path = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.png'
out_path = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.svg'

img = Image.open(img_path)
img = img.convert('RGBA')

data = img.getdata()
new_data = []

# Soft thresholding for anti-aliasing
for item in data:
    r, g, b, a = item
    
    # Calculate perceived brightness
    brightness = 0.299 * r + 0.587 * g + 0.114 * b
    
    # The background is very dark (mostly around RGB 15,15,20)
    # We create a soft mask: brightness < 20 -> alpha 0
    # brightness > 60 -> alpha 255
    # in between -> smooth transition
    
    if brightness < 20:
        alpha = 0
    elif brightness > 80:
        alpha = 255
    else:
        # Smooth interpolation between 20 and 80
        factor = (brightness - 20) / 60.0
        alpha = int(255 * (factor ** 1.5))  # curve it to keep dark edges softer
        
    new_data.append((r, g, b, alpha))

img.putdata(new_data)

buffered = io.BytesIO()
img.save(buffered, format='PNG')
b64_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

svg_content = f"""<svg viewBox="0 0 {img.width} {img.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#F8B500" flood-opacity="0.3" />
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64_str}" width="100%" height="100%" filter="url(#glow)" />
</svg>"""

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('Background removed and SVG saved.')
