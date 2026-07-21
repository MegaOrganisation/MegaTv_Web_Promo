# -*- coding: utf-8 -*-
"""Polish landing: feature ecosystem, stable links, no /acces page."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
route = ROOT / "src/app/route.ts"
raw = route.read_text(encoding="utf-8")
m = re.search(r'const PROMO_HTML = "(.*)";\n\nexport function GET', raw, re.S)
if not m:
    raise SystemExit("PROMO_HTML not found")

def decode(s: str) -> str:
    return s.replace("\\\\", "\0").replace("\\n", "\n").replace('\\"', '"').replace("\\'", "'").replace("\0", "\\")

def encode(html: str) -> str:
    return html.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

html = decode(m.group(1))

# --- Extract ecosystem block ---
eco_re = re.compile(
    r"\n<!-- ===== ECOSYSTEME ===== -->\n<section id=\"ecosysteme\"[\s\S]*?</section>\n",
    re.M,
)
eco_m = eco_re.search(html)
if not eco_m:
    raise SystemExit("ecosystem section not found")
eco = eco_m.group(0)
html = html[: eco_m.start()] + html[eco_m.end() :]

# Enrich ecosystem: platform logos strip + auth preview fan + copy tweaks
eco = eco.replace(
    """  <div class="reveal center" style="margin-bottom:48px;">
    <div class="eyebrow"><span data-i18n="eco.eyebrow">Écosystème MegaTv</span></div>
    <h2 class="section-title" data-i18n="eco.title">Tous vos espaces, un seul univers.</h2>
    <p class="section-sub" data-i18n="eco.sub">Présentation, connexion cloud, Companion, app web et Android — chaque porte mène au bon endroit.</p>
  </div>
""",
    """  <div class="reveal center" style="margin-bottom:36px;">
    <div class="eyebrow"><span data-i18n="eco.eyebrow">Écosystème MegaTv</span></div>
    <h2 class="section-title" data-i18n="eco.title">Tous vos espaces, un seul univers.</h2>
    <p class="section-sub" data-i18n="eco.sub">Découvrir MegaTv, connexion cloud, Companion, app web et Android — chaque porte mène au bon endroit.</p>
    <div class="eco-logos" aria-label="Surfaces MegaTv">
      <span class="eco-logo"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>Android</span>
      <span class="eco-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 20h8"/><path d="M12 18v2"/></svg>Android TV</span>
      <span class="eco-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>App Web</span>
      <span class="eco-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M8 18v2h8v-2"/></svg>Companion</span>
      <span class="eco-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Cloud ID</span>
    </div>
  </div>
""",
)

eco = eco.replace(
    """Fonctionnalités, écrans TV &amp; mobile, formules — la vitrine produit.""",
    """Fonctionnalités, écrans TV &amp; mobile, formules — l'univers produit.""",
)

# Auth card: fan preview (mark + splash) instead of lone mark
eco = eco.replace(
    """    <a href="https://megatv-auth-site.vercel.app/" class="eco-card eco-card--auth" target="_blank" rel="noopener noreferrer">
      <div class="eco-card__preview eco-card__preview--mark" aria-hidden="true">
        <img src="assets/mark.png" alt="">
      </div>
""",
    """    <a href="https://megatv-auth-site.vercel.app/" class="eco-card eco-card--auth" target="_blank" rel="noopener noreferrer">
      <div class="eco-card__preview" aria-hidden="true">
        <img class="eco-card__shot eco-card__shot--back" src="assets/mark.png" alt="" style="object-fit:contain;padding:18px;background:#0e1420;">
        <img class="eco-card__shot eco-card__shot--front" src="assets/companion-splash-preview.png" alt="">
      </div>
""",
)

# Move ecosystem right after platforms (featured early)
anchor = "<!-- ===== FEATURES ===== -->"
if anchor not in html:
    raise SystemExit("features marker missing")
html = html.replace(anchor, eco + "\n" + anchor, 1)

# Hero: Accès instead of direct /web
html = html.replace(
    '<a href="/web" class="btn-ghost lg"><span data-i18n="hero.ctaWeb">Ouvrir l\'app web</span></a>',
    '<a href="#ecosysteme" class="btn-ghost lg"><span data-i18n="hero.ctaWeb">Accéder à MegaTv</span></a>',
)

# Account signup → auth site
html = html.replace(
    'href="/login?mode=signup&amp;next=%2Fcompanion"',
    'href="https://megatv-auth-site.vercel.app/" target="_blank" rel="noopener noreferrer"',
)

# Footer: Accès + stable APK link
html = html.replace(
    """        <li><a href="#features" data-i18n="nav.features">Fonctionnalités</a></li>
        <li><a href="#pricing" data-i18n="nav.pricing">Tarifs</a></li>
        <li><a href="/web" data-i18n="nav.web">Application Web</a></li>
        <li><a href="#pricing" data-i18n="footer.download">Télécharger</a></li>
""",
    """        <li><a href="#features" data-i18n="nav.features">Fonctionnalités</a></li>
        <li><a href="#pricing" data-i18n="nav.pricing">Tarifs</a></li>
        <li><a href="#ecosysteme" data-i18n="nav.access">Accès</a></li>
        <li><a href="/api/download/android" data-i18n="footer.download">Télécharger</a></li>
""",
)

# Cache-bust CSS
html = html.replace('styles.css?v=2026i', 'styles.css?v=2026j')
html = html.replace('styles.css?v=2026j', 'styles.css?v=2026j')  # idempotent
if 'styles.css?v=' not in html:
    html = html.replace('href="styles.css"', 'href="styles.css?v=2026j"')

new_raw = raw[: m.start(1)] + encode(html) + raw[m.end(1) :]
route.write_text(new_raw, encoding="utf-8")
print("route.ts updated", route.stat().st_size)

# sanity
html2 = decode(re.search(r'const PROMO_HTML = "(.*)";\n\nexport function GET', new_raw, re.S).group(1))
checks = {
    "eco early": html2.find('id="ecosysteme"') < html2.find('id="features"'),
    "no /web in nav/footer hero": '/web"' not in html2.split('id="ecosysteme"')[0] and html2.count('href="/web"') == 1,
    "auth site": "megatv-auth-site.vercel.app" in html2,
    "apk api": "/api/download/android" in html2,
    "no login signup": "/login?mode=signup" not in html2,
    "eco logos": "eco-logos" in html2,
}
for k, v in checks.items():
    print(k, "OK" if v else "FAIL")
