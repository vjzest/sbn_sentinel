import cv2
import numpy as np

img_path = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.png'
img = cv2.imread(img_path)
if img is None:
    print('Failed to read logo.png')
    exit()

# Extract bright pixels
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

svg_out = 'c:/Users/User/Desktop/frontend_practice/New folder/sbnSentinal/sbn-sentinel/frontend/public/logo.svg'
h, w = img.shape[:2]

with open(svg_out, 'w') as f:
    f.write(f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">\n')
    
    # We will add gradients based on position to simulate the gold/silver
    f.write('''
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCEABB" />
        <stop offset="50%" stop-color="#F8B500" />
        <stop offset="100%" stop-color="#B27900" />
      </linearGradient>
      <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="50%" stop-color="#B0B5B9" />
        <stop offset="100%" stop-color="#73797E" />
      </linearGradient>
    </defs>
    ''')

    for cnt in contours:
        if len(cnt) > 5:
            # Approximate the contour to smooth it and reduce path size
            epsilon = 0.005 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)
            
            # Determine color by checking x position (simplistic: left is gold, right/top is silver)
            # The original logo has gold I and swirl, silver A, K, crown
            x, y, w_cnt, h_cnt = cv2.boundingRect(approx)
            color = 'url(#gold)' if x < w * 0.4 or (y > h * 0.4 and x < w * 0.7) else 'url(#silver)'
            
            path_data = 'M ' + ' L '.join([f'{pt[0][0]},{pt[0][1]}' for pt in approx]) + ' Z'
            f.write(f'  <path d="{path_data}" fill="{color}" />\n')

    f.write('</svg>')
print(f'SVG created with {len(contours)} paths')
