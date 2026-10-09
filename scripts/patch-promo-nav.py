# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
route = root / "src" / "app" / "route.ts"
text = route.read_text(encoding="utf-8")
match = re.search(r"const PROMO_HTML = (\".*\");\s*\nexport function GET", text, re.S)
if not match:
    raise SystemExit("PROMO_HTML not found")

html = json.loads(match.group(1))

burger = """
    <button type="button" class="nav-burger" id="nav-burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-sheet">
      <svg class="nav-burger-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      <svg class="nav-burger-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
"""

sheet = """
  <div class="nav-sheet" id="nav-sheet" hidden>
    <a href="/" class="nav-sheet-link active">Home</a>
    <a href="/premium" class="nav-sheet-link premium">Premium</a>
    <a href="/companion" class="nav-sheet-link">Compagnon</a>
    <div class="nav-sheet-divider"></div>
    <div class="nav-sheet-row">
      <span>Langue</span>
      <select id="promo-lang-select-mobile" class="nav-sheet-select" onchange="changeLanguage(this.value)" aria-label="Langue">
        <option value="fr" selected>FR</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </div>
    <button type="button" class="nav-sheet-link" onclick="toggleTheme()">Thème</button>
    <div class="nav-sheet-divider"></div>
    <a href="/login" id="nav-sheet-login" class="nav-sheet-link">Connexion</a>
    <div id="nav-sheet-account" class="nav-sheet-account" hidden></div>
  </div>
"""

if 'id="nav-burger"' not in html:
    close = html.find("</header>")
    if close < 0:
        raise SystemExit("header close missing")
    html = html[:close] + burger + html[close:]
    close = html.find("</header>")
    html = html[: close + len("</header>")] + sheet + html[close + len("</header>") :]

html = html.replace("styles.css?v=2026logos", "styles.css?v=2026resp")
html = html.replace("app.js?v=2026logos", "app.js?v=2026resp")
html = html.replace(
    'style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;"',
    'style="grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px;"',
)

out = (
    'export const dynamic = "force-static";\n\n'
    "const PROMO_HTML = "
    + json.dumps(html, ensure_ascii=False)
    + ";\n\n"
    "export function GET() {\n"
    "  return new Response(PROMO_HTML, {\n"
    '    headers: {\n'
    '      "Content-Type": "text/html; charset=utf-8"\n'
    "    }\n"
    "  });\n"
    "}\n"
)
route.write_text(out, encoding="utf-8")
print("patched", route, "html", len(html), "burger", 'id="nav-burger"' in html)
