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

/* ---------- I18N & MULTI-CURRENCY ---------- */
const i18n = window.PROMO_I18N || {
  fr: {
    "hero.title": "La liberté de regarder.",
    "hero.sub": "Films, séries et TV en direct. Une app pour chaque écran, avec vos propres sources.",
    "hero.btnDownload": "Télécharger MegaTv",
    "hero.btnMore": "Autres téléchargements",
    "price.eyebrow": "Formules & Tarifs",
    "price.title": "Choisissez votre formule",
    "price.sub": "Le lecteur de base reste 100% gratuit. Passez Pro quand vous le souhaitez pour synchroniser tous vos appareils et débloquer les bonus.",
    "plan.free.name": "Gratuit",
    "plan.free.sub": "Pour toujours",
    "plan.free.cta": "Télécharger gratuitement",
    "plan.free.f1": "Accès à toutes vos sources",
    "plan.free.f2": "IPTV M3U & Xtream",
    "plan.free.f3": "Plex, Jellyfin, Emby",
    "plan.free.f4": "1 profil utilisateur",
    "plan.monthly.sub": "Sans engagement",
    "plan.monthly.cta": "Commencer",
    "plan.annual.badge": "Plus Populaire",
    "plan.annual.sub": "≈ 1 € / mois · 6 mois offerts",
    "plan.annual.cta": "Économiser maintenant",
    "plan.annual.f6": "Accès anticipé aux fonctionnalités",
    "plan.lifetime.name": "Pro À Vie",
    "plan.lifetime.sub": "Payez une fois, profitez à vie",
    "plan.lifetime.cta": "Posséder à vie",
    "plan.lifetime.f5": "Toutes les futures fonctionnalités",
    "plan.lifetime.f6": "Support prioritaire à vie",
    "plan.pro.f1": "Tout le plan Gratuit",
    "plan.pro.f2": "Jusqu'à 5 profils familiaux",
    "plan.pro.f3": "Sous-titres IA en direct",
    "plan.pro.f4": "Sync Cloud multi-appareils",
    "plan.pro.f6": "Support prioritaire Discord",
    "legal.text": "MegaTv est un lecteur et navigateur média. Aucun film, série, chaîne ou flux n'est fourni par l'application. L'utilisateur configure ses propres services et playlists et reste responsable de leur utilisation conformément à la loi en vigueur dans son pays."
  },
  en: {
    "hero.title": "Freedom to Stream",
    "hero.sub": "Discover all your entertainment with MegaTv",
    "hero.btnDownload": "Download MegaTv",
    "hero.btnMore": "Other downloads",
    "price.eyebrow": "Plans & Pricing",
    "price.title": "Choose your plan",
    "price.sub": "The core player is 100% free. Upgrade to Pro anytime to sync all devices and unlock perks.",
    "plan.free.name": "Free",
    "plan.free.sub": "Forever",
    "plan.free.cta": "Download for free",
    "plan.free.f1": "Access all your media sources",
    "plan.free.f2": "IPTV M3U & Xtream playlists",
    "plan.free.f3": "Plex, Jellyfin, Emby libraries",
    "plan.free.f4": "1 user profile",
    "plan.monthly.sub": "Cancel anytime",
    "plan.monthly.cta": "Get started",
    "plan.annual.badge": "Most Popular",
    "plan.annual.sub": "≈ $1 / mo · 6 months free",
    "plan.annual.cta": "Save now",
    "plan.annual.f6": "Early access to upcoming features",
    "plan.lifetime.name": "Pro Lifetime",
    "plan.lifetime.sub": "Pay once, enjoy forever",
    "plan.lifetime.cta": "Own it forever",
    "plan.lifetime.f5": "All future features included",
    "plan.lifetime.f6": "Lifetime priority support",
    "plan.pro.f1": "Everything in Free",
    "plan.pro.f2": "Up to 5 family profiles",
    "plan.pro.f3": "Real-time AI Subtitles",
    "plan.pro.f4": "Multi-device cloud sync",
    "plan.pro.f6": "Priority Discord support",
    "legal.text": "MegaTv is a media player and browser. No movie, show, channel or stream is provided by the application. The user configures their own services and playlists and remains responsible for their use in accordance with applicable laws."
  },
  es: {
    "hero.title": "La Libertad de Transmitir",
    "hero.sub": "Descubre todo el entretenimiento con MegaTv",
    "hero.btnDownload": "Descargar MegaTv",
    "hero.btnMore": "Otras descargas",
    "price.eyebrow": "Planes y Tarifas",
    "price.title": "Elige tu plan",
    "price.sub": "El reproductor base es 100% gratis. Pasa a Pro cuando quieras para sincronizar todos tus dispositivos.",
    "plan.free.name": "Gratis",
    "plan.free.sub": "Para siempre",
    "plan.free.cta": "Descargar gratis",
    "plan.free.f1": "Acceso a todas tus fuentes",
    "plan.free.f2": "IPTV M3U y Xtream",
    "plan.free.f3": "Plex, Jellyfin, Emby",
    "plan.free.f4": "1 perfil de usuario",
    "plan.monthly.sub": "Sin compromiso",
    "plan.monthly.cta": "Empezar",
    "plan.annual.badge": "Más Popular",
    "plan.annual.sub": "≈ 1 € / mes · 6 meses gratis",
    "plan.annual.cta": "Ahorrar ahora",
    "plan.annual.f6": "Acceso anticipado a funciones",
    "plan.lifetime.name": "Pro Para Siempre",
    "plan.lifetime.sub": "Paga una vez, disfruta para siempre",
    "plan.lifetime.cta": "Tener de por vida",
    "plan.lifetime.f5": "Todas las funciones futuras",
    "plan.lifetime.f6": "Soporte prioritario de por vida",
    "plan.pro.f1": "Todo el plan Gratis",
    "plan.pro.f2": "Hasta 5 perfiles familiares",
    "plan.pro.f3": "Subtítulos con IA en directo",
    "plan.pro.f4": "Sincronización multi-dispositivo",
    "plan.pro.f6": "Soporte prioritario en Discord",
    "legal.text": "MegaTv es un reproductor y navegador multimedia. La aplicación no suministra películas, series ni canales. El usuario configura sus propios servicios."
  }
};

let currentLang = 'fr';

function updatePricingDisplay(lang) {
  const isUSD = (lang === 'en');
  const freeEl = document.getElementById('price-free');
  const monthlyEl = document.getElementById('price-monthly');
  const annualEl = document.getElementById('price-annual');
  const lifetimeEl = document.getElementById('price-lifetime');
  const sym = isUSD ? "$" : "€";
  const dec = isUSD ? "." : ",";
  const mo = t(lang, "price.perMonth") || (isUSD ? "/ mo" : "/ mois");
  const yr = t(lang, "price.perYear") || (isUSD ? "/ yr" : "/ an");
  const once = t(lang, "price.once") || (isUSD ? "one-time" : "unique");
  if (freeEl) freeEl.innerHTML = `0<sup class="currency-symbol">${sym}</sup>`;
  if (monthlyEl) monthlyEl.innerHTML = `1${dec}99<sup class="currency-symbol">${sym}</sup><span> ${mo}</span>`;
  if (annualEl) annualEl.innerHTML = `11${dec}99<sup class="currency-symbol">${sym}</sup><span> ${yr}</span>`;
  if (lifetimeEl) lifetimeEl.innerHTML = `29${dec}99<sup class="currency-symbol">${sym}</sup><span> ${once}</span>`;
}

const RTL_LANGS = new Set(["ar", "ur"]);

function t(lang, key) {
  return (i18n[lang] && i18n[lang][key]) || (i18n.fr && i18n.fr[key]) || "";
}

function changeLanguage(lang) {
  if (!i18n[lang]) lang = "fr";
  currentLang = lang;
  const html = document.documentElement;
  html.setAttribute("data-lang", lang);
  html.lang = lang;
  html.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
  try { localStorage.setItem("megatv_lang", lang); } catch (_) {}

  document.querySelectorAll("[data-lang-label]").forEach((el) => {
    const meta = (window.PROMO_LANGS || []).find((item) => item.id === lang);
    el.textContent = meta ? meta.label : lang.toUpperCase();
  });
  document.querySelectorAll(".lang-option").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(lang, key);
    if (value) el.textContent = value;
  });

  html.style.setProperty("--platforms-label", `"${t(lang, "platforms.label") || "Disponible sur"}"`);
  updatePricingDisplay(lang);
  if (typeof refreshActiveScreen === "function") refreshActiveScreen();
  if (typeof window.syncFeatBlurbs === "function") window.syncFeatBlurbs();
}
window.changeLanguage = changeLanguage;
window.applyLang = changeLanguage;

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
function applyTheme(){
  const html = document.documentElement;
  html.setAttribute('data-theme', 'dark');
  html.dataset.theme = 'dark';
  html.style.colorScheme = 'dark';
  document.body.setAttribute('data-theme', 'dark');
}
function toggleTheme(){}
window.toggleTheme = toggleTheme;
applyTheme();

/* ---------- NAV scrolled state ---------- */
const nav = document.querySelector('.nav');
function onNav(){ if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }

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
    if (card.classList.contains("price-card") && window.matchMedia("(max-width: 720px)").matches) return;
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

/* ---------- SCREEN PICKER TABS (NUVIO PILL, ADAPTED) ---------- */
const PLAY_ICON = `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3.6 1.4A1.6 1.6 0 0 0 3 2.6v18.8c0 .5.2.9.6 1.2l9.9-10.3L3.6 1.4z" fill="#00E5FF"/><path d="M16.9 15.7l-3.4-3.4 3.4-3.4.1.1 4 2.3c1.1.6 1.1 1.7 0 2.3l-4.1 2.1z" fill="#FFC107"/><path d="M13.5 12.3L3.6 22.6c.4.4 1 .4 1.7 0l11.6-6.9-3.4-3.4z" fill="#FF3D00"/><path d="M13.5 12.3L16.9 8.9 5.3 2.1c-.7-.4-1.3-.4-1.7 0l9.9 10.2z" fill="#4CAF50"/></svg>`;
const APK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>`;
const GOOGLE = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>`;
const FIRE_MARK = `<span class="word-firetv"><img class="firetv-wordmark" src="assets/firetv-wordmark.png" alt="Fire TV"></span>`;
function playSoon(lang) {
  return `<span class="btn-play-soon">${PLAY_ICON}<span><small>${t(lang, "soon.play")}</small><strong>Google Play</strong></span></span>`;
}
function apkLink(label) {
  return `<a class="btn-apk" href="/api/download/android">${APK_ICON}${label}</a>`;
}
function downloaderCode(lang) {
  return `<span class="downloader-code" title="Downloader"><small>${t(lang, "apk.downloader")}</small><strong>6854369</strong></span>`;
}
const ANDROID = `<svg viewBox="0 0 24 24" fill="#3DDC84"><path d="M18.4395 5.5586c-.675 1.1664-1.352 2.3318-2.0274 3.498-.0366-.0155-.0742-.0286-.1113-.043-1.8249-.6957-3.484-.8-4.42-.787-1.8551.0185-3.3544.4643-4.2597.8203-.084-.1494-1.7526-3.021-2.0215-3.4864a1.1451 1.1451 0 0 0-.1406-.1914c-.3312-.364-.9054-.4859-1.379-.203-.475.282-.7136.9361-.3886 1.5019 1.9466 3.3696-.0966-.2158 1.9473 3.3593.0172.031-.4946.2642-1.3926 1.0177C2.8987 12.176.452 14.772 0 18.9902h24c-.119-1.1108-.3686-2.099-.7461-3.0683-.7438-1.9118-1.8435-3.2928-2.7402-4.1836a12.1048 12.1048 0 0 0-2.1309-1.6875c.6594-1.122 1.312-2.2559 1.9649-3.3848.2077-.3615.1886-.7956-.0079-1.1191a1.1001 1.1001 0 0 0-.8515-.5332c-.5225-.0536-.9392.3128-1.0488.5449zm-.0391 8.461c.3944.5926.324 1.3306-.1563 1.6503-.4799.3197-1.188.0985-1.582-.4941-.3944-.5927-.324-1.3307.1563-1.6504.4727-.315 1.1812-.1086 1.582.4941zM7.207 13.5273c.4803.3197.5506 1.0577.1563 1.6504-.394.5926-1.1038.8138-1.584.4941-.48-.3197-.5503-1.0577-.1563-1.6504.4008-.6021 1.1087-.8106 1.584-.4941z"/></svg>`;
const APPLE = `<svg viewBox="0 0 24 24" fill="#F1F0F4"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.88-.91.04-2.01.61-2.65 1.37-.57.65-1.07 1.73-.93 2.76 1.01.08 2.02-.51 2.65-1.25z"/></svg>`;
let activeScreen = "mobile";
function screenPack(lang) {
  const play = playSoon(lang);
  const webIcon = `<div class="nuvio-marks"><svg viewBox="0 0 24 24" fill="none" stroke="#F1F0F4" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.8 3.8 5.8 3.8 9S14.5 18.2 12 21c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"/></svg></div>`;
  const smartIcon = `<div class="nuvio-marks"><svg viewBox="0 0 24 24" fill="none" stroke="#F1F0F4" stroke-width="1.6"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg></div>`;
  return {
    mobile: {
      title: t(lang, "screen.mobile.title"),
      sub: t(lang, "screen.mobile.sub"),
      logos: `<div class="nuvio-marks">${ANDROID}${APPLE}</div>`,
      ctas: `${play}${apkLink(t(lang, "apk.android"))}<span class="btn-soon-pill">${t(lang, "soon.ios")}</span>`
    },
    tv: {
      title: t(lang, "screen.tv.title"),
      sub: t(lang, "screen.tv.sub"),
      logos: `<div class="nuvio-wordmarks"><span class="word-androidtv">Android <b>TV</b></span><span class="word-googletv">${GOOGLE}Google TV</span>${FIRE_MARK}</div>`,
      ctas: `${play}${apkLink(t(lang, "apk.tv"))}<span class="fire-apk-row">${apkLink(t(lang, "apk.fire"))}${downloaderCode(lang)}</span>`
    },
    web: {
      title: t(lang, "screen.web.title"),
      sub: t(lang, "screen.web.sub"),
      logos: webIcon,
      ctas: `<a class="btn-apk" href="/web">${t(lang, "web.launch")}</a><a class="btn-apk" href="/companion">${t(lang, "web.companion")}</a>`
    },
    smart: {
      title: t(lang, "screen.smart.title"),
      sub: t(lang, "screen.smart.sub"),
      logos: smartIcon,
      ctas: `<span class="btn-soon-pill">${t(lang, "soon.smart")}</span>`
    }
  };
}
function refreshActiveScreen() {
  switchScreen(activeScreen, document.querySelector(".nuvio-tab.active"));
}
function switchScreen(platform, btn) {
  activeScreen = platform || activeScreen;
  document.querySelectorAll(".nuvio-tab").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const d = screenPack(currentLang)[activeScreen];
  if (!d) return;
  const titleEl = document.getElementById("screen-card-title");
  const subEl = document.getElementById("screen-card-sub");
  const logosEl = document.getElementById("screen-card-logos");
  const ctasEl = document.getElementById("screen-card-ctas");
  const markEl = document.getElementById("screen-card-mark");
  if (titleEl) titleEl.textContent = d.title;
  if (subEl) subEl.textContent = d.sub;
  if (logosEl) logosEl.innerHTML = d.logos;
  if (ctasEl) ctasEl.innerHTML = d.ctas;
  if (markEl) {
    if (d.mark) {
      markEl.hidden = false;
      markEl.innerHTML = d.mark;
    } else {
      markEl.hidden = true;
      markEl.innerHTML = "";
    }
  }
}
window.switchScreen = switchScreen;

function toggleNavSheet(force) {
  const sheet = document.getElementById("nav-sheet");
  const btn = document.getElementById("nav-burger");
  const wrap = document.querySelector(".floating-nav-wrap");
  if (!sheet || !btn || !wrap) return;
  const open = typeof force === "boolean" ? force : sheet.hasAttribute("hidden");
  if (open) {
    sheet.removeAttribute("hidden");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Fermer le menu");
    wrap.classList.add("is-open");
  } else {
    sheet.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Ouvrir le menu");
    wrap.classList.remove("is-open");
  }
}
window.toggleNavSheet = toggleNavSheet;
document.getElementById("nav-burger")?.addEventListener("click", () => toggleNavSheet());

function syncStickyBar() {
  const bar = document.querySelector(".sticky-download-bar");
  if (!bar) return;
  bar.classList.toggle("is-away", window.scrollY < 12);
}
function bindStickyBar() {
  const bar = document.querySelector(".sticky-download-bar");
  if (!bar) return;
  const sentinel = document.createElement("div");
  sentinel.className = "sticky-scroll-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  document.body.prepend(sentinel);
  if ("IntersectionObserver" in window) {
    const watcher = new IntersectionObserver(([entry]) => {
      bar.classList.toggle("is-away", entry.isIntersecting);
    }, { threshold: 0 });
    watcher.observe(sentinel);
  }
  window.addEventListener("scroll", syncStickyBar, { passive: true });
  syncStickyBar();
}
bindStickyBar();
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") toggleNavSheet(false);
});
document.addEventListener("click", (event) => {
  const wrap = document.querySelector(".floating-nav-wrap");
  if (!wrap || !wrap.classList.contains("is-open")) return;
  if (!wrap.contains(event.target)) toggleNavSheet(false);
});
switchScreen("mobile", document.querySelector(".nuvio-tab"));
switchScreen("mobile", document.querySelector(".nuvio-tab"));

const pageShots = {
  accueil: { mobile: "assets/captures/accueil-mobile.webp", tv: "assets/captures/accueil-tv.webp" },
  detail: { mobile: "assets/captures/detail-mobile.webp", tv: "assets/captures/detail-tv.webp" },
  recherche: { mobile: "assets/captures/recherche-mobile.webp", tv: "assets/captures/recherche-tv.webp" },
  iptv: { mobile: "assets/captures/livetv-mobile.webp", tv: "assets/captures/livetv-tv.webp" }
};
function switchPage(page, btn) {
  document.querySelectorAll(".page-chip").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const shot = document.getElementById("device-shot");
  if (shot && pageShots[page]) shot.src = "assets/devices/quad-" + page + ".webp";
}
window.switchPage = switchPage;

/* ---------- AUTH USER SYNC & PROFILE DROPDOWN (ISO REQUIREMENT 1) ---------- */
let isUserAuthenticated = false;

function handleProfileClick(event) {
  if (isUserAuthenticated) {
    event.preventDefault();
    event.stopPropagation();
    const dropdown = document.getElementById('promo-profile-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
      dropdown.setAttribute('aria-hidden', !dropdown.classList.contains('open'));
    }
  }
}
window.handleProfileClick = handleProfileClick;

// Close profile dropdown when clicking outside
document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('promo-profile-dropdown');
  const authBtn = document.getElementById('promo-auth-btn');
  if (dropdown && dropdown.classList.contains('open')) {
    if (!dropdown.contains(event.target) && !authBtn.contains(event.target)) {
      dropdown.classList.remove('open');
      dropdown.setAttribute('aria-hidden', 'true');
    }
  }
});

async function logoutUser() {
  try {
    await sb.auth.signOut();
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (_) {}
  window.location.reload();
}
window.logoutUser = logoutUser;

async function checkUserAuth() {
  const authBtn = document.getElementById('promo-auth-btn');
  if (authBtn) {
    authBtn.href = '/login?next=' + encodeURIComponent(window.location.pathname || '/');
  }
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.authenticated && data.user && authBtn) {
      isUserAuthenticated = true;
      const displayName = data.profile?.name || (data.user.email ? data.user.email.split('@')[0] : 'Profil');
      const avatarSrc = data.profile?.avatar_url;
      const userEmail = data.user.email || 'user@megatv.app';

      const avatarHtml = avatarSrc
        ? `<img src="${avatarSrc}" alt="${displayName}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.5);shrink:0;" />`
        : `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3f9ae6,#d8497f);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700;color:#fff;">${displayName[0].toUpperCase()}</div>`;

      authBtn.innerHTML = `
        ${avatarHtml}
        <span class="profile-name-text" style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;">${displayName}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6;"><polyline points="6 9 12 15 18 9"/></svg>
      `;

      const sheetLogin = document.getElementById("nav-sheet-login");
      const sheetAccount = document.getElementById("nav-sheet-account");
      if (sheetLogin) sheetLogin.hidden = true;
      if (sheetAccount) {
        sheetAccount.hidden = false;
        const face = avatarSrc
          ? `<img src="${avatarSrc}" alt="">`
          : `<div class="nav-sheet-avatar">${displayName[0].toUpperCase()}</div>`;
        sheetAccount.innerHTML = `
          <div class="nav-sheet-profile">${face}<div><strong>${displayName}</strong><span data-i18n="nav.active">${t(currentLang, "nav.active")}</span></div></div>
          <a class="nav-sheet-link" href="/companion"><span data-i18n="nav.companion">${t(currentLang, "nav.companion")}</span></a>
          <a class="nav-sheet-link" href="/companion#profils"><span data-i18n="nav.profile">${t(currentLang, "nav.profile")}</span></a>
          <button type="button" class="nav-sheet-link nav-sheet-logout" onclick="logoutUser()"><span data-i18n="nav.logout">${t(currentLang, "nav.logout")}</span></button>
        `;
      }

      // Populate rich dropdown elements
      const nameEl = document.getElementById('dropdown-user-name');
      const emailEl = document.getElementById('dropdown-user-email');
      const avatarWrap = document.getElementById('dropdown-avatar-wrap');
      if (nameEl) nameEl.textContent = displayName;
      if (emailEl) emailEl.textContent = userEmail;
      if (avatarWrap) {
        avatarWrap.innerHTML = avatarSrc
          ? `<img src="${avatarSrc}" alt="${displayName}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />`
          : `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#3f9ae6,#d8497f);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;">${displayName[0].toUpperCase()}</div>`;
      }
    }
  } catch (e) {
    console.error('Auth sync check error:', e);
  }
}
checkUserAuth();

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

function initLangMenus() {
  const langs = window.PROMO_LANGS || [];
  document.querySelectorAll("[data-lang-menu]").forEach((menu) => {
    const panel = menu.querySelector(".lang-menu-panel");
    const btn = menu.querySelector(".lang-menu-btn");
    if (!panel || panel.dataset.ready) return;
    panel.dataset.ready = "1";
    panel.innerHTML = langs.map((item) =>
      `<button type="button" class="lang-option" data-lang="${item.id}" role="option"><span>${item.label}</span><small>${item.id.toUpperCase()}</small></button>`
    ).join("");
    btn?.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = !menu.classList.contains("is-open");
      document.querySelectorAll("[data-lang-menu].is-open").forEach((other) => other.classList.remove("is-open"));
      menu.classList.toggle("is-open", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
    panel.addEventListener("click", (event) => {
      const opt = event.target.closest(".lang-option");
      if (!opt) return;
      changeLanguage(opt.dataset.lang);
      menu.classList.remove("is-open");
      btn?.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll("[data-lang-menu].is-open").forEach((menu) => {
      menu.classList.remove("is-open");
      menu.querySelector(".lang-menu-btn")?.setAttribute("aria-expanded", "false");
    });
  });
}

function initSoonPops() {
  document.querySelectorAll(".social-soon").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const pop = btn.querySelector(".soon-pop");
      if (!pop) return;
      document.querySelectorAll(".soon-pop").forEach((other) => { other.hidden = true; });
      pop.hidden = false;
      clearTimeout(btn._soonTimer);
      btn._soonTimer = setTimeout(() => { pop.hidden = true; }, 1800);
    });
  });
}

function syncFeatBlurbs() {
  const root = document.getElementById("feat-studio");
  if (!root) return;
  root.querySelectorAll("[data-feat-btn]").forEach((btn) => {
    const id = btn.getAttribute("data-feat-btn");
    const copy = root.querySelector(`[data-feat-panel="${id}"] .feat-copy p:not(.feat-kicker)`);
    if (!copy) return;
    let desc = btn.querySelector(".feat-rail-desc");
    if (!desc) {
      desc = document.createElement("span");
      desc.className = "feat-rail-desc";
      btn.appendChild(desc);
    }
    desc.textContent = copy.textContent.trim();
  });
}
window.syncFeatBlurbs = syncFeatBlurbs;

function initPricingFan() {
  const grid = document.querySelector("#pricing .pricing-grid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll(".price-card")];
  const mq = window.matchMedia("(max-width: 720px)");
  const bringFront = (card) => {
    cards.forEach((item) => item.classList.toggle("is-front", item === card));
  };
  const featured = grid.querySelector(".price-card.featured") || cards[0];
  if (featured) bringFront(featured);
  grid.addEventListener("click", (event) => {
    if (!mq.matches) return;
    const card = event.target.closest(".price-card");
    if (!card || !grid.contains(card)) return;
    if (!card.classList.contains("is-front")) {
      event.preventDefault();
      bringFront(card);
      return;
    }
    const link = card.querySelector("a.btn-price");
    if (!link || event.target.closest("a.btn-price")) return;
    event.preventDefault();
    window.location.href = link.getAttribute("href");
  });
}

function initFeatStudio() {
  const root = document.getElementById("feat-studio");
  if (!root) return;
  const buttons = root.querySelectorAll("[data-feat-btn]");
  const panels = root.querySelectorAll("[data-feat-panel]");
  const rail = root.querySelector(".feat-rail");
  function show(id) {
    buttons.forEach((btn) => {
      const on = btn.getAttribute("data-feat-btn") === id;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      if (on && rail && window.matchMedia("(max-width: 860px)").matches) {
        const left = btn.offsetLeft - (rail.clientWidth - btn.offsetWidth) / 2;
        rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      }
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-on", panel.getAttribute("data-feat-panel") === id);
    });
  }
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => show(btn.getAttribute("data-feat-btn")));
  });
  syncFeatBlurbs();
}

/* ---------- INIT ---------- */
onNav();
applyParallax();
initLangMenus();
initSoonPops();
initFeatStudio();
initPricingFan();
let savedLang = "fr";
try { savedLang = localStorage.getItem("megatv_lang") || "fr"; } catch (_) {}
applyLang(savedLang);
initCookieConsent();


