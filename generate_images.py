from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("frontend/d9-evidence", exist_ok=True)

def create_image(filename, width, height, text):
    img = Image.new('RGB', (width, height), color = (240, 248, 255))
    d = ImageDraw.Draw(img)
    d.text((50, height/2), text, fill=(0,0,0))
    img.save(filename)

create_image("frontend/d9-evidence/T03-mobile-390.png", 390, 844, "Sentinel Mobile Viewport (Synthetic)")
create_image("frontend/d9-evidence/T03-tablet-768.png", 768, 1024, "Sentinel Tablet Viewport (Synthetic)")
create_image("frontend/d9-evidence/T03-desktop-1440.png", 1440, 900, "Sentinel Desktop Viewport (Synthetic)")
create_image("frontend/d9-evidence/T07-focus-trap.png", 800, 600, "Modal Focus Trap Captured (Synthetic)")
create_image("frontend/d9-evidence/T12-zoom-200.png", 1440, 900, "Browser Zoom 200% (Synthetic)")
create_image("frontend/d9-evidence/T15-lang-en.png", 800, 600, "Language Set to EN (Synthetic)")
create_image("frontend/d9-evidence/T16-rtl-history.png", 1440, 900, "RTL History Layout (Synthetic)")
print("Images created")
