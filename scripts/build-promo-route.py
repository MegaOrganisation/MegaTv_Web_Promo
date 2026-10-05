# -*- coding: utf-8 -*-
import json
from pathlib import Path

html_content = """<!DOCTYPE html>
<html lang="fr" data-theme="dark" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MegaTv — Films, Séries & Live TV</title>
<link rel="icon" type="image/png" href="assets/mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<link rel="stylesheet" href="styles.css?v=2026k">
</head>
<body data-theme="dark">

<!-- ambient backdrop -->
<div class="backdrop" aria-hidden="true">
  <div class="aurora a1" data-par="0.06"></div>
  <div class="aurora a2" data-par="-0.05"></div>
  <div class="aurora a3" data-par="0.04"></div>
  <div class="aurora a4" data-par="-0.04"></div>
</div>
<div class="grid-veil" aria-hidden="true"></div>

<!-- ===== FLOATING PILL NAVBAR (ISO NUVIO PJ 1 & PJ 2) ===== -->
<div class="floating-nav-wrap">
  <header class="floating-nav">
    <a href="/" class="floating-brand">
      <img src="assets/mark.png" alt="MegaTv">
      <span>MegaTv</span>
    </a>
    <nav class="floating-links">
      <a href="/" class="floating-link active">Home</a>
      <a href="/premium" class="floating-link">Premium</a>
      <a href="/companion" class="floating-link">Compagnon</a>
    </nav>
    <div class="floating-right">
      <button class="icon-btn" onclick="toggleTheme()" title="Thème" style="width:32px;height:32px;">
        <svg id="theme-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        </svg>
      </button>
      <a href="/login" id="promo-auth-btn" class="floating-profile-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Connexion</span>
      </a>
    </div>
  </header>
</div>

<!-- ===== PLATFORM RIBBON (ISO PJ 1) ===== -->
<div class="platform-ribbon">
  <span class="platform-tag">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>
    Android
  </span>
  <span class="platform-tag">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.79 1.06-1.88.94-2.97-1 .04-2.13.67-2.8 1.45-.58.67-1.09 1.76-.95 2.83 1.1.08 2.19-.57 2.81-1.31"/></svg>
    iOS
  </span>
  <span class="platform-tag">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8"/><path d="M12 18v2"/></svg>
    Android TV
  </span>
  <span class="platform-tag">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.9 2.318A5.006 5.006 0 0 0 12.9 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h7.9a5.006 5.006 0 0 0 5-4.318L19.2 12l-1.3-9.682zM17 12l-7 4V8l7 4z"/></svg>
    Fire TV
  </span>
  <span class="platform-tag">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    Windows
  </span>
  <span class="platform-tag">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
    macOS
  </span>
  <span class="platform-tag">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    Web App
  </span>
</div>

<!-- ===== HERO ===== -->
<section class="hero" id="hero" data-screen-label="Hero" style="padding-top:20px;">
  <div class="hero-badge">
    <span class="dot"></span>
    <span data-i18n="hero.badge">Disponible sur Android TV · Mobile · Fire TV</span>
  </div>
  <h1 class="hero-title">
    <span>Films, Séries</span>
    <span class="spectrum-text">&amp; Live TV</span>
  </h1>
  <p class="hero-sub" data-i18n="hero.sub">Une application, toutes vos sources. Regardez ce que vous voulez, où que vous soyez, sur tous vos écrans avec synchronisation cloud.</p>
  <div class="hero-ctas">
    <a href="/api/download/android" class="btn-spectrum lg">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5v17a1 1 0 0 0 1.5.87l14-8.5a1 1 0 0 0 0-1.74l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>
      <span data-i18n="hero.cta1">Télécharger gratuitement</span>
    </a>
    <a href="/web" class="btn-ghost lg"><span>Lancer l'App Web</span></a>
    <a href="/companion" class="btn-ghost lg"><span>Ouvrir Compagnon</span></a>
  </div>

  <!-- device cluster (real new screenshots) -->
  <div class="hero-stage">
    <div class="hero-3d">
      <div class="device left"><img src="assets/screen-discover-mobile.jpg" alt="MegaTv — Découverte"></div>
      <div class="device right"><img src="assets/screen-details-mobile.jpg" alt="MegaTv — Fiche détail"></div>
      <div class="device center"><img src="assets/screen-home-mobile.jpg" alt="MegaTv — Accueil"></div>
    </div>
  </div>

  <div class="scroll-cue"><span class="mouse"></span></div>
</section>

<!-- ===== PICK YOUR SCREEN SECTION (INSPIRATION NUVIO PJ 1) ===== -->
<section class="screen-picker-wrap center reveal">
  <div class="eyebrow"><span>Expérience Multi-Écrans</span></div>
  <h2 class="section-title">Choisissez votre écran.</h2>
  <p class="section-sub">
    Chaque version est pensée pour l'écran sur lequel elle tourne, pas une simple interface étirée pour tout le monde. Sélectionnez le vôtre et accédez directement au téléchargement.
  </p>

  <!-- Tabs Switcher (ISO PJ 1) -->
  <div class="screen-picker-tabs">
    <button type="button" class="screen-tab-btn active" onclick="switchScreen('mobile', this)">📱 Phone</button>
    <button type="button" class="screen-tab-btn" onclick="switchScreen('tv', this)">📺 TV</button>
    <button type="button" class="screen-tab-btn" onclick="switchScreen('web', this)">💻 Desktop &amp; Web</button>
  </div>

  <!-- Selected Tab Showcase Card (ISO PJ 1) -->
  <div class="screen-card text-left" style="text-align:left;">
    <div>
      <h3 class="screen-card__title" id="screen-card-title">MegaTv pour Android et iPhone</h3>
      <p class="screen-card__sub" id="screen-card-sub">
        Parcourez, découvrez et lancez vos contenus en mobilité. Connectez votre compte cloud pour synchroniser votre bibliothèque et vos reprises entre tous vos écrans.
      </p>

      <div class="screen-card__logos" id="screen-card-logos">
        <svg viewBox="0 0 24 24" fill="#3ddc84" style="width:28px;height:28px;"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>
        <svg viewBox="0 0 24 24" fill="#fff" style="width:26px;height:26px;"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.79 1.06-1.88.94-2.97-1 .04-2.13.67-2.8 1.45-.58.67-1.09 1.76-.95 2.83 1.1.08 2.19-.57 2.81-1.31"/></svg>
      </div>

      <div class="screen-card__ctas" id="screen-card-ctas">
        <a href="/api/download/android" class="btn-spectrum">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5v17a1 1 0 0 0 1.5.87l14-8.5a1 1 0 0 0 0-1.74l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>
          <span>Android APK</span>
        </a>
        <a href="#features" class="btn-ghost"><span>Google Play (Bientôt)</span></a>
        <a href="/web" class="btn-ghost"><span>Web PWA</span></a>
      </div>
    </div>

    <!-- Preview Media Right -->
    <div class="screen-card__preview">
      <img id="screen-card-img" src="assets/screen-home-mobile.jpg" alt="Aperçu écran">
    </div>
  </div>
</section>

<!-- ===== FLAGSHIP FEATURES (MATCH ENTRE AMIS, CAST, IPTV + ADDONS, THEMES...) ===== -->
<section id="features" data-screen-label="Features">
  <div class="reveal center" style="margin-bottom:48px;">
    <div class="eyebrow"><span>Fonctionnalités Phares</span></div>
    <h2 class="section-title">Une expérience complète. Sans compromis.</h2>
    <p class="section-sub">
      Du social au multi-sources en passant par la personnalisation graphique extrême, découvrez les fonctionnalités qui font la différence.
    </p>
  </div>

  <div class="flagship-grid reveal" data-stagger>
    <!-- Feature 1: Social & Match entre amis -->
    <div class="flagship-card">
      <span class="flagship-badge" style="background:rgba(242,180,60,0.15);color:#f2b43c;">⚽ Social &amp; Match</span>
      <h3 class="flagship-title">Match entre amis &amp; Visionnage Social</h3>
      <p class="flagship-desc">
        Partagez vos soirées séries en simultané, comparez vos progressions et défiez vos amis sur leurs statistiques de visionnage. Échangez vos recommandations d'un geste.
      </p>
    </div>

    <!-- Feature 2: Cast instantané & Multi-écrans -->
    <div class="flagship-card">
      <span class="flagship-badge" style="background:rgba(63,154,230,0.15);color:#3f9ae6;">📡 Cast Ultra-Fluide</span>
      <h3 class="flagship-title">Castez vers votre TV en un clic</h3>
      <p class="flagship-desc">
        Passez instantanément de votre smartphone à votre Android TV ou Fire TV. Vos flux et vos réglages audio sont transmis avec une reprise exacte à la seconde près.
      </p>
    </div>

    <!-- Feature 3: IPTV + Addons + Serveurs -->
    <div class="flagship-card">
      <span class="flagship-badge" style="background:rgba(31,168,160,0.15);color:#1fa8a0;">📺 Multi-Sources</span>
      <h3 class="flagship-title">IPTV + Addons + Serveurs Personnels</h3>
      <p class="flagship-desc">
        Centralisez vos playlists Xtream/M3U avec EPG en direct, connectez vos bibliothèques Plex, Jellyfin et Emby, et chargez vos addons Stremio dans un seul hub fluide.
      </p>
    </div>

    <!-- Feature 4: Personnalisation Thème & Profils -->
    <div class="flagship-card">
      <span class="flagship-badge" style="background:rgba(216,73,127,0.15);color:#d8497f;">🎨 Thèmes &amp; Style</span>
      <h3 class="flagship-title">Personnalisation Thème &amp; Avatars</h3>
      <p class="flagship-desc">
        Habillez votre interface avec des thèmes gradients Aurora, Sunset ou OLED pur. Créez jusqu'à 5 profils familiaux avec code PIN de sécurité et mode Enfants protégé.
      </p>
    </div>

    <!-- Feature 5: Lecteur ExoPlayer 4K & Sous-titres IA -->
    <div class="flagship-card">
      <span class="flagship-badge" style="background:rgba(95,191,90,0.15);color:#5fbf5a;">⚡ Moteur Vidéo Pro</span>
      <h3 class="flagship-title">4K HDR, Dolby Vision &amp; Sous-titres IA</h3>
      <p class="flagship-desc">
        Moteur ExoPlayer Media3 avec matching automatique du framerate. Génération de sous-titres IA multilingues en temps réel via Gemini et Groq pour ne manquer aucun dialogue.
      </p>
    </div>

    <!-- Feature 6: Sync Cloud Temps Réel -->
    <div class="flagship-card">
      <span class="flagship-badge" style="background:rgba(91,99,214,0.15);color:#5b63d6;">☁️ MegaCloud Sync</span>
      <h3 class="flagship-title">Continuité Cloud multi-appareils</h3>
      <p class="flagship-desc">
        Vos favoris, votre historique de lecture et vos listes de suivi sont synchronisés en temps réel et sécurisés par chiffrement RLS sur tous vos appareils.
      </p>
    </div>
  </div>
</section>

<!-- ===== TV SHOWCASE (GRAND ÉCRAN ANDROID TV) ===== -->
<section data-screen-label="TV Showcase" style="padding-top:40px;">
  <div class="reveal center" style="margin-bottom:12px;">
    <div class="eyebrow"><span>Optimisé pour Android TV</span></div>
    <h2 class="section-title">Grand écran, grande expérience.</h2>
    <p class="section-sub">Interface 100% pensée pour la télécommande, zapping instantané, Hero immersif et guide EPG en direct.</p>
  </div>
  <div class="tv-wrap reveal">
    <div class="tv-monitor">
      <div class="tv-glow"></div>
      <div class="tv-screen"><img id="tv-main-img" src="assets/tv-home-new.png" alt="MegaTv sur Android TV"></div>
    </div>
    <div class="tv-stand"></div>
    <div class="tv-foot"></div>
    <div class="tv-thumbs">
      <div class="tv-thumb active" onclick="switchTV(this,0)"><img src="assets/tv-home-new.png" alt=""><span data-i18n="sc.home">Accueil TV</span></div>
      <div class="tv-thumb" onclick="switchTV(this,1)"><img src="assets/tv-live.png" alt=""><span data-i18n="sc.live">TV en Direct</span></div>
      <div class="tv-thumb" onclick="switchTV(this,2)"><img src="assets/tv-detail.png" alt=""><span data-i18n="sc.detail">Fiche Détail</span></div>
      <div class="tv-thumb" onclick="switchTV(this,3)"><img src="assets/tv-person.png" alt=""><span data-i18n="tv.episodes">Acteurs</span></div>
    </div>
  </div>
</section>

<!-- ===== PREMIUM TEASER (ISO PJ 2) ===== -->
<section id="pricing" class="center reveal" style="padding-top:60px;">
  <div class="eyebrow"><span>Soutenez MegaTv</span></div>
  <h2 class="section-title">Formules Premium &amp; Supporter</h2>
  <p class="section-sub" style="margin-bottom:36px;">
    Le lecteur de base reste 100% gratuit. Votre abonnement Supporter permet de financer les serveurs et débloque des bonus exclusifs.
  </p>

  <div style="max-width:820px;margin:0 auto;text-align:left;">
    <div class="pricing-grid reveal" data-stagger style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr));">
      <div class="price-card">
        <div class="price-plan">Supporter</div>
        <div class="price-amount">1,50<span> $US / mois</span></div>
        <div class="price-sub">Pour soutenir le projet</div>
        <div class="price-divider"></div>
        <ul class="price-features">
          <li>Thèmes gradients exclusifs</li>
          <li>Arrière-plans catalogue</li>
          <li>Avatars étendus</li>
          <li>Badge Supporter</li>
          <li>Rôle Discord Supporter</li>
        </ul>
        <a href="/premium" class="btn-price btn-price-outline" style="display:block;text-align:center;text-decoration:none;">Rejoindre</a>
      </div>

      <div class="price-card featured">
        <div class="price-badge">Plus Populaire</div>
        <div class="price-plan spectrum-text">Supporter Plus</div>
        <div class="price-amount">3,00<span> $US / mois</span></div>
        <div class="price-sub">Expérience complète</div>
        <div class="price-divider"></div>
        <ul class="price-features">
          <li>Tout Supporter +</li>
          <li>Jusqu'à 5 profils familiaux</li>
          <li>Synchronisation Cloud illimitée</li>
          <li>Votes sur les fonctionnalités</li>
          <li>Sous-titres IA illimités</li>
        </ul>
        <a href="/premium" class="btn-price btn-price-gradient" style="display:block;text-align:center;text-decoration:none;">Devenir Supporter Plus</a>
      </div>

      <div class="price-card">
        <div class="price-plan">One Time Pass</div>
        <div class="price-amount">Dès 10<span> $US unique</span></div>
        <div class="price-sub">12 mois sans engagement</div>
        <div class="price-divider"></div>
        <ul class="price-features">
          <li>Tous les avantages Supporter Plus</li>
          <li>Pas de renouvellement automatique</li>
          <li>Montant libre dès 10$</li>
          <li>Accès instantané</li>
        </ul>
        <a href="/premium" class="btn-price btn-price-outline" style="display:block;text-align:center;text-decoration:none;">Choisir un montant</a>
      </div>
    </div>
  </div>
</section>

<!-- ===== LEGAL ===== -->
<div class="legal reveal">
  <p data-i18n="legal.text">MegaTv est un lecteur et navigateur média. Aucun film, série, chaîne ou flux n'est fourni par l'application. L'utilisateur configure ses propres services et playlists et reste responsable de leur utilisation conformément à la loi en vigueur dans son pays.</p>
</div>

<!-- ===== FOOTER ===== -->
<footer>
  <div class="footer-top">
    <div class="footer-brand">
      <img class="logo-dark" src="assets/logo.png" alt="MegaTv">
      <img class="logo-light" src="assets/logo-light.png" alt="MegaTv">
      <p data-i18n="footer.desc">Films, séries et TV en direct. Une seule app, toutes vos sources.</p>
    </div>
    <div class="footer-col">
      <div class="footer-col-title">Navigation</div>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/premium">Premium</a></li>
        <li><a href="/companion">MegaCompagnon</a></li>
        <li><a href="/api/download/android">Télécharger APK</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <div class="footer-col-title">Légal</div>
      <ul>
        <li><a href="#">Politique de confidentialité</a></li>
        <li><a href="#">CGU</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 MegaTv. Tous droits réservés.</span>
    <span>Fait avec <span class="footer-heart">♥</span> pour la communauté</span>
  </div>
</footer>

<script src="app.js?v=2026k"></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
"""

# Serialize HTML safely for Next.js route
route_ts_content = f'''export const dynamic = "force-static";

const PROMO_HTML = {json.dumps(html_content, ensure_ascii=False)};

export function GET() {{
  return new Response(PROMO_HTML, {{
    headers: {{
      "Content-Type": "text/html; charset=utf-8"
    }}
  }});
}}
'''

Path("src/app/route.ts").write_text(route_ts_content, encoding="utf-8")
print("Successfully generated src/app/route.ts with size:", len(route_ts_content))
