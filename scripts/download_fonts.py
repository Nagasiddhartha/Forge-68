import urllib.request
import re
import os

url = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Hanken+Grotesk:wght@400;500&family=IBM+Plex+Mono:wght@400&display=swap'
req = urllib.request.Request(
    url,
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)
content = urllib.request.urlopen(req).read().decode('utf-8')

os.makedirs('frontend/public/fonts', exist_ok=True)

blocks = content.split('/* ')
saved = []
for b in blocks:
    if not b.strip():
        continue
    subset = b.split(' */')[0].strip()
    if subset != 'latin':
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", b)
    w = re.search(r"font-weight:\s*(\d+)", b)
    u = re.search(r"src:\s*url\((https://[^\)]+\.woff2)\)", b)
    if fam and w and u:
        fname = f"{fam.group(1).lower().replace(' ', '-')}-{w.group(1)}.woff2"
        out_path = os.path.join('frontend/public/fonts', fname)
        if not os.path.exists(out_path):
            font_bytes = urllib.request.urlopen(u.group(1)).read()
            with open(out_path, 'wb') as f:
                f.write(font_bytes)
            print(f"Downloaded {fname} ({len(font_bytes)} bytes)")
        else:
            print(f"Already exists: {fname}")
        saved.append(fname)

print("Done. Saved fonts:", saved)
