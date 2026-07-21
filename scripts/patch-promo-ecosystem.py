# -*- coding: utf-8 -*-
"""Patch promo landing HTML in src/app/route.ts — ecosystem section + nav."""
from pathlib import Path

path = Path("src/app/route.ts")
text = path.read_text(encoding="utf-8")

old_nav = (
    r'<div class=\"nav-links\">\n'
    r'      <a href=\"#features\" class=\"nav-link\" data-i18n=\"nav.features\">Fonctionnalités</a>\n'
    r'      <a href=\"#pricing\" class=\"nav-link\" data-i18n=\"nav.pricing\">Tarifs</a>\n'
    r'      <a href=\"/companion\" class=\"nav-link\" data-i18n=\"nav.account\">Connexion MegaCompagnon</a>\n'
    r'      <a href=\"/web\" class=\"nav-link\" data-i18n=\"nav.web\">Application Web</a>\n'
    r'      <a href=\"/acces\" class=\"nav-link\" data-i18n=\"nav.access\">Accès</a>\n'
    r'    </div>'
)

new_nav = (
    r'<div class=\"nav-links\">\n'
    r'      <a href=\"#features\" class=\"nav-link\" data-i18n=\"nav.features\">Fonctionnalités</a>\n'
    r'      <a href=\"#pricing\" class=\"nav-link\" data-i18n=\"nav.pricing\">Tarifs</a>\n'
    r'      <a href=\"#ecosysteme\" class=\"nav-link\" data-i18n=\"nav.access\">Accès</a>\n'
    r'    </div>'
)

if old_nav not in text:
    raise SystemExit("nav block not found")
text = text.replace(old_nav, new_nav, 1)

eco = r'''
<!-- ===== ECOSYSTEME ===== -->
<section id=\"ecosysteme\" data-screen-label=\"Ecosystem\">
  <div class=\"reveal center\" style=\"margin-bottom:48px;\">
    <div class=\"eyebrow\"><span data-i18n=\"eco.eyebrow\">Écosystème MegaTv</span></div>
    <h2 class=\"section-title\" data-i18n=\"eco.title\">Tous vos espaces, un seul univers.</h2>
    <p class=\"section-sub\" data-i18n=\"eco.sub\">Présentation, connexion cloud, Companion, app web et Android — chaque porte mène au bon endroit.</p>
  </div>
  <div class=\"eco-grid reveal\" data-stagger>
    <a href=\"#features\" class=\"eco-card eco-card--discover\">
      <div class=\"eco-card__preview\" aria-hidden=\"true\">
        <img class=\"eco-card__shot eco-card__shot--back\" src=\"assets/tv-home.png\" alt=\"\">
        <img class=\"eco-card__shot eco-card__shot--front\" src=\"assets/phone-home.png\" alt=\"\">
      </div>
      <div class=\"eco-card__icon\" aria-hidden=\"true\">
        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 7h16v10H4z\"/><path d=\"M8 21h8\"/><path d=\"M12 17v4\"/></svg>
      </div>
      <div class=\"eco-card__body\">
        <div class=\"eco-card__label\" data-i18n=\"eco.discover\">Découvrir MegaTv</div>
        <p class=\"eco-card__hint\" data-i18n=\"eco.discover.sub\">Fonctionnalités, écrans TV &amp; mobile, formules — la vitrine produit.</p>
        <span class=\"eco-card__cta\" data-i18n=\"eco.discover.cta\">Explorer →</span>
      </div>
    </a>
    <a href=\"https://megatv-auth-site.vercel.app/\" class=\"eco-card eco-card--auth\" target=\"_blank\" rel=\"noopener noreferrer\">
      <div class=\"eco-card__preview eco-card__preview--mark\" aria-hidden=\"true\">
        <img src=\"assets/mark.png\" alt=\"\">
      </div>
      <div class=\"eco-card__icon\" aria-hidden=\"true\">
        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"/></svg>
      </div>
      <div class=\"eco-card__body\">
        <div class=\"eco-card__label\" data-i18n=\"eco.auth\">Connexion Cloud</div>
        <p class=\"eco-card__hint\" data-i18n=\"eco.auth.sub\">ID MegaTv — login, inscription et pairing TV sécurisé.</p>
        <span class=\"eco-card__cta\" data-i18n=\"eco.auth.cta\">Se connecter →</span>
      </div>
    </a>
    <a href=\"/companion\" class=\"eco-card eco-card--companion\">
      <div class=\"eco-card__preview\" aria-hidden=\"true\">
        <img class=\"eco-card__shot eco-card__shot--wide\" src=\"assets/web-screens/landscape-rail.png\" alt=\"\">
        <img class=\"eco-card__shot eco-card__shot--front\" src=\"assets/companion-splash-preview.png\" alt=\"\">
      </div>
      <div class=\"eco-card__icon\" aria-hidden=\"true\">
        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4 6h16v12H4z\"/><path d=\"M8 18v2h8v-2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/></svg>
      </div>
      <div class=\"eco-card__body\">
        <div class=\"eco-card__label\" data-i18n=\"eco.companion\">MegaCompagnon</div>
        <p class=\"eco-card__hint\" data-i18n=\"eco.companion.sub\">Dashboard cloud : stats, profils, appareils, calendrier.</p>
        <span class=\"eco-card__cta\" data-i18n=\"eco.companion.cta\">Ouvrir Companion →</span>
      </div>
    </a>
    <a href=\"/web\" class=\"eco-card eco-card--web\">
      <div class=\"eco-card__preview\" aria-hidden=\"true\">
        <img class=\"eco-card__shot eco-card__shot--wide\" src=\"assets/web-screens/top10.png\" alt=\"\">
        <img class=\"eco-card__shot eco-card__shot--front\" src=\"assets/web-screens/cw-card.png\" alt=\"\">
      </div>
      <div class=\"eco-card__icon\" aria-hidden=\"true\">
        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18\"/><path d=\"M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z\"/></svg>
      </div>
      <div class=\"eco-card__body\">
        <div class=\"eco-card__label\" data-i18n=\"eco.web\">Application Web</div>
        <p class=\"eco-card__hint\" data-i18n=\"eco.web.sub\">Films, séries et IPTV dans le navigateur — même compte cloud.</p>
        <span class=\"eco-card__cta\" data-i18n=\"eco.web.cta\">Lancer l'app web →</span>
      </div>
    </a>
    <a href=\"/api/download/android\" class=\"eco-card eco-card--android eco-card--wide\">
      <div class=\"eco-card__preview\" aria-hidden=\"true\">
        <img class=\"eco-card__shot eco-card__shot--back\" src=\"assets/phone-search.png\" alt=\"\">
        <img class=\"eco-card__shot eco-card__shot--front\" src=\"assets/phone-detail.png\" alt=\"\">
      </div>
      <div class=\"eco-card__icon eco-card__icon--android\" aria-hidden=\"true\">
        <svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z\"/></svg>
      </div>
      <div class=\"eco-card__body\">
        <div class=\"eco-card__label\" data-i18n=\"eco.android\">App Android</div>
        <p class=\"eco-card__hint\" data-i18n=\"eco.android.sub\">Android TV · Mobile · Fire TV — APK toujours à jour (dernière release).</p>
        <span class=\"eco-card__cta\" data-i18n=\"eco.android.cta\">Télécharger l'APK →</span>
      </div>
    </a>
  </div>
</section>

'''

# Insert before ACCOUNT section
marker = "<!-- ===== ACCOUNT / COMPANION ===== -->"
if marker not in text:
    raise SystemExit("account marker not found")
if 'id=\\"ecosysteme\\"' not in text:
    text = text.replace(marker, eco + marker, 1)
else:
    print("ecosystem already present, skip insert")

# Update account companion CTA to auth site + simplify
text = text.replace(
    r'<a class=\"btn-spectrum\" href=\"/companion\" style=\"justify-content:center;text-decoration:none;\" data-i18n=\"acc.companion.cta\">Accès MegaCompagnon</a>',
    r'<a class=\"btn-spectrum\" href=\"#ecosysteme\" style=\"justify-content:center;text-decoration:none;\" data-i18n=\"acc.companion.cta\">Voir l\'écosystème</a>',
)

# Pricing free CTA → stable APK
text = text.replace(
    r'<button class=\"btn-price btn-price-outline\" data-i18n=\"plan.free.cta\">Télécharger gratuitement</button>',
    r'<a href=\"/api/download/android\" class=\"btn-price btn-price-outline\" data-i18n=\"plan.free.cta\" style=\"display:block;text-align:center;text-decoration:none;\">Télécharger gratuitement</a>',
)

# Hero download CTA
text = text.replace(
    r'<a href=\"#pricing\" class=\"btn-spectrum lg\">\n      <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M5 3.5v17a1 1 0 0 0 1.5.87l14-8.5a1 1 0 0 0 0-1.74l-14-8.5A1 1 0 0 0 5 3.5z\"/></svg>\n      <span data-i18n=\"hero.cta1\">Télécharger gratuitement</span>\n    </a>',
    r'<a href=\"/api/download/android\" class=\"btn-spectrum lg\">\n      <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M5 3.5v17a1 1 0 0 0 1.5.87l14-8.5a1 1 0 0 0 0-1.74l-14-8.5A1 1 0 0 0 5 3.5z\"/></svg>\n      <span data-i18n=\"hero.cta1\">Télécharger gratuitement</span>\n    </a>',
)

# bump css cache
text = text.replace("styles.css?v=2026h", "styles.css?v=2026i")

path.write_text(text, encoding="utf-8")
print("OK patched", path)
