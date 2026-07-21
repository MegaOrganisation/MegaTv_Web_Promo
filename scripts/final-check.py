# -*- coding: utf-8 -*-
from pathlib import Path
import re

t = Path("src/app/route.ts").read_text(encoding="utf-8")
m = re.search(r'const PROMO_HTML = "(.*)";\n\nexport function GET', t, re.S)
html = m.group(1).replace("\\\\", "\0").replace("\\n", "\n").replace('\\"', '"').replace("\0", "\\")
Path("scripts/_promo_dump.html").write_text(html, encoding="utf-8")

idx_eco = html.find('id="ecosysteme"')
idx_feat = html.find('id="features"')
idx_hero_web = html.find('hero.ctaWeb')
print("eco before features", idx_eco < idx_feat, idx_eco, idx_feat)
print("hero snippet:", html[html.find("hero-ctas"): html.find("hero-ctas")+500])
print("eco logos", "eco-logos" in html)
print("auth", "megatv-auth-site.vercel.app" in html)
print("/web count", html.count('href="/web"'))
print("apk", html.count("/api/download/android"))
# show eco cards labels
for label in ["Découvrir MegaTv", "Connexion Cloud", "MegaCompagnon", "Application Web", "App Android"]:
    print(label, label in html)
