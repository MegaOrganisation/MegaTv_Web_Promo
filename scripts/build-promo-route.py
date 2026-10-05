# -*- coding: utf-8 -*-
import json
from pathlib import Path

html_content = """<!DOCTYPE html>
<html lang="fr" data-theme="dark" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MegaTv — Films, Séries, Live TV &amp; IPTV</title>
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png?v=2026t">
<link rel="icon" type="image/x-icon" href="favicon.ico?v=2026t">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png?v=2026t">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<link rel="stylesheet" href="styles.css?v=2026m">
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

<!-- ===== FLOATING PILL NAVBAR (ISO MEGAFLOATINGNAV) ===== -->
<div class="floating-nav-wrap">
  <header class="floating-nav">
    <!-- Brand Logo: Exact same transparent triangle as MegaFloatingNav.tsx -->
    <a href="/" class="floating-brand">
      <img src="assets/companion/triangle-mark-clear.png" alt="MegaTv" width="24" height="24">
      <span>MegaTv</span>
    </a>
    <!-- Center Links -->
    <nav class="floating-links">
      <a href="/" class="floating-link active">Home</a>
      <a href="/premium" class="floating-link">Premium</a>
      <a href="/companion" class="floating-link">Compagnon</a>
    </nav>
    <!-- Right Actions: Sun/Moon Theme Toggle + Connexion / Profile Button -->
    <div class="floating-right">
      <button type="button" class="floating-theme-btn" onclick="toggleTheme()" aria-label="Changer de thème">
        <svg id="theme-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/>
          <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
        </svg>
      </button>
      <a href="/login" id="promo-auth-btn" class="floating-profile-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Connexion</span>
      </a>
    </div>
  </header>
</div>

<!-- ===== STREMIO-INSPIRED FULL-SCREEN PROMO HERO (ISO PJ 2) ===== -->
<section class="stremio-hero" id="hero" data-screen-label="Hero">
  <div class="stremio-hero-inner">
    <!-- Left Hero Editorial & Actions -->
    <div class="stremio-hero-content">
      <span class="stremio-kicker">TÉLÉCHARGER MEGATV MAINTENANT</span>
      <h1 class="stremio-title">
        La Liberté De Regarder
      </h1>
      <p class="stremio-sub">
        Films, séries, animés et TV en direct. Une seule application fluide et moderne pour centraliser toutes vos sources sans compromis.
      </p>

      <div class="stremio-ctas">
        <a href="/api/download/android" class="btn-stremio-green">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/>
          </svg>
          <span>Télécharger pour Android TV &amp; Mobile</span>
        </a>
        <a href="/web" class="btn-stremio-outline">
          <span>Lancer l'App Web</span>
        </a>
      </div>

      <!-- Platform badges row (Only Android, Android TV, Fire TV, Windows, Web App - NO iOS, NO macOS) -->
      <div class="stremio-platforms">
        <span class="stremio-platform-tag">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>
          Android
        </span>
        <span class="stremio-platform-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8"/><path d="M12 18v2"/></svg>
          Android TV
        </span>
        <span class="stremio-platform-tag">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.9 2.318A5.006 5.006 0 0 0 12.9 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h7.9a5.006 5.006 0 0 0 5-4.318L19.2 12l-1.3-9.682zM17 12l-7 4V8l7 4z"/></svg>
          Fire TV
        </span>
        <span class="stremio-platform-tag">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
          Windows
        </span>
        <span class="stremio-platform-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>
          Web App
        </span>
      </div>
    </div>

    <!-- Right 3D Perspective Fan-out Posters Cascade (ISO Stremio Hero PJ 2) -->
    <div class="stremio-fan-stage">
      <div class="stremio-fan-cards">
        <div class="fan-card fan-card-1">
          <img src="assets/screen-discover-mobile.jpg" alt="MegaTv Découverte">
        </div>
        <div class="fan-card fan-card-2">
          <img src="assets/screen-home-mobile.jpg" alt="MegaTv Accueil">
        </div>
        <div class="fan-card fan-card-featured">
          <img src="assets/screen-details-mobile.jpg" alt="MegaTv Lecture">
          <div class="fan-play-btn" title="Lancer un aperçu">
            <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <div class="fan-card fan-card-4">
          <img src="assets/web-screens/top10.png" alt="MegaTv Top 10">
        </div>
        <div class="fan-card fan-card-5">
          <img src="assets/tv-home-new.png" alt="MegaTv Android TV">
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== STREMIO-INSPIRED EXPERIENCE BANNER (ISO PJ 2) ===== -->
<section class="stremio-feature-banner">
  <div class="stremio-banner-inner">
    <!-- Left: Angled TV App Screen Mockup -->
    <div class="stremio-banner-mockup">
      <div class="mockup-frame">
        <img src="assets/tv-home-new.png" alt="MegaTv Interface Grand Écran">
      </div>
    </div>
    <!-- Right: Editorial & Supported Platforms -->
    <div class="stremio-banner-text">
      <h2 class="stremio-banner-title">Une expérience de divertissement fluide, moderne et transparente.</h2>
      <p class="stremio-banner-desc">
        Grâce à son interface conviviale et sa compatibilité multi-sources (IPTV Xtream &amp; M3U avec EPG en direct, serveurs Plex, Jellyfin, Emby et addons Stremio), profitez de vos films, séries et chaînes en direct sur tous vos appareils.
      </p>
      <p class="stremio-banner-desc">
        Propulsé par ExoPlayer Media3 4K HDR avec correspondance de framerate automatique, sous-titres IA multilingues en temps réel et synchronisation cloud instantanée de vos favoris et reprises de lecture.
      </p>
      <div class="stremio-banner-platforms">
        <span class="platform-chip"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg> Android</span>
        <span class="platform-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8"/><path d="M12 18v2"/></svg> Android TV</span>
        <span class="platform-chip"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.9 2.318A5.006 5.006 0 0 0 12.9 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h7.9a5.006 5.006 0 0 0 5-4.318L19.2 12l-1.3-9.682zM17 12l-7 4V8l7 4z"/></svg> Fire TV</span>
        <span class="platform-chip"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg> Windows</span>
        <span class="platform-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Web App</span>
      </div>
    </div>
  </div>
</section>

<!-- ===== PICK YOUR SCREEN SECTION ===== -->
<section class="screen-picker-wrap center reveal" id="telecharger">
  <div class="eyebrow"><span>Expérience Multi-Écrans</span></div>
  <h2 class="section-title">Choisissez votre écran.</h2>
  <p class="section-sub">
    Chaque version est pensée pour l'écran sur lequel elle tourne, pas une simple interface étirée pour tout le monde. Sélectionnez le vôtre et accédez directement au téléchargement.
  </p>

  <!-- Tabs Switcher -->
  <div class="screen-picker-tabs">
    <button type="button" class="screen-tab-btn active" onclick="switchScreen('mobile', this)">📱 Phone</button>
    <button type="button" class="screen-tab-btn" onclick="switchScreen('tv', this)">📺 TV</button>
    <button type="button" class="screen-tab-btn" onclick="switchScreen('web', this)">💻 Desktop &amp; Web</button>
  </div>

  <!-- Selected Tab Showcase Card -->
  <div class="screen-card text-left" style="text-align:left;">
    <div>
      <h3 class="screen-card__title" id="screen-card-title">MegaTv pour Smartphones et Tablettes Android</h3>
      <p class="screen-card__sub" id="screen-card-sub">
        Parcourez, découvrez et lancez vos contenus en mobilité. Connectez votre compte cloud pour synchroniser votre bibliothèque et vos reprises entre tous vos écrans.
      </p>

      <div class="screen-card__logos" id="screen-card-logos">
        <svg viewBox="0 0 24 24" fill="#3ddc84" style="width:28px;height:28px;"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>
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

<!-- ===== FLAGSHIP FEATURES ===== -->
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
<div class="legal reveal" id="legal">
  <p data-i18n="legal.text">MegaTv est un lecteur et navigateur média. Aucun film, série, chaîne ou flux n'est fourni par l'application. L'utilisateur configure ses propres services et playlists et reste responsable de leur utilisation conformément à la loi en vigueur dans son pays.</p>
</div>

<!-- ===== STREMIO-INSPIRED FOOTER WITH SOCIAL LINKS (ISO PJ 3) ===== -->
<footer class="stremio-footer">
  <div class="stremio-footer-top">
    <div class="footer-col">
      <h4 class="footer-col-title">ENTREPRISE</h4>
      <ul>
        <li><a href="#features">Technologie</a></li>
        <li><a href="/api/download/android">Téléchargement</a></li>
        <li><a href="#features">Addon SDK</a></li>
        <li><a href="/premium">Partenaires</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4 class="footer-col-title">COMMUNAUTÉ</h4>
      <ul>
        <li><a href="https://discord.gg/megatv" target="_blank" rel="noopener">Communauté Discord</a></li>
        <li><a href="/companion">Galerie de fanarts</a></li>
        <li><a href="/companion">Blog &amp; Mises à jour</a></li>
        <li><a href="/companion">Suggestions &amp; Votes</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4 class="footer-col-title">CONTACTS</h4>
      <ul>
        <li><a href="https://discord.gg/megatv" target="_blank" rel="noopener">Centre d'aide</a></li>
        <li><a href="mailto:contact@megatv.app">Contactez-nous</a></li>
        <li><a href="/companion">Statut des services</a></li>
      </ul>
    </div>
    <div class="footer-social-wrap">
      <div class="footer-socials">
        <!-- Discord -->
        <a href="https://discord.gg/megatv" target="_blank" rel="noopener" aria-label="Discord">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        </a>
        <!-- X (Twitter) -->
        <a href="https://x.com/megatv" target="_blank" rel="noopener" aria-label="X">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <!-- Telegram -->
        <a href="https://t.me/megatv" target="_blank" rel="noopener" aria-label="Telegram">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>
        </a>
        <!-- Reddit -->
        <a href="https://reddit.com/r/megatv" target="_blank" rel="noopener" aria-label="Reddit">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
        </a>
      </div>
      <div class="footer-badges">
        <span class="footer-badge-item">ExoPlayer Media3</span>
        <span class="footer-badge-item">Dolby Vision &amp; Atmos</span>
      </div>
    </div>
  </div>
  <div class="stremio-footer-bottom">
    <span>Copyright &copy; 2026 MegaTv. Tous droits r&eacute;serv&eacute;s.</span>
    <span>Fait avec <span class="footer-heart">&hearts;</span> pour la communaut&eacute;</span>
  </div>
</footer>

<!-- ===== FLOATING COOKIE CONSENT BANNER (ISO PJ 3) ===== -->
<div id="cookie-consent-banner" class="cookie-consent-bar" style="display:none;">
  <div class="cookie-consent-content">
    <div class="cookie-icon-wrap">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="#2563eb">
        <path d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A3.993 3.993 0 0 1 15.5 7.5c0-.85.27-1.638.728-2.28a1.002 1.002 0 0 0-.417-1.58A10.005 10.005 0 0 0 2 12c0 5.514 4.486 10 10 10 5.185 0 9.449-3.977 9.96-9.102a1.004 1.004 0 0 0-.362-.834zM12 20c-4.411 0-8-3.589-8-8a7.962 7.962 0 0 1 6.006-7.75A5.992 5.992 0 0 0 17.5 9.5c1.472 0 2.798-.535 3.824-1.42A8.02 8.02 0 0 1 20 12c0 4.411-3.589 8-8 8z"/>
        <circle cx="8.5" cy="14.5" r="1.5" fill="#2563eb"/>
        <circle cx="14.5" cy="15.5" r="1.5" fill="#2563eb"/>
        <circle cx="10.5" cy="9.5" r="1.5" fill="#2563eb"/>
      </svg>
    </div>
    <span class="cookie-text">
      Ce site utilise des cookies pour vous garantir la meilleure expérience sur notre site. <a href="#legal" class="cookie-link">En savoir plus</a>
    </span>
    <button type="button" class="btn-cookie-accept" onclick="acceptCookies()">Got it!</button>
  </div>
</div>

<!-- ===== STICKY "OBTENIR MEGATV" BUTTON (ISO PJ 3) ===== -->
<div class="sticky-download-bar">
  <a href="/api/download/android" class="btn-sticky-get">
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/>
    </svg>
    <span>Obtenir MegaTv maintenant</span>
  </a>
</div>

<script src="app.js?v=2026m"></script>
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
