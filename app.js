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
    "nav.features":"Fonctionnalités","nav.pricing":"Tarifs","nav.account":"Mon Compte","nav.login":"Se connecter","nav.pro":"Passer Pro",
    "hero.badge":"Disponible sur Android TV · Mobile · Fire TV",
    "hero.sub":"Une application, toutes vos sources. Regardez ce que vous voulez, où que vous soyez, sur tous vos écrans.",
    "hero.cta1":"Télécharger gratuitement","hero.cta2":"Découvrir",
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
    "acc.eyebrow":"Mon Espace","acc.title":"Gérez votre compte","acc.sub":"Connectez-vous pour accéder à vos profils, gérer vos appareils et choisir votre formule Pro.",
    "acc.login.title":"Connexion MegaTv Cloud","acc.login.sub":"Accédez à vos profils et synchronisez vos appareils.","acc.email":"Adresse email","acc.password":"Mot de passe","acc.login.btn":"Se connecter","acc.devices":"Appareils jumelés","acc.loading":"Chargement...","acc.logout":"Se déconnecter","acc.profiles.title":"Mes Profils","acc.profiles.sub":"Connectez-vous pour voir et gérer vos profils.","acc.profiles.empty":"Connectez-vous pour voir vos profils",
    "legal.text":"MegaTv est un lecteur et navigateur média. Aucun film, série, chaîne ou flux n'est fourni par l'application. L'utilisateur configure ses propres services et playlists et reste responsable de leur utilisation conformément à la loi en vigueur dans son pays.",
    "footer.desc":"Films, séries et TV en direct. Une seule app, toutes vos sources.","footer.app":"Application","footer.download":"Télécharger","footer.legal":"Légal","footer.privacy":"Politique de confidentialité","footer.terms":"CGU","footer.contact":"Contact","footer.copy":"© 2026 MegaTv. Tous droits réservés.",
  },
  en: {
    "nav.features":"Features","nav.pricing":"Pricing","nav.account":"My Account","nav.login":"Log in","nav.pro":"Go Pro",
    "hero.badge":"Available on Android TV · Mobile · Fire TV",
    "hero.sub":"One app, all your sources. Watch what you want, wherever you are, on all your screens.",
    "hero.cta1":"Download free","hero.cta2":"Explore",
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
    "acc.eyebrow":"My Account","acc.title":"Manage your account","acc.sub":"Log in to access your profiles, manage devices and choose your Pro plan.",
    "acc.login.title":"MegaTv Cloud Login","acc.login.sub":"Access your profiles and sync your devices.","acc.email":"Email address","acc.password":"Password","acc.login.btn":"Log in","acc.devices":"Paired devices","acc.loading":"Loading...","acc.logout":"Log out","acc.profiles.title":"My Profiles","acc.profiles.sub":"Log in to view and manage your profiles.","acc.profiles.empty":"Log in to see your profiles",
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

/* ---------- AUTH (Supabase) ---------- */
async function handleAccountLogin(){
  const email = document.getElementById('acc-email').value.trim();
  const password = document.getElementById('acc-password').value;
  if(!email || !password){ showLoginStatus(currentLang==='fr'?'Veuillez remplir tous les champs.':'Please fill in all fields.','error'); return; }
  showLoginStatus(currentLang==='fr'?'Connexion en cours...':'Signing in...','');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if(error){ showLoginStatus((currentLang==='fr'?'Erreur : ':'Error: ') + error.message,'error'); return; }
  showLoginStatus('','');
  await loadUserData(data.user);
}
window.handleAccountLogin = handleAccountLogin;

async function loadUserData(user){
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('user-panel').style.display = 'block';
  const email = user.email || '';
  document.getElementById('user-avatar-initials').textContent = email.substring(0,2).toUpperCase();
  document.getElementById('user-name-display').textContent = user.user_metadata?.full_name || email.split('@')[0];
  document.getElementById('user-email-display').textContent = email;

  const { data: pairings } = await sb.from('tv_pairings').select('*').eq('account_id', user.id);
  const devicesList = document.getElementById('devices-list');
  if(pairings && pairings.length > 0){
    devicesList.innerHTML = pairings.map(p=>`
      <div class="device-row">
        <span class="device-icon">📺</span>
        <div class="device-info">
          <div class="device-name">TV ${p.code || '—'}</div>
          <div class="device-detail">${p.status === 'paired' ? (currentLang==='fr'?'Connecté':'Connected') : (currentLang==='fr'?'En attente':'Pending')}</div>
        </div>
        <div class="device-status ${p.status === 'paired' ? '' : 'inactive'}"></div>
      </div>`).join('');
  } else {
    devicesList.innerHTML = `<div style="text-align:center;padding:20px;color:var(--c-text3);font-size:14px;">${currentLang==='fr'?'Aucun appareil jumelé':'No paired devices'}</div>`;
  }

  const { data: profiles } = await sb.from('profiles').select('*').eq('user_id', user.id);
  const profileColors = ['#5b63d6','#d8497f','#f2b43c','#1fa8a0','#5fbf5a'];
  const profilesList = document.getElementById('profiles-manage-list');
  document.getElementById('profiles-panel').querySelector('.account-panel-sub').style.display = 'none';
  if(profiles && profiles.length > 0){
    profilesList.innerHTML = profiles.map((p,i)=>`
      <div class="profile-row">
        <div class="profile-row-avatar" style="background:${profileColors[i % profileColors.length]};">
          ${p.avatar_url ? `<img src="${p.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">` : (p.name || '?').charAt(0).toUpperCase()}
        </div>
        <div class="profile-row-name">${p.name || 'Profil'}</div>
        <span class="profile-row-badge">${p.is_kids ? (currentLang==='fr'?'Enfants':'Kids') : (currentLang==='fr'?'Adulte':'Adult')}</span>
      </div>`).join('');
  } else {
    profilesList.innerHTML = `<div style="text-align:center;padding:20px;color:var(--c-text3);font-size:14px;">${currentLang==='fr'?'Aucun profil trouvé':'No profiles found'}</div>`;
  }
}

async function handleLogout(){
  await sb.auth.signOut();
  document.getElementById('login-form').style.display = 'flex';
  document.getElementById('user-panel').style.display = 'none';
  document.getElementById('acc-email').value = '';
  document.getElementById('acc-password').value = '';
  document.getElementById('profiles-manage-list').innerHTML = `<div style="text-align:center;padding:40px;color:var(--c-text3);font-size:14px;" data-i18n="acc.profiles.empty">${i18n[currentLang]['acc.profiles.empty']}</div>`;
}
window.handleLogout = handleLogout;

function showLoginStatus(msg, type){
  const el = document.getElementById('login-status');
  el.textContent = msg;
  el.className = type === 'error' ? 'status-error' : type === 'success' ? 'status-success' : '';
  el.style.display = msg ? 'block' : 'none';
}

sb.auth.getSession().then(({ data:{ session } })=>{ if(session?.user) loadUserData(session.user); });

/* ---------- INFINITE SCREENS ---------- */
const track = document.getElementById('screensTrack');
if(track){ track.innerHTML += track.innerHTML; }

/* ---------- INIT ---------- */
onNav();
applyParallax();
applyLang('fr');
