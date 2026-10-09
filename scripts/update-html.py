# -*- coding: utf-8 -*-
from pathlib import Path

path = Path('templates/promo.html')
text = path.read_text(encoding='utf-8')

start_marker = '<!-- ===== STREMIO-INSPIRED FULL-SCREEN PROMO HERO (ISO PJ 2) ===== -->'
end_marker = '<!-- ===== PICK YOUR SCREEN SECTION ===== -->'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f"Markers not found! start: {start_idx}, end: {end_idx}")
    exit(1)

new_hero_and_banner = """<!-- ===== STREMIO-INSPIRED FULL-SCREEN PROMO HERO (ISO MEDIA_1791236710074) ===== -->
<section class="stremio-hero" id="hero" data-screen-label="Hero">
  <div class="stremio-hero-inner">
    <!-- Left Hero Editorial & Actions -->
    <div class="stremio-hero-content">
      <h1 class="stremio-title">
        La Liberté De Streamer
      </h1>
      <p class="stremio-sub">
        Découvrez tout le divertissement avec MegaTv
      </p>

      <div class="stremio-ctas">
        <a href="/api/download/android" class="btn-megatv-spectrum">
          <span>Télécharger MegaTv</span>
        </a>
        <a href="#telecharger" class="btn-stremio-outline">
          <span>Autres téléchargements</span>
        </a>
      </div>
    </div>

    <!-- Right 3D Perspective Fan-out Posters Cascade -->
    <div class="stremio-fan-stage">
      <div class="stremio-fan-cards">
        <div class="fan-card fan-card-1">
          <img src="assets/posters/poster-1.jpg" alt="MegaTv Découverte">
        </div>
        <div class="fan-card fan-card-2">
          <img src="assets/posters/poster-2.jpg" alt="MegaTv Accueil">
        </div>
        <div class="fan-card fan-card-3">
          <img src="assets/posters/poster-featured.jpg" alt="MegaTv Lecture">
        </div>
        <div class="fan-card fan-card-phone">
          <img src="assets/posters/poster-phone-hero.png" alt="MegaTv Mobile App">
        </div>
        <div class="fan-card fan-card-encanto">
          <img src="assets/posters/poster-encanto.jpg" alt="Encanto">
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== CHROMATIC AURORA SHOWCASE BANNER WITH DIAGONAL SLANTED CUT ===== -->
<section class="stremio-feature-banner">
  <div class="stremio-banner-inner">
    <!-- Left: Angled 3D Smart TV Screen Mockup with Stand -->
    <div class="stremio-banner-mockup">
      <div class="chromatic-tv-wrapper">
        <img src="assets/tv-chromatic-card.png" alt="MegaTv Smart TV Grand Écran" class="chromatic-tv-img">
      </div>
    </div>
    <!-- Right: Editorial & Supported Platforms Matrix -->
    <div class="stremio-banner-text">
      <p class="stremio-banner-editorial">
        MegaTv offre une expérience de divertissement sécurisée, moderne et transparente. Grâce à son interface conviviale. Grâce à son interface en charge du 4K HDR, les utilisateurs peuvent profiter de leurs films et émissions de télévision préférés sur tous leurs appareils. Grâce à son engagement en matière de sécurité, MegaTv est le meilleur choix pour une expérience de streaming de haute qualité et toute sérénité.
      </p>
      <div class="stremio-banner-platforms-matrix">
        <div class="stremio-platform-row">
          <span class="stremio-platform-item">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>
            Android
          </span>
          <span class="stremio-platform-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8"/><path d="M12 18v2"/></svg>
            Android TV
          </span>
          <span class="stremio-platform-item">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
            Windows
          </span>
          <span class="stremio-platform-item">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.88-.91.04-2.01.61-2.65 1.37-.57.65-1.07 1.73-.93 2.76 1.01.08 2.02-.51 2.65-1.25z"/></svg>
            MacOS
          </span>
          <span class="stremio-platform-item">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.002 0c-3.13 0-5.698 2.443-5.698 5.438 0 1.206.425 2.327 1.156 3.235C6.073 9.426 5.006 10.74 5.006 12.247c0 1.107.579 2.083 1.458 2.656-.632.748-1.026 1.696-1.026 2.735 0 2.447 2.215 4.438 4.954 4.438.309 0 .611-.027.906-.076.621.579 1.452.932 2.368.932 1.93 0 3.518-1.564 3.553-3.512 1.354-.537 2.321-1.83 2.321-3.364 0-1.19-.586-2.25-1.498-2.918.736-.706 1.2-1.688 1.2-2.776 0-1.693-1.127-3.132-2.695-3.568.513-.767.82-1.682.82-2.668C17.367 2.443 14.896 0 12.002 0z"/></svg>
            Linux
          </span>
        </div>
        <div class="stremio-platform-row">
          <span class="stremio-platform-item">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            LG TV
          </span>
          <span class="stremio-brand-name">SAMSUNG</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Slanted Diagonal Divider -->
<div class="slanted-divider" aria-hidden="true"></div>

"""

new_text = text[:start_idx] + new_hero_and_banner + text[end_idx:]

new_text = new_text.replace(
    '<!-- ===== FLAGSHIP FEATURES ===== -->',
    '<!-- Slanted Diagonal Divider -->\n<div class="slanted-divider" aria-hidden="true"></div>\n\n<!-- ===== FLAGSHIP FEATURES ===== -->'
)
new_text = new_text.replace(
    '<!-- ===== PREMIUM TEASER (ISO PJ 2) ===== -->',
    '<!-- Slanted Diagonal Divider -->\n<div class="slanted-divider" aria-hidden="true"></div>\n\n<!-- ===== PREMIUM TEASER (ISO PJ 2) ===== -->'
)

path.write_text(new_text, encoding='utf-8')
print("Successfully written templates/promo.html!")
