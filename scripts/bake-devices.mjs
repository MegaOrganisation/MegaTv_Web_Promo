import path from "path";
import sharp from "sharp";

const framePath = "public/assets/devices/trio-frame.png";
const cap = "public/assets/captures";
const out = "public/assets/devices";

const holes = {
  tv: { left: 0.1635, top: 0.1382, width: 0.7779, height: 0.6411 },
  tablet: { left: 0.0395, top: 0.5182, width: 0.1989, height: 0.3954 },
  phone: { left: 0.2398, top: 0.6372, width: 0.1049, height: 0.3263 },
};

const pages = {
  accueil: { tv: "accueil-tv.webp", mobile: "accueil-mobile.webp" },
  detail: { tv: "detail-tv.webp", mobile: "detail-mobile.webp" },
  recherche: { tv: "recherche-tv.webp", mobile: "recherche-mobile.webp" },
  iptv: { tv: "livetv-tv.webp", mobile: "livetv-mobile.webp" },
};

const scale = 2;
const meta = await sharp(framePath).metadata();
const W = meta.width * scale;
const H = meta.height * scale;
const frame = await sharp(framePath).resize(W, H, { kernel: "lanczos3" }).png().toBuffer();

function box(h, bleed) {
  const left = Math.round(h.left * W) - bleed;
  const top = Math.round(h.top * H) - bleed;
  const width = Math.round(h.width * W) + bleed * 2;
  const height = Math.round(h.height * H) + bleed * 2;
  return { left, top, width, height };
}

for (const [name, files] of Object.entries(pages)) {
  const layers = [];
  for (const [kind, file] of [
    ["tv", files.tv],
    ["tablet", files.mobile],
    ["phone", files.mobile],
  ]) {
    const b = box(holes[kind], kind === "tv" ? 8 : 5);
    const img = await sharp(path.join(cap, file))
      .resize(b.width, b.height, { fit: "cover", position: "centre", kernel: "lanczos3" })
      .png()
      .toBuffer();
    layers.push({ input: img, left: b.left, top: b.top });
  }
  const base = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(layers)
    .png()
    .toBuffer();
  await sharp(base)
    .composite([{ input: frame, left: 0, top: 0 }])
    .webp({ quality: 90, effort: 4 })
    .toFile(path.join(out, `trio-${name}.webp`));
  console.log("trio-" + name);
}
