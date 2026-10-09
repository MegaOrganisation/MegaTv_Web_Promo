# -*- coding: utf-8 -*-
from pathlib import Path

css_path = Path('public/styles.css')
css = css_path.read_text(encoding='utf-8')

target_start = '/* ============================================================\n   STREMIO-INSPIRED FULL-SCREEN PROMO HERO (ISO PJ 2)\n   ============================================================ */'
target_end = '/* ============================================================\n   COOKIE CONSENT FLOATING BANNER (ISO PJ 3)\n   ============================================================ */'

start_idx = css.find(target_start)
end_idx = css.find(target_end)

if start_idx == -1 or end_idx == -1:
    print(f"CSS markers not found! start: {start_idx}, end: {end_idx}")
    exit(1)

new_css_section = """/* ============================================================
   STREMIO-INSPIRED FULL-SCREEN PROMO HERO (ISO MEDIA_1791236710074)
   ============================================================ */
.stremio-hero{
  min-height:86vh;display:flex;align-items:center;
  padding:clamp(120px,16vh,160px) clamp(20px,5vw,72px) 100px;
  position:relative;z-index:10;overflow:visible;
  background:radial-gradient(ellipse 65% 55% at 75% 35%, rgba(99,102,241,0.15), transparent 60%),
             radial-gradient(ellipse 55% 45% at 20% 25%, rgba(216,73,127,0.12), transparent 55%),
             #080a10;
}
.stremio-hero-inner{
  max-width:1320px;margin:0 auto;width:100%;
  display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:center;
}
@media(max-width:1020px){
  .stremio-hero-inner{grid-template-columns:1fr;gap:48px;text-align:center;}
}
.stremio-hero-content{position:relative;z-index:2;text-align:left;}
@media(max-width:1020px){
  .stremio-hero-content{text-align:center;}
}
.stremio-title{
  font-family:var(--font-display);font-size:clamp(40px,5.5vw,74px);font-weight:800;
  line-height:1.05;letter-spacing:-0.035em;color:#ffffff;margin-bottom:20px;
}
[data-theme="light"] .stremio-title{color:#0f172a;}
.stremio-sub{
  font-family:var(--font-body);font-size:clamp(17px,1.4vw,21px);
  color:rgba(255,255,255,0.72);line-height:1.5;max-width:540px;margin-bottom:34px;
}
@media(max-width:1020px){
  .stremio-sub{margin-left:auto;margin-right:auto;}
}
[data-theme="light"] .stremio-sub{color:rgba(15,23,42,0.72);}
.stremio-ctas{
  display:flex;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:10px;
}
@media(max-width:1020px){
  .stremio-ctas{justify-content:center;}
}
.btn-megatv-spectrum{
  display:inline-flex;align-items:center;gap:10px;padding:14px 34px;border-radius:9999px;
  background:linear-gradient(90deg, #3b82f6 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #f43f5e 100%) !important;
  color:#ffffff !important;font-weight:700;font-size:16px;text-decoration:none;
  box-shadow:0 12px 35px -6px rgba(59,130,246,0.5), 0 4px 18px rgba(244,63,94,0.4) !important;
  text-shadow:0 1px 2px rgba(0,0,0,0.3);
  border:1px solid rgba(255,255,255,0.25);
  transition:transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}
.btn-megatv-spectrum:hover{
  transform:translateY(-2px) scale(1.02);
  box-shadow:0 16px 45px -6px rgba(59,130,246,0.7), 0 6px 24px rgba(244,63,94,0.5) !important;
}
.btn-stremio-outline{
  display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:9999px;
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.20);
  color:#fff;font-weight:600;font-size:15.5px;text-decoration:none;
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  transition:all 0.2s ease;
}
.btn-stremio-outline:hover{
  background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.35);transform:translateY(-2px);
}
[data-theme="light"] .btn-stremio-outline{
  background:rgba(0,0,0,0.04);border-color:rgba(0,0,0,0.15);color:#0f172a;
}
[data-theme="light"] .btn-stremio-outline:hover{
  background:rgba(0,0,0,0.08);border-color:rgba(0,0,0,0.25);
}

/* 3D Fan-out Posters Cascade (ISO MEDIA_1791236710074) */
.stremio-fan-stage{
  position:relative;height:450px;display:flex;align-items:center;justify-content:center;
  perspective:1400px;perspective-origin:50% 40%;z-index:20;
}
@media(max-width:1020px){
  .stremio-fan-stage{height:360px;margin-top:10px;}
}
.stremio-fan-cards{
  position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  transform-style:preserve-3d;
}
.fan-card{
  position:absolute;width:180px;height:270px;border-radius:18px;overflow:hidden;
  box-shadow:0 25px 50px -10px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12);
  background:#141724;transition:transform 0.4s var(--ease), opacity 0.4s var(--ease);
}
.fan-card img{width:100%;height:100%;object-fit:cover;display:block;}
.fan-card-1{
  transform:translateX(-190px) translateZ(-80px) rotateY(32deg) scale(0.82);
  z-index:1;opacity:0.6;filter:brightness(0.65) blur(0.5px);
}
.fan-card-2{
  transform:translateX(-125px) translateZ(-40px) rotateY(24deg) scale(0.9);
  z-index:2;opacity:0.8;filter:brightness(0.78);
}
.fan-card-3{
  transform:translateX(-60px) translateZ(-10px) rotateY(16deg) scale(0.96);
  z-index:3;opacity:0.92;filter:brightness(0.9);
}
.fan-card-phone{
  width:220px;height:330px;border-radius:0;background:transparent;
  box-shadow:none;overflow:visible;
  transform:translateX(45px) translateY(35px) translateZ(60px) rotateY(-8deg) rotateX(4deg) scale(1.18);
  z-index:15;
}
.fan-card-phone img{
  width:100%;height:auto;object-fit:contain;
  filter:drop-shadow(0 25px 35px rgba(0,0,0,0.9));
}
.fan-card-encanto{
  transform:translateX(170px) translateZ(-15px) rotateY(-18deg) scale(0.98);
  z-index:6;opacity:0.95;
  box-shadow:0 25px 60px -10px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.18);
}
@media(max-width:1020px){
  .fan-card{width:120px;height:180px;}
  .fan-card-1{transform:translateX(-130px) rotateY(24deg) scale(0.8);}
  .fan-card-2{transform:translateX(-80px) rotateY(16deg) scale(0.88);}
  .fan-card-3{transform:translateX(-35px) rotateY(10deg) scale(0.94);}
  .fan-card-phone{width:160px;height:240px;transform:translateX(30px) translateY(15px) scale(1.15);}
  .fan-card-encanto{transform:translateX(115px) rotateY(-12deg) scale(0.95);}
}

/* ============================================================
   CHROMATIC AURORA SHOWCASE BANNER (ISO MEDIA_1791236710074)
   ============================================================ */
.stremio-feature-banner{
  position:relative;z-index:2;margin-top:-100px;
  padding:clamp(140px,14vw,180px) clamp(20px,5vw,72px) clamp(110px,11vw,150px);
  clip-path:polygon(0 90px, 100% 0, 100% calc(100% - 60px), 0 100%);
  background:linear-gradient(115deg, #0284c7 0%, #2563eb 18%, #7c3aed 42%, #c026d3 64%, #059669 88%, #10b981 100%);
  overflow:hidden;
}
.stremio-feature-banner::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background-image:
    radial-gradient(ellipse 65% 85% at 10% 40%, rgba(56,189,248,0.45), transparent 70%),
    radial-gradient(ellipse 55% 75% at 52% 45%, rgba(192,38,211,0.4), transparent 70%),
    radial-gradient(ellipse 65% 85% at 92% 55%, rgba(16,185,129,0.45), transparent 70%);
}
@media(max-width:980px){
  .stremio-feature-banner{
    margin-top:-50px;
    clip-path:polygon(0 50px, 100% 0, 100% calc(100% - 40px), 0 100%);
    padding:100px clamp(20px,5vw,40px) 90px;
  }
}
.stremio-banner-inner{
  max-width:1280px;margin:0 auto;position:relative;z-index:2;
  display:grid;grid-template-columns:1.05fr 0.95fr;gap:56px;align-items:center;
}
@media(max-width:980px){
  .stremio-banner-inner{grid-template-columns:1fr;gap:40px;}
}
.stremio-banner-mockup{
  display:flex;justify-content:center;align-items:center;
}
.chromatic-tv-wrapper{
  perspective:1200px;width:100%;max-width:580px;
}
.chromatic-tv-img{
  width:100%;height:auto;display:block;
  filter:drop-shadow(0 30px 60px rgba(0,0,0,0.7));
  transform:rotateY(4deg) rotateX(2deg);
  transition:transform 0.4s var(--ease);
}
.chromatic-tv-img:hover{
  transform:rotateY(0deg) rotateX(0deg);
}
.stremio-banner-text{color:#ffffff;}
.stremio-banner-editorial{
  font-family:var(--font-body);
  font-size:clamp(16px,1.45vw,19.5px);color:#ffffff;
  font-weight:400;line-height:1.62;letter-spacing:-0.01em;
  margin-bottom:34px;text-shadow:0 1px 4px rgba(0,0,0,0.3);
}
.stremio-banner-platforms-matrix{
  display:flex;flex-direction:column;gap:18px;
}
.stremio-platform-row{
  display:flex;align-items:center;flex-wrap:wrap;gap:clamp(16px,2.5vw,26px);
}
.stremio-platform-item{
  display:inline-flex;align-items:center;gap:8px;
  font-size:15.5px;font-weight:600;color:#ffffff;
  text-shadow:0 1px 3px rgba(0,0,0,0.3);
}
.stremio-platform-item svg{color:#ffffff;opacity:0.95;}
.stremio-brand-name{
  font-family:var(--font-display);font-weight:800;font-size:17px;
  letter-spacing:0.12em;color:#ffffff;text-shadow:0 1px 3px rgba(0,0,0,0.3);
}

/* ============================================================
   SLANTED CHROMATIC DIVIDERS & VOLUMETRIC SPOTLIGHTS
   ============================================================ */
.slanted-divider{
  width:100%;height:3px;
  background:linear-gradient(90deg, transparent, #0284c7 20%, #7c3aed 50%, #c026d3 75%, #10b981 92%, transparent);
  transform:skewY(-2deg);margin:46px 0;opacity:0.75;
  box-shadow:0 0 20px rgba(124,58,237,0.4);pointer-events:none;
}

.screen-picker-wrap{
  position:relative;
  background:radial-gradient(ellipse 70% 55% at 50% 10%, rgba(2,132,199,0.16), transparent 70%), var(--c-bg);
}
#features{
  position:relative;
  background:radial-gradient(circle at 12% 25%, rgba(124,58,237,0.14), transparent 50%),
             radial-gradient(circle at 88% 70%, rgba(16,185,129,0.13), transparent 50%),
             var(--c-bg);
}
[data-screen-label="TV Showcase"]{
  position:relative;
  background:radial-gradient(circle at 50% 40%, rgba(99,102,241,0.22), rgba(192,38,211,0.12), transparent 70%),
             var(--c-bg);
}
#pricing{
  position:relative;
  background:radial-gradient(ellipse 75% 50% at 50% 25%, rgba(124,58,237,0.18), rgba(2,132,199,0.10), transparent 75%),
             var(--c-bg);
}

"""

new_css = css[:start_idx] + new_css_section + css[end_idx:]
css_path.write_text(new_css, encoding='utf-8')
print("Successfully updated public/styles.css!")
