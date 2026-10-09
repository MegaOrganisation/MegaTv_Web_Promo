import sharp from "sharp";
import path from "path";

const FRAME = "C:/Users/souso/.cursor/projects/c-Users-souso-Documents-MegaTv/assets/c__Users_souso_AppData_Roaming_Cursor_User_workspaceStorage_536c90e69de923772a24c5acb4766492_images_Gemini_Generated_Image_23dcdo23dcdo23dc-e76511a3-3c64-4089-829d-ea8dc17feefc.jpg";
const OUT = "public/assets/devices";
const CAP = "public/assets/captures";
const TARGET_W = 2560;

const pages = {
  accueil: {
    laptop: `${CAP}/accueil-tv.webp`,
    tv: `${CAP}/accueil-tv.webp`,
    tablet: `${CAP}/accueil-mobile.webp`,
    phone: `${CAP}/accueil-mobile.webp`,
  },
  detail: {
    laptop: `${CAP}/detail-tv.webp`,
    tv: `${CAP}/detail-tv.webp`,
    tablet: `${CAP}/detail-mobile.webp`,
    phone: `${CAP}/detail-mobile.webp`,
  },
  recherche: {
    laptop: `${CAP}/recherche-tv.webp`,
    tv: `${CAP}/recherche-tv.webp`,
    tablet: `${CAP}/recherche-mobile.webp`,
    phone: `${CAP}/recherche-mobile.webp`,
  },
  iptv: {
    laptop: `${CAP}/livetv-tv.webp`,
    tv: `${CAP}/livetv-tv.webp`,
    tablet: `${CAP}/livetv-mobile.webp`,
    phone: `${CAP}/livetv-mobile.webp`,
  },
};

function isGreen(r, g, b) {
  return g > 90 && g > r + 28 && g > b + 22 && r < 190 && b < 170;
}
function isWhite(r, g, b) {
  return r > 236 && g > 236 && b > 236 && Math.abs(r - g) < 14 && Math.abs(g - b) < 14;
}

function components(data, w, h) {
  const seen = new Uint8Array(w * h);
  const boxes = [];
  const stack = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (seen[i]) continue;
      const p = i * 4;
      if (!isGreen(data[p], data[p + 1], data[p + 2])) continue;
      let minX = x, maxX = x, minY = y, maxY = y, n = 0;
      const pixels = [];
      stack.push(x, y);
      seen[i] = 1;
      while (stack.length) {
        const cy = stack.pop();
        const cx = stack.pop();
        n += 1;
        pixels.push(cy * w + cx);
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        if (cx > 0) visit(cx - 1, cy);
        if (cx + 1 < w) visit(cx + 1, cy);
        if (cy > 0) visit(cx, cy - 1);
        if (cy + 1 < h) visit(cx, cy + 1);
      }
      if (n > 800) boxes.push({ minX, minY, maxX, maxY, n, w: maxX - minX + 1, h: maxY - minY + 1, pixels });
      function visit(nx, ny) {
        const j = ny * w + nx;
        if (seen[j]) return;
        const q = j * 4;
        if (!isGreen(data[q], data[q + 1], data[q + 2])) return;
        seen[j] = 1;
        stack.push(nx, ny);
      }
    }
  }
  return boxes;
}

function label(boxes) {
  const sorted = [...boxes].sort((a, b) => b.n - a.n).slice(0, 4);
  const tv = sorted[0];
  const rest = sorted.filter((b) => b !== tv).sort((a, b) => a.minX - b.minX);
  const laptop = rest[0];
  const pair = rest.slice(1).sort((a, b) => a.n - b.n);
  return { laptop, tablet: pair[1], phone: pair[0], tv };
}

async function coverBuf(src, w, h) {
  return sharp(src).resize(w, h, { fit: "cover", position: "centre", kernel: "lanczos3" }).png().toBuffer();
}

const frame = await sharp(FRAME)
  .resize({ width: TARGET_W, kernel: "lanczos3" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { data, info } = frame;
const W = info.width;
const H = info.height;
const holes = label(components(data, W, H));
console.log(Object.fromEntries(Object.entries(holes).map(([k, b]) => [k, b && { x: b.minX, y: b.minY, w: b.w, h: b.h }])));

const RIM = 7;
function dilateBox(box) {
  const mask = new Uint8Array(W * H);
  for (const i of box.pixels) mask[i] = 1;
  const left = Math.max(0, box.minX - RIM);
  const top = Math.max(0, box.minY - RIM);
  const right = Math.min(W - 1, box.maxX + RIM);
  const bottom = Math.min(H - 1, box.maxY + RIM);
  const grown = [];
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      let on = 0;
      for (let dy = -RIM; dy <= RIM && !on; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -RIM; dx <= RIM; dx += 1) {
          if (dx * dx + dy * dy > RIM * RIM) continue;
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          if (mask[yy * W + xx]) { on = 1; break; }
        }
      }
      if (on) grown.push(y * W + x);
    }
  }
  return { left, top, right, bottom, grown };
}

const opened = {};
const union = new Uint8Array(W * H);
for (const key of Object.keys(holes)) {
  opened[key] = dilateBox(holes[key]);
  for (const i of opened[key].grown) union[i] = 1;
}

const frameBuf = Buffer.from(data);
for (let i = 0; i < W * H; i += 1) {
  const p = i * 4;
  const r = frameBuf[p], g = frameBuf[p + 1], b = frameBuf[p + 2];
  if (union[i] || isWhite(r, g, b)) frameBuf[p + 3] = 0;
}
const framePng = await sharp(frameBuf, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();

async function maskedShot(src, hole) {
  const width = hole.right - hole.left + 1;
  const height = hole.bottom - hole.top + 1;
  const shot = await sharp(src).resize(width, height, { fit: "cover", position: "centre", kernel: "lanczos3" }).ensureAlpha().raw().toBuffer();
  const layer = Buffer.alloc(width * height * 4);
  for (const i of hole.grown) {
    const x = (i % W) - hole.left;
    const y = Math.floor(i / W) - hole.top;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const s = (y * width + x) * 4;
    layer[s] = shot[s];
    layer[s + 1] = shot[s + 1];
    layer[s + 2] = shot[s + 2];
    layer[s + 3] = 255;
  }
  return sharp(layer, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

for (const [page, srcs] of Object.entries(pages)) {
  const layers = [];
  for (const key of ["laptop", "tv", "tablet", "phone"]) {
    const hole = opened[key];
    layers.push({
      input: await maskedShot(srcs[key], hole),
      left: hole.left,
      top: hole.top,
    });
  }
  const base = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([...layers, { input: framePng, left: 0, top: 0 }])
    .webp({ quality: 94, effort: 5 })
    .toFile(path.join(OUT, `quad-${page}.webp`));
  console.log(page, base.width, base.height, base.size);
}

if (process.argv.includes("--preview")) {
  await sharp(path.join(OUT, "quad-accueil.webp")).png().toFile(path.join(OUT, "quad-preview.png"));
  console.log("preview");
}
