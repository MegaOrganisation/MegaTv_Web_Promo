# -*- coding: utf-8 -*-
from pathlib import Path
import re

t = Path("src/app/route.ts").read_text(encoding="utf-8")
m = re.search(r'const PROMO_HTML = "(.*)";\n\nexport function GET', t, re.S)
if not m:
    raise SystemExit("no PROMO_HTML")
s = m.group(1)
html = s.replace("\\\\", "\0").replace("\\n", "\n").replace('\\"', '"').replace("\\'", "'").replace("\0", "\\")
Path("scripts/_promo_dump.html").write_text(html, encoding="utf-8")

out = []
out.append(f"html len {len(html)}")
for label, pat in [
    ("nav", r"<nav[\s\S]{0,5000}?</nav>"),
    ("ecosystem", r"<!-- ===== ECOSYSTEME ===== -->[\s\S]{0,9000}<!-- ===== ACCOUNT"),
    ("hero-cta", r"hero-actions[\s\S]{0,1200}"),
    ("footer", r"<footer[\s\S]{0,5000}?</footer>"),
    ("account-buttons", r'id="account"[\s\S]{0,6000}'),
]:
    mm = re.search(pat, html)
    out.append(f"\n==== {label} ====")
    out.append(mm.group(0)[:9000] if mm else "NOT FOUND")

out.append("\n==== links of interest ====")
for mm in re.finditer(r'href="([^"]+)"', html):
    h = mm.group(1)
    if any(x in h for x in ["/web", "/login", "/companion", "/acces", "auth", "download", "github", "#eco", "#feat", "#pric", "#acc", "api/download"]):
        out.append(h)

Path("scripts/_promo_inspect.txt").write_text("\n".join(out), encoding="utf-8")
print("ok", len(html))
