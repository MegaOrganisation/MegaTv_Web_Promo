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
// The Tweaks panel is the single source of truth for theme (it re-applies
// data-theme on every render). The nav button just requests a flip; the
// Tweaks app listens and updates its state. Fallback to direct toggle if
// the Tweaks panel hasn't mounted.
function setThemeIcon(theme){
  const icon = document.getElementById('theme-icon');
  if(!icon) return;
  icon.innerHTML = theme === 'dark'
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="2"/>';
}
function toggleTheme(){
  if(window.__tweaksReady){
    window.dispatchEvent(new Event('megatoggletheme'));
  } else {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    document.body.setAttribute('data-theme', next);
    setThemeIcon(next);
  }
}
window.toggleTheme = toggleTheme;

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

/* ---------- SCREEN PICKER TABS (ISO PJ 1) ---------- */
const screenData = {
  mobile: {
    title: "MegaTv pour Android et iPhone",
    sub: "Parcourez, découvrez et lancez vos contenus en mobilité. Connectez votre compte cloud pour synchroniser votre bibliothèque et vos reprises entre tous vos écrans.",
    image: "assets/screen-home-mobile.jpg",
    logos: `
      <svg viewBox="0 0 24 24" fill="#3ddc84" style="width:28px;height:28px;"><path d="M17.6 9.48 19.1 6.9a.5.5 0 1 0-.87-.5l-1.55 2.68A7.3 7.3 0 0 0 12 8.2a7.3 7.3 0 0 0-4.68.88L5.77 6.4a.5.5 0 1 0-.87.5l1.5 2.58A6.9 6.9 0 0 0 5 13.5v.7h14v-.7a6.9 6.9 0 0 0-1.4-4.02ZM9.2 12.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5.6 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4ZM7.2 15.5v3.2a1.1 1.1 0 0 0 1.1 1.1h1.1V15.5H7.2Zm7.4 0v4.3h1.1a1.1 1.1 0 0 0 1.1-1.1v-3.2h-2.2Z"/></svg>
      <svg viewBox="0 0 24 24" fill="#fff" style="width:26px;height:26px;"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.79 1.06-1.88.94-2.97-1 .04-2.13.67-2.8 1.45-.58.67-1.09 1.76-.95 2.83 1.1.08 2.19-.57 2.81-1.31"/></svg>
    `,
    ctas: `
      <a href="/api/download/android" class="btn-spectrum">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5v17a1 1 0 0 0 1.5.87l14-8.5a1 1 0 0 0 0-1.74l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>
        <span>Android APK</span>
      </a>
      <a href="#features" class="btn-ghost"><span>Google Play (Bientôt)</span></a>
      <a href="/web" class="btn-ghost"><span>Web PWA</span></a>
    `
  },
  tv: {
    title: "MegaTv pour Android TV & Fire TV",
    sub: "Expérience grand écran pensée pour la télécommande. Hero immersif 4K, bascule ultra-fluide des flux IPTV, guide EPG direct et synchronisation des profils.",
    image: "assets/tv-home-new.png",
    logos: `
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" style="width:28px;height:28px;"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8"/><path d="M12 18v2"/></svg>
      <svg viewBox="0 0 24 24" fill="#ff9900" style="width:26px;height:26px;"><path d="M17.9 2.318A5.006 5.006 0 0 0 12.9 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h7.9a5.006 5.006 0 0 0 5-4.318L19.2 12l-1.3-9.682zM17 12l-7 4V8l7 4z"/></svg>
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
    sub: "Accédez à l'ensemble de votre catalogue, vos flux TV en direct et votre progression directement depuis Google Chrome, Edge, Safari ou Firefox.",
    image: "assets/web-screens/top10.png",
    logos: `
      <svg viewBox="0 0 24 24" fill="none" stroke="#3f9ae6" stroke-width="2" style="width:28px;height:28px;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" style="width:26px;height:26px;"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
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
  if (titleEl) titleEl.textContent = d.title;
  if (subEl) subEl.textContent = d.sub;
  if (logosEl) logosEl.innerHTML = d.logos;
  if (ctasEl) ctasEl.innerHTML = d.ctas;
  if (imgEl) {
    imgEl.style.opacity = '0';
    setTimeout(() => { imgEl.src = d.image; imgEl.style.opacity = '1'; }, 150);
  }
}
window.switchScreen = switchScreen;

/* ---------- AUTH USER SYNC FOR PROMO TOP BAR ---------- */
(function checkUserAuth() {
  try {
    sb.auth.getUser().then(({ data: { user } }) => {
      const authBtn = document.getElementById('promo-auth-btn');
      if (user && authBtn) {
        const name = user.email ? user.email.split('@')[0] : 'Profil';
        authBtn.innerHTML = `
          <div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#3f9ae6,#d8497f);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">${name[0].toUpperCase()}</div>
          <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        `;
        authBtn.href = '/companion';
      }
    });
  } catch (_) {}
})();

/* ---------- INIT ---------- */
onNav();
applyParallax();
applyLang('fr');

