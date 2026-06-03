// MegaTV 2026 — Tweaks (live variants)
// Drives CSS variables + data attributes on <html> and window.MegaMotion.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#3f9ae6", "#1fa8a0", "#5fbf5a", "#f2b43c", "#ee6a54", "#d8497f"],
  "fontPair": "bricolage",
  "motion": "cinema",
  "hero": "trio",
  "bg": "aurora",
  "tilt": 70,
  "grain": true,
  "reflect": true,
  "theme": "dark"
}/*EDITMODE-END*/;

const FONT_PAIRS = {
  bricolage: ["'Bricolage Grotesque','Outfit',sans-serif", "'Instrument Sans','DM Sans',sans-serif"],
  space:     ["'Space Grotesk',sans-serif", "'Instrument Sans','DM Sans',sans-serif"],
  outfit:    ["'Outfit',sans-serif", "'DM Sans',sans-serif"]
};

function gradFrom(arr){
  const stops = arr.map((c,i)=> `${c} ${Math.round(i/(arr.length-1)*100)}%`).join(',');
  return `linear-gradient(110deg,${stops})`;
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(()=>{
    const root = document.documentElement;
    // palette
    root.style.setProperty('--grad-spectrum', gradFrom(t.palette));
    root.style.setProperty('--grad-soft', `linear-gradient(135deg,${t.palette[0]},${t.palette[t.palette.length-1]})`);
    // fonts
    const [disp, body] = FONT_PAIRS[t.fontPair] || FONT_PAIRS.bricolage;
    root.style.setProperty('--font-display', disp);
    root.style.setProperty('--font-body', body);
    // attributes
    root.setAttribute('data-motion', t.motion);
    root.setAttribute('data-hero', t.hero);
    root.setAttribute('data-bg', t.bg);
    root.setAttribute('data-grain', t.grain ? 'on' : 'off');
    root.setAttribute('data-reflect', t.reflect ? 'on' : 'off');
    root.setAttribute('data-theme', t.theme);
    document.body.setAttribute('data-theme', t.theme);
    // sync theme icon
    const icon = document.getElementById('theme-icon');
    if(icon){
      icon.innerHTML = t.theme === 'dark'
        ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="2"/>';
    }
    // motion intensity
    window.MegaMotion.tilt = t.tilt/100;
    window.MegaMotion.parallax = t.tilt/100;
  }, [t]);

  // Nav theme button → flip the theme tweak (keeps panel + button in sync)
  React.useEffect(()=>{
    window.__tweaksReady = true;
    const handler = ()=> setTweak('theme',
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    window.addEventListener('megatoggletheme', handler);
    return ()=> window.removeEventListener('megatoggletheme', handler);
  }, [setTweak]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette du logo" />
      <TweakColor label="Spectre" value={t.palette}
        options={[
          ["#3f9ae6","#1fa8a0","#5fbf5a","#f2b43c","#ee6a54","#d8497f"],
          ["#5b63d6","#3f9ae6","#1fa8a0","#5fbf5a"],
          ["#f2b43c","#f4904a","#ee6a54","#d8497f"],
          ["#5b63d6","#9a55b0","#d8497f"]
        ]}
        onChange={(v)=>setTweak('palette', v)} />

      <TweakSection label="Typographie" />
      <TweakSelect label="Pairing" value={t.fontPair}
        options={[
          {value:'bricolage', label:'Bricolage · Instrument'},
          {value:'space', label:'Space Grotesk · Instrument'},
          {value:'outfit', label:'Outfit · DM Sans (origine)'}
        ]}
        onChange={(v)=>setTweak('fontPair', v)} />

      <TweakSection label="Mouvement" />
      <TweakRadio label="Reveal au scroll" value={t.motion}
        options={[{value:'cinema',label:'Cinéma'},{value:'subtle',label:'Sobre'}]}
        onChange={(v)=>setTweak('motion', v)} />
      <TweakSlider label="Intensité 3D" value={t.tilt} min={0} max={100} step={5} unit="%"
        onChange={(v)=>setTweak('tilt', v)} />

      <TweakSection label="Hero" />
      <TweakRadio label="Disposition" value={t.hero}
        options={[{value:'trio',label:'Trio'},{value:'cascade',label:'Cascade'},{value:'solo',label:'Solo'}]}
        onChange={(v)=>setTweak('hero', v)} />

      <TweakSection label="Ambiance" />
      <TweakRadio label="Fond" value={t.bg}
        options={[{value:'aurora',label:'Aurora'},{value:'obsidian',label:'Obsidienne'}]}
        onChange={(v)=>setTweak('bg', v)} />
      <TweakRadio label="Thème" value={t.theme}
        options={[{value:'dark',label:'Sombre'},{value:'light',label:'Clair'}]}
        onChange={(v)=>setTweak('theme', v)} />
      <TweakToggle label="Grain" value={t.grain} onChange={(v)=>setTweak('grain', v)} />
      <TweakToggle label="Reflets devices" value={t.reflect} onChange={(v)=>setTweak('reflect', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);
