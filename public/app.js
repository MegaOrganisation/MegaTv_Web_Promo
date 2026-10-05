/* ============================================================
   MegaTV 2026 — app logic
   (i18n · theme · supabase auth · TV switch · scroll engine)
   ============================================================ */

/* ---------- SUPABASE ---------- */
const SUPABASE_URL = "https://lciimaytmryruyooktkd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjaWltYXl0bXJ5cnV5b29rdGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTEwNDAsImV4cCI6MjA5NDkyNzA0MH0.xj8ITmbNeKLShcdKcqvpy--V8B7EcBHkWGkNaENjilI";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- MOTION (driven by Tweaks) ---------- */
window.MegaMotion = { parallax: 0.7, tilt: 0.7 };

/* ---------- I18N ---------- */
const i18n = {
  fr: {
    "nav.features":"Fonctionnalités","nav.pricing":"Tarifs","nav.access":"Accès","nav.login":"Se connecter","nav.pro":"Passer Pro",
    "eco.eyebrow":"Écosystème MegaTv","eco.title":"Tous vos espaces, un seul univers.","eco.sub":"Découvrir MegaTv, connexion cloud, Companion, app web et Android — chaque porte mène au bon endroit.",
    "eco.discover":"Découvrir MegaTv","eco.discover.sub":"Fonctionnalités, écrans TV & mobile, formules — l'univers produit.","eco.discover.cta":"Explorer →",
    "eco.auth":"Connexion Cloud","eco.auth.sub":"ID MegaTv — login, inscription et pairing TV sécurisé.","eco.auth.cta":"Se connecter →",
    "eco.companion":"MegaCompagnon","eco.companion.sub":"Dashboard cloud : stats, profils, appareils, calendrier.","eco.companion.cta":"Ouvrir Companion →",
    "eco.web":"Application Web","eco.web.sub":"Films, séries et IPTV dans le navigateur — même compte cloud.","eco.web.cta":"Lancer l'app web →",
    "eco.android":"App Android","eco.android.sub":"Android TV · Mobile · Fire TV — APK toujours à jour (dernière release).","eco.android.cta":"Télécharger l'APK →",
    "hero.badge":"Disponible sur Android TV · Mobile · Fire TV",
    "hero.sub":"Une application, toutes vos sources. Regardez ce que vous voulez, où que vous soyez, sur tous vos écrans.",
    "hero.cta1":"Télécharger gratuitement","hero.cta2":"Découvrir","hero.ctaWeb":"Accéder à MegaTv",
    "m.films":"Films & Séries","m.iptv":"TV en Direct IPTV","m.android":"Android TV","m.firetv":"Fire TV Stick","m.mobile":"Mobile","m.sync":"Sync Multi-Appareils","m.profiles":"Profils Familiaux","m.ai":"Sous-titres IA",
    "platforms.label":"Disponible sur",
    "feat.eyebrow":"Tout ce qu'il vous faut","feat.title":"Une app.\nUn univers complet.","feat.sub":"Du contenu à la demande jusqu'aux chaînes live, tout est centralisé dans une interface premium.",
    "f1.title":"Lecteur Vidéo Premium","f1.desc":"ExoPlayer / Media3 haute performance. Sélecteur de sources intelligent, lecture automatique, framerate matching, pistes audio multiples et sous-titres IA en temps réel.",
    "f2.title":"Accueil Personnalisé","f2.desc":"Hero avec bande-annonce, Top 10 du jour, rails thématiques par genre, service, décennie. Reprise là où vous vous êtes arrêté.",
    "f3.title":"TV en Direct IPTV","f3.desc":"Playlists M3U et Xtream, guide des programmes (EPG), favoris, dizaines de milliers de chaînes, logos optimisés, VOD IPTV.",
    "f4.title":"Vos Bibliothèques","f4.desc":"Connectez Plex, Jellyfin et Emby. Addons Stremio, catalogues Trakt & MDBList, URLs personnalisées.",
    "f5.title":"Sync Cloud Temps Réel","f5.desc":"MegaTv Cloud synchronise vos profils, réglages, progressions et watchlists entre tous vos appareils.",
    "f6.title":"Watchlist Avancée","f6.desc":"Ma liste avec filtres poussés : vu/non vu, genre, année, note. Anti-spoilers avec flou. Sync Trakt.",
    "sc.eyebrow":"Interface Premium","sc.title":"Conçu pour\nchaque écran","sc.detail":"Fiche Détail","sc.search":"Recherche","sc.live":"TV en Direct","sc.watchlist":"Watchlist","sc.player":"Lecteur",
    "tv.eyebrow":"Optimisé pour Android TV","tv.title":"Grand écran,\ngrande expérience.","tv.sub":"Interface navigable à la télécommande, Hero immersif, guide des programmes en temps réel.",
    "sc.home":"Accueil","tv.episodes":"Acteurs",
    "prof.eyebrow":"Pour toute la famille","prof.title":"Un profil pour chacun.","prof.sub":"Profils multiples avec avatar, couleur personnalisée et PIN. Profil enfants avec filtre contenu mature.",
    "prof.f1":"Jusqu'à 5 profils par compte","prof.f2":"PIN de protection + filtre contenu adulte","prof.f3":"Avatar personnalisé synchronisé dans le cloud","prof.f4":"Historique et watchlist isolés par profil","prof.who":"Qui regarde ?","prof.add":"Ajouter","prof.manage":"Gérer les profils",
    "price.eyebrow":"Simple & Transparent","price.title":"Choisissez votre formule","price.sub":"Commencez gratuitement. Passez Pro quand vous le souhaitez.","price.note":"L'application est disponible gratuitement. Les fonctionnalités Pro sont optionnelles.",
    "plan.free.name":"Gratuit","plan.free.per":" €","plan.free.sub":"Pour toujours","plan.free.f1":"Accès à toutes vos sources","plan.free.f2":"IPTV M3U & Xtream","plan.free.f3":"Plex, Jellyfin, Emby","plan.free.f4":"1 profil","plan.free.cta":"Télécharger gratuitement",
    "plan.monthly.name":"Pro Mensuel","plan.monthly.per":",99 / mois","plan.monthly.sub":"Sans engagement","plan.monthly.cta":"Commencer",
    "plan.annual.name":"Pro Annuel","plan.annual.per":",99 / an","plan.annual.sub":"≈ 1 € / mois · 6 mois offerts","plan.annual.badge":"Meilleure valeur","plan.annual.cta":"Économiser maintenant","plan.annual.f6":"Priorité support",
    "plan.pro.f1":"Tout le plan Gratuit","plan.pro.f2":"Jusqu'à 5 profils","plan.pro.f3":"Sous-titres IA (Groq / Gemini)","plan.pro.f4":"Sync Cloud multi-appareils","plan.pro.f5":"Lecture à distance","plan.pro.f6":"Filtres & tri avancés",
    "plan.lifetime.name":"Pro À Vie","plan.lifetime.per":",99 une fois","plan.lifetime.sub":"Payez une fois, profitez à vie","plan.lifetime.badge":"Meilleure offre","plan.lifetime.f5":"Toutes les futures fonctionnalités","plan.lifetime.f6":"Support prioritaire à vie","plan.lifetime.cta":"Posséder à vie","plan.lifetime.note":"Paiement unique · Pas d'abonnement",
    "acc.eyebrow":"MegaCompagnon","acc.title":"Connexion MegaCompagnon","acc.sub":"Connectez-vous avec votre ID MegaTv Cloud pour ouvrir le tableau de bord Companion. Si vous n'avez pas encore de compte MegaCloud, créez-le en quelques secondes.",
    "acc.login.title":"Accéder à MegaCompagnon","acc.login.sub":"Depuis Accès, ouvrez Companion ou créez votre ID MegaTv Cloud — la session reste active entre les surfaces.","acc.email":"Adresse email","acc.password":"Mot de passe","acc.login.btn":"Se connecter","acc.devices":"Appareils jumelés","acc.loading":"Chargement...","acc.logout":"Se déconnecter","acc.profiles.title":"App web Companion","acc.profiles.sub":"Retrouvez vos statistiques, profils, appareils liés, progression et vues admin selon vos droits MegaTv Cloud.","acc.profiles.empty":"Connectez-vous pour voir vos profils","acc.companion.cta":"Voir l'écosystème","acc.signup.cta":"Créer un compte MegaCloud","acc.login.note":"La connexion et l'inscription passent par ID MegaTv (portail Cloud). Companion et l'app web utilisent le même compte.","acc.card.stats":"Dashboard personnel","acc.card.stats.sub":"Stats, continuité de lecture et contenus favoris","acc.card.cloud":"MegaTv Cloud","acc.card.cloud.sub":"Session sécurisée et données isolées par RLS",
    "legal.text":"MegaTv est un lecteur et navigateur média. Aucun film, série, chaîne ou flux n'est fourni par l'application. L'utilisateur configure ses propres services et playlists et reste responsable de leur utilisation conformément à la loi en vigueur dans son pays.",
    "footer.desc":"Films, séries et TV en direct. Une seule app, toutes vos sources.","footer.app":"Application","footer.download":"Télécharger","footer.legal":"Légal","footer.privacy":"Politique de confidentialité","footer.terms":"CGU","footer.contact":"Contact","footer.copy":"© 2026 MegaTv. Tous droits réservés.",
  },
  en: {
    "nav.features":"Features","nav.pricing":"Pricing","nav.access":"Access","nav.login":"Log in","nav.pro":"Go Pro",
    "eco.eyebrow":"MegaTv ecosystem","eco.title":"All your spaces, one universe.","eco.sub":"Discover MegaTv, cloud login, Companion, web app and Android — each door leads to the right place.",
    "eco.discover":"Discover MegaTv","eco.discover.sub":"Features, TV & mobile screens, plans — the product universe.","eco.discover.cta":"Explore →",
    "eco.auth":"Cloud login","eco.auth.sub":"MegaTv ID — sign in, sign up and secure TV pairing.","eco.auth.cta":"Sign in →",
    "eco.companion":"MegaCompanion","eco.companion.sub":"Cloud dashboard: stats, profiles, devices, calendar.","eco.companion.cta":"Open Companion →",
    "eco.web":"Web app","eco.web.sub":"Movies, shows and IPTV in the browser — same cloud account.","eco.web.cta":"Launch web app →",
    "eco.android":"Android app","eco.android.sub":"Android TV · Mobile · Fire TV — always the latest APK release.","eco.android.cta":"Download APK →",
    "hero.badge":"Available on Android TV · Mobile · Fire TV",
    "hero.sub":"One app, all your sources. Watch what you want, wherever you are, on all your screens.",
    "hero.cta1":"Download free","hero.cta2":"Explore","hero.ctaWeb":"Access MegaTv",
    "m.films":"Movies & TV Shows","m.iptv":"Live TV / IPTV","m.android":"Android TV","m.firetv":"Fire TV Stick","m.mobile":"Mobile","m.sync":"Multi-Device Sync","m.profiles":"Family Profiles","m.ai":"AI Subtitles",
    "platforms.label":"Available on",
    "feat.eyebrow":"Everything you need","feat.title":"One app.\nA complete universe.","feat.sub":"From on-demand content to live channels, everything is centralized in a premium interface.",
    "f1.title":"Premium Video Player","f1.desc":"High-performance ExoPlayer / Media3. Smart source selector, auto-play next episode, framerate matching, multiple audio tracks, real-time AI subtitles.",
    "f2.title":"Personalized Home","f2.desc":"Hero with trailer, Top 10 of the day, themed rails by genre, service, decade. Resume where you left off.",
    "f3.title":"Live TV / IPTV","f3.desc":"M3U & Xtream playlists, EPG guide, favorites, tens of thousands of channels, optimized logos, IPTV VOD.",
    "f4.title":"Your Libraries","f4.desc":"Connect Plex, Jellyfin & Emby. Stremio addons, Trakt & MDBList catalogs, custom URLs.",
    "f5.title":"Real-Time Cloud Sync","f5.desc":"MegaTv Cloud syncs your profiles, settings, progress and watchlists across all devices.",
    "f6.title":"Advanced Watchlist","f6.desc":"My list with advanced filters: seen/unseen, genre, year, rating. Anti-spoilers with blur. Trakt sync.",
    "sc.eyebrow":"Premium Interface","sc.title":"Designed for\nevery screen","sc.detail":"Detail Page","sc.search":"Search","sc.live":"Live TV","sc.watchlist":"Watchlist","sc.player":"Player",
    "tv.eyebrow":"Optimized for Android TV","tv.title":"Big screen,\nbig experience.","tv.sub":"Remote-navigable interface, immersive hero, real-time program guide.",
    "sc.home":"Home","tv.episodes":"Cast",
    "prof.eyebrow":"For the whole family","prof.title":"A profile for everyone.","prof.sub":"Multiple profiles with avatar, custom color and PIN. Kids profile with mature content filter.",
    "prof.f1":"Up to 5 profiles per account","prof.f2":"PIN protection + adult content filter","prof.f3":"Custom avatar synced to the cloud","prof.f4":"Isolated history & watchlist per profile","prof.who":"Who's watching?","prof.add":"Add profile","prof.manage":"Manage profiles",
    "price.eyebrow":"Simple & Transparent","price.title":"Choose your plan","price.sub":"Start for free. Go Pro whenever you want.","price.note":"The app is free. Pro features are optional.",
    "plan.free.name":"Free","plan.free.per":" €","plan.free.sub":"Forever","plan.free.f1":"Access to all your sources","plan.free.f2":"IPTV M3U & Xtream","plan.free.f3":"Plex, Jellyfin, Emby","plan.free.f4":"1 profile","plan.free.cta":"Download free",
    "plan.monthly.name":"Pro Monthly","plan.monthly.per":".99 / month","plan.monthly.sub":"No commitment","plan.monthly.cta":"Get started",
    "plan.annual.name":"Pro Annual","plan.annual.per":".99 / year","plan.annual.sub":"≈ €1 / month · 6 months free","plan.annual.badge":"Best value","plan.annual.cta":"Save now","plan.annual.f6":"Priority support",
    "plan.pro.f1":"Everything in Free","plan.pro.f2":"Up to 5 profiles","plan.pro.f3":"AI Subtitles (Groq / Gemini)","plan.pro.f4":"Multi-device cloud sync","plan.pro.f5":"Remote playback","plan.pro.f6":"Advanced filters & sorting",
    "plan.lifetime.name":"Pro Lifetime","plan.lifetime.per":".99 once","plan.lifetime.sub":"Pay once, enjoy forever","plan.lifetime.badge":"Best deal","plan.lifetime.f5":"All future features","plan.lifetime.f6":"Lifetime priority support","plan.lifetime.cta":"Own it forever","plan.lifetime.note":"One-time payment · No subscription",
    "acc.eyebrow":"MegaCompanion","acc.title":"MegaCompanion Login","acc.sub":"Sign in with your MegaTv Cloud ID to open the Companion dashboard. If you do not have a MegaCloud account yet, create one in seconds.",
    "acc.login.title":"Open MegaCompanion","acc.login.sub":"From Access, open Companion or create your MegaTv Cloud ID — the session stays active across surfaces.","acc.email":"Email address","acc.password":"Password","acc.login.btn":"Log in","acc.devices":"Paired devices","acc.loading":"Loading...","acc.logout":"Log out","acc.profiles.title":"Companion web app","acc.profiles.sub":"Find your stats, profiles, linked devices, progress and admin views according to your MegaTv Cloud permissions.","acc.profiles.empty":"Log in to see your profiles","acc.companion.cta":"See the ecosystem","acc.signup.cta":"Create a MegaCloud account","acc.login.note":"Sign-in and sign-up go through MegaTv ID (Cloud portal). Companion and the web app share the same account.","acc.card.stats":"Personal dashboard","acc.card.stats.sub":"Stats, continue watching and favorite content","acc.card.cloud":"MegaTv Cloud","acc.card.cloud.sub":"Secure session and RLS-isolated data",
    "legal.text":"MegaTv is a media player and browser. No movie, show, channel or stream is provided by the app. The user configures their own services and playlists and is responsible for their use in accordance with local law.",
    "footer.desc":"Movies, shows and live TV. One app, all your sources.","footer.app":"App","footer.download":"Download","footer.legal":"Legal","footer.privacy":"Privacy Policy","footer.terms":"Terms of Use","footer.contact":"Contact","footer.copy":"© 2026 MegaTv. All rights reserved.",
  }
};

let currentLang = 'fr';
function applyLang(lang){
  currentLang = lang;
  document.documentElement.setAttribute('data-lang', lang);
  document.getElementById('lang-toggle').textContent = lang === 'fr' ? 'EN' : 'FR';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(i18n[lang][key]) el.textContent = i18n[lang][key];
  });
}
function toggleLang(){ applyLang(currentLang === 'fr' ? 'en' : 'fr'); }
window.toggleLang = toggleLang;

/* ---------- THEME ---------- */
function setThemeIcon(theme){
  const icon = document.getElementById('theme-icon');
  if(!icon) return;
  if(theme === 'dark'){
    // Lucide Sun (15px) for dark mode
    icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
  } else {
    // Lucide Moon (15px) for light mode
    icon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
  }
}
function applyTheme(theme){
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  html.dataset.theme = theme;
  html.style.colorScheme = theme;
  document.body.setAttribute('data-theme', theme);
  setThemeIcon(theme);
}
function toggleTheme(){
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem('megacompanion_theme', next);
  } catch (_) {}
}
window.toggleTheme = toggleTheme;

// Sync theme on start
(function initTheme(){
  let theme = 'dark';
  try {
    theme = localStorage.getItem('megacompanion_theme') || 'dark';
  } catch (_) {}
  applyTheme(theme);
})();

/* ---------- NAV scrolled state ---------- */
const nav = document.querySelector('.nav');
function onNav(){ nav.classList.toggle('scrolled', window.scrollY > 24); }

/* ---------- SCROLL REVEAL (cinematic, once) ---------- */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); revealObserver.unobserve(e.target); }
  });
},{ threshold:0.12, rootMargin:'0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

/* ---------- PARALLAX ENGINE ---------- */
const parEls = [...document.querySelectorAll('[data-par]')].map(el=>({el,speed:parseFloat(el.dataset.par)||0.1}));
const devices = [...document.querySelectorAll('.device')];
const heroStage = document.querySelector('.hero-stage');
let ticking = false;
function applyParallax(){
  const y = window.scrollY;
  const f = window.MegaMotion.parallax;
  parEls.forEach(p=>{ p.el.style.transform = `translate3d(0,${(y*p.speed*f).toFixed(1)}px,0)`; });
  // hero devices drift up at slightly different rates for depth
  if(heroStage){
    const hp = Math.min(y, window.innerHeight) * f;
    devices.forEach(d=>{
      const m = d.classList.contains('center') ? 0.05 : 0.11;
      d.style.setProperty('--py', `${(-hp*m).toFixed(1)}px`);
    });
  }
  ticking = false;
}
function requestParallax(){ if(!ticking){ ticking = true; requestAnimationFrame(applyParallax); } }
window.addEventListener('scroll', ()=>{ onNav(); requestParallax(); }, {passive:true});

/* ---------- HERO MOUSE PARALLAX ---------- */
const hero3d = document.querySelector('.hero-3d');
if(hero3d){
  const heroSection = document.querySelector('.hero');
  heroSection.addEventListener('mousemove', (e)=>{
    const r = heroSection.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - 0.5;
    const yy = (e.clientY - r.top)/r.height - 0.5;
    const t = window.MegaMotion.tilt;
    hero3d.style.transform = `rotateY(${(x*10*t).toFixed(2)}deg) rotateX(${(-yy*7*t).toFixed(2)}deg)`;
  });
  heroSection.addEventListener('mouseleave', ()=>{ hero3d.style.transform = ''; });
}

/* ---------- CARD TILT ---------- */
document.querySelectorAll('.price-card, .feat-card').forEach(card=>{
  card.addEventListener('mousemove',(e)=>{
    const t = window.MegaMotion.tilt;
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY-rect.top)/rect.height - 0.5) * -7 * t;
    const ry = ((e.clientX-rect.left)/rect.width - 0.5) * 7 * t;
    card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-5px)`;
  });
  card.addEventListener('mouseleave',()=>{ card.style.transform = ''; });
});

/* ---------- TV SHOWCASE SWITCH ---------- */
const tvSrcs = [];
document.querySelectorAll('.tv-thumb img').forEach(img=>tvSrcs.push(img.getAttribute('src')));
function switchTV(el, idx){
  document.querySelectorAll('.tv-thumb').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const main = document.getElementById('tv-main-img');
  main.style.opacity = '0';
  setTimeout(()=>{ main.src = tvSrcs[idx]; main.style.opacity = '1'; }, 200);
}
window.switchTV = switchTV;

/* ---------- COMPANION ACCESS ---------- */
function openMegaCompanion(){ window.location.href = '/companion'; }
window.openMegaCompanion = openMegaCompanion;

/* ---------- INFINITE SCREENS ---------- */
const track = document.getElementById('screensTrack');
if(track){ track.innerHTML += track.innerHTML; }

/* ---------- PRO CHECKOUT (RevenueCat / Stripe) ---------- */
(function wireProCheckout(){
  const plans = ['monthly', 'yearly', 'lifetime'];
  const buttons = document.querySelectorAll('#pricing .btn-price-gradient');
  buttons.forEach((btn, index) => {
    const plan = btn.getAttribute('data-plan') || plans[index] || 'monthly';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = new URL('/api/checkout', window.location.origin);
      url.searchParams.set('plan', plan);
      try {
        const uid = localStorage.getItem('megatv_user_id') || sessionStorage.getItem('megatv_user_id');
        if (uid) url.searchParams.set('user_id', uid);
      } catch (_) { /* ignore */ }
      window.location.href = url.toString();
    });
  });

  // Surface checkout fallback (Stripe not configured / error) on the pricing section.
  try {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;
    const lang = (document.documentElement.getAttribute('data-lang') || 'fr').toLowerCase();
    const copy = {
      fr: {
        configure: 'Le paiement Stripe n’est pas encore branché. Les formules Pro arrivent — contacte le support MegaTv ou réessaie bientôt.',
        error: 'Le paiement a échoué. Réessaie dans un instant ou choisis une autre formule.',
        cancel: 'Paiement annulé. Tu peux choisir une formule quand tu veux.',
      },
      en: {
        configure: 'Stripe checkout is not connected yet. Pro plans are coming — contact MegaTv support or try again soon.',
        error: 'Payment failed. Please try again in a moment or pick another plan.',
        cancel: 'Checkout cancelled. You can pick a plan anytime.',
      },
    };
    const msg = (copy[lang] || copy.fr)[checkout] || (copy.fr)[checkout];
    if (!msg) return;

    const banner = document.createElement('div');
    banner.setAttribute('role', 'status');
    banner.style.cssText = [
      'position:fixed','left:50%','transform:translateX(-50%)','bottom:28px','z-index:9999',
      'max-width:min(560px,92vw)','padding:14px 18px','border-radius:14px',
      'background:rgba(16,25,28,0.94)','border:1px solid rgba(242,180,60,0.45)',
      'color:#fff','font:500 14px/1.45 Instrument Sans,system-ui,sans-serif',
      'box-shadow:0 16px 40px rgba(0,0,0,0.45)','backdrop-filter:blur(12px)',
    ].join(';');
    banner.textContent = msg;
    document.body.appendChild(banner);

    const pricing = document.getElementById('pricing');
    if (pricing) {
      requestAnimationFrame(() => pricing.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    // Clean query from the URL without losing #pricing.
    const clean = new URL(window.location.href);
    clean.searchParams.delete('checkout');
    clean.searchParams.delete('plan');
    clean.searchParams.delete('product');
    clean.hash = '#pricing';
    window.history.replaceState({}, '', clean.toString());

    setTimeout(() => banner.remove(), 9000);
  } catch (_) { /* ignore */ }
})();

/* ---------- SCREEN PICKER TABS (ISO NUVIO & MEGA PROMO) ---------- */
const screenData = {
  mobile: {
    title: "MegaTv pour Smartphones et Tablettes Android",
    sub: "Parcourez, découvrez et lancez vos contenus en mobilité. Connectez votre compte cloud pour synchroniser votre bibliothèque et vos reprises entre tous vos écrans.",
    image: "assets/screen-home-mobile.jpg",
    mockupType: "mode-phone",
    logos: `
      <span class="platform-brand-badge" title="Android Mobile">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#3DDC84"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>
        <span>Android</span>
      </span>
      <span class="platform-brand-badge" title="Google Play Store">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3.6 1.4A1.6 1.6 0 0 0 3 2.6v18.8c0 .5.2.9.6 1.2l9.9-10.3L3.6 1.4z" fill="#00E5FF"/><path d="M16.9 15.7l-3.4-3.4 3.4-3.4.1.1 4 2.3c1.1.6 1.1 1.7 0 2.3l-4.1 2.1z" fill="#FFC107"/><path d="M13.5 12.3L3.6 22.6c.4.4 1 .4 1.7 0l11.6-6.9-3.4-3.4z" fill="#FF3D00"/><path d="M13.5 12.3L16.9 8.9 5.3 2.1c-.7-.4-1.3-.4-1.7 0l9.9 10.2z" fill="#4CAF50"/></svg>
        <span>Google Play</span>
      </span>
    `,
    ctas: `
      <a href="/api/download/android" class="btn-spectrum">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5v17a1 1 0 0 0 1.5.87l14-8.5a1 1 0 0 0 0-1.74l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>
        <span>Télécharger APK Mobile</span>
      </a>
      <a href="#features" class="btn-ghost"><span>Google Play</span></a>
      <a href="/web" class="btn-ghost"><span>Web PWA</span></a>
    `
  },
  tv: {
    title: "MegaTv pour Android TV, Google TV & Fire TV",
    sub: "Expérience grand écran 100% pensée pour la télécommande. Hero immersif 4K HDR, zapping ultra-rapide des flux IPTV, guide EPG direct et synchronisation cloud instantanée.",
    image: "assets/tv-home-new.png",
    mockupType: "mode-tv",
    logos: `
      <span class="platform-brand-badge" title="Android TV">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3DDC84" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="3"/><path d="M8 21h8"/><path d="M12 18v3"/><circle cx="9" cy="11" r="1" fill="#3DDC84"/><circle cx="15" cy="11" r="1" fill="#3DDC84"/></svg>
        <span>Android TV</span>
      </span>
      <span class="platform-brand-badge" title="Google TV">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
        <span>Google TV</span>
      </span>
      <span class="platform-brand-badge" title="Amazon Fire TV">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF9900"><path d="M17.9 2.318A5.006 5.006 0 0 0 12.9 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h7.9a5.006 5.006 0 0 0 5-4.318L19.2 12l-1.3-9.682zM17 12l-7 4V8l7 4z"/></svg>
        <span>Fire TV</span>
      </span>
    `,
    ctas: `
      <a href="/api/download/android" class="btn-spectrum">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5v17a1 1 0 0 0 1.5.87l14-8.5a1 1 0 0 0 0-1.74l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>
        <span>Télécharger APK TV</span>
      </a>
      <a href="#ecosysteme" class="btn-ghost"><span>Guide Downloader / Sideload</span></a>
    `
  },
  web: {
    title: "MegaTv pour le Web & Ordinateur",
    sub: "Accédez à l'ensemble de votre catalogue, vos flux TV en direct et votre progression directement depuis Google Chrome, Edge, Safari, Firefox ou Internet Explorer.",
    image: "assets/web-screens/top10.png",
    mockupType: "mode-web",
    logos: `
      <span class="platform-brand-badge" title="Internet Explorer & Web Browsers">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.44 1.28 4.88-.17-.76-.28-1.57-.28-2.4 0-4.97 3.58-9 8-9 1.54 0 2.98.49 4.19 1.32C13.9 4.3 12.02 2 12 2zm9.72 5.12C20.61 4.7 17.5 3 13.5 3c-5.25 0-9.5 4.03-9.5 9 0 .61.08 1.2.2 1.77C2.88 12.87 2 11.02 2 9c0-3.31 4.03-6 9-6 4.13 0 7.6 1.87 8.68 4.45-.63-.44-1.3-.82-1.96-1.33zm-.72 4.88c0 4.97-4.03 9-9 9-2.02 0-3.87-.67-5.38-1.8 1.15.51 2.45.8 3.88.8 4.42 0 8-3.58 8-8 0-.34-.03-.67-.08-1 1.57.25 2.58.55 2.58 1zm-1.07-2c-.36-.48-.82-.9-1.35-1.25C17.65 9.4 16.14 10 14.5 10c-3.04 0-5.5-2.01-5.5-4.5 0-.4.07-.78.18-1.15-2.8 1.34-4.68 3.8-4.68 6.65 0 4.42 3.58 8 8 8 3.73 0 6.84-2.55 7.72-6H14v-2h5.93z" fill="#0078D7"/></svg>
        <span>Internet Explorer</span>
      </span>
      <span class="platform-brand-badge" title="Navigateurs Web Modernes">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
        <span>Chrome / Safari / Edge</span>
      </span>
    `,
    ctas: `
      <a href="/web" class="btn-spectrum">
        <span>Lancer l'App Web</span>
      </a>
      <a href="/companion" class="btn-ghost">
        <span>Ouvrir Compagnon</span>
      </a>
    `
  }
};

function switchScreen(platform, btn) {
  document.querySelectorAll('.screen-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const d = screenData[platform];
  if (!d) return;
  const titleEl = document.getElementById('screen-card-title');
  const subEl = document.getElementById('screen-card-sub');
  const logosEl = document.getElementById('screen-card-logos');
  const ctasEl = document.getElementById('screen-card-ctas');
  const imgEl = document.getElementById('screen-card-img');
  const frameEl = document.getElementById('screen-card-frame');

  if (titleEl) titleEl.textContent = d.title;
  if (subEl) subEl.textContent = d.sub;
  if (logosEl) logosEl.innerHTML = d.logos;
  if (ctasEl) ctasEl.innerHTML = d.ctas;
  if (frameEl && d.mockupType) {
    frameEl.className = 'screen-mockup-frame ' + d.mockupType;
  }
  if (imgEl) {
    imgEl.style.opacity = '0';
    setTimeout(() => { imgEl.src = d.image; imgEl.style.opacity = '1'; }, 150);
  }
}
window.switchScreen = switchScreen;

/* ---------- AUTH USER SYNC FOR PROMO TOP BAR ---------- */
(function checkUserAuth() {
  try {
    sb.auth.getUser().then(async ({ data: { user } }) => {
      const authBtn = document.getElementById('promo-auth-btn');
      if (user && authBtn) {
        let avatarSrc = null;
        let displayName = user.email ? user.email.split('@')[0] : 'Profil';

        try {
          const { data: profiles } = await sb
            .from('user_profiles')
            .select('id, name, avatar_id, avatar_image_version, avatar_image_storage_path')
            .eq('user_id', user.id)
            .order('last_used_at', { ascending: false, nullsFirst: false })
            .limit(1);

          if (profiles && profiles.length > 0) {
            const p = profiles[0];
            if (p.name) displayName = p.name;
            const path = p.avatar_image_storage_path?.trim();
            if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
              avatarSrc = path;
            } else if (path || (p.avatar_image_version || 0) > 0) {
              avatarSrc = `/api/profiles/${encodeURIComponent(p.id)}/avatar?v=${p.avatar_image_version || 1}`;
            } else if (p.avatar_id && p.avatar_id > 0) {
              const num = Math.min(Math.max(p.avatar_id, 1), 25);
              avatarSrc = `/assets/avatars/avatar_${num}.png`;
            }
          }
        } catch (_) {}

        const avatarHtml = avatarSrc
          ? `<img src="${avatarSrc}" alt="${displayName}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,0.35);box-shadow:0 2px 8px rgba(0,0,0,0.5);shrink:0;" />`
          : `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#3f9ae6,#d8497f);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;">${displayName[0].toUpperCase()}</div>`;

        authBtn.innerHTML = `
          ${avatarHtml}
          <span style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;">${displayName}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6;"><polyline points="6 9 12 15 18 9"/></svg>
        `;
        authBtn.href = '/companion';
      }
    });
  } catch (_) {}
})();

/* ---------- COOKIE CONSENT BANNER (PJ 3) ---------- */
function initCookieConsent() {
  try {
    const accepted = localStorage.getItem('megatv_cookie_consent');
    const banner = document.getElementById('cookie-consent-banner');
    if (!accepted && banner) {
      banner.style.display = 'flex';
      requestAnimationFrame(() => banner.classList.add('visible'));
    }
  } catch (_) {}
}

function acceptCookies() {
  try {
    localStorage.setItem('megatv_cookie_consent', 'true');
  } catch (_) {}
  const banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.classList.remove('visible');
    setTimeout(() => { banner.style.display = 'none'; }, 300);
  }
}
window.acceptCookies = acceptCookies;

/* ---------- INIT ---------- */
onNav();
applyParallax();
applyLang('fr');
initCookieConsent();


