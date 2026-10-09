import fs from "fs";
import path from "path";
import sharp from "sharp";

const phoneSrc =
  "C:/Users/souso/.cursor/projects/c-Users-souso-Documents-MegaTv/assets/c__Users_souso_AppData_Roaming_Cursor_User_workspaceStorage_536c90e69de923772a24c5acb4766492_images_ultramock-2026-10-06T09-22-13-269Z-72fe20e8-c1dc-443c-91c4-7415633f1a27.jpg";
const trioSrc =
  "C:/Users/souso/.cursor/projects/c-Users-souso-Documents-MegaTv/assets/c__Users_souso_AppData_Roaming_Cursor_User_workspaceStorage_536c90e69de923772a24c5acb4766492_images_image-3d6ddd0d-6747-42ee-9d31-5333be388688.png";
const capsDir = "C:/Users/souso/OneDrive/Bureau/new screen";
const outDir = "public/assets";

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function cutPhone() {
  const { data, info } = await sharp(phoneSrc)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = new Uint8Array(w * h);
  const q = [];
  const push = (x, y) => {
    const i = y * w + x;
    if (bg[i]) return;
    const o = i * 4;
    const L = lum(data[o], data[o + 1], data[o + 2]);
    if (L > 34) return;
    bg[i] = 1;
    q.push(i);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (q.length) {
    const i = q.pop();
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) push(x - 1, y);
    if (x + 1 < w) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < h) push(x, y + 1);
  }
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const o = i * 4;
      if (bg[i]) {
        data[o + 3] = 0;
        continue;
      }
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const pad = 2;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(w - left, maxX - minX + 1 + pad * 2);
  const height = Math.min(h - top, maxY - minY + 1 + pad * 2);
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width, height })
    .png()
    .toFile(path.join(outDir, "devices/hero-phone.png"));
  console.log("phone crop", { left, top, width, height, src: `${w}x${h}` });
}

function components(mask, w, h, minArea) {
  const seen = new Uint8Array(w * h);
  const boxes = [];
  const q = [];
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || seen[start]) continue;
    seen[start] = 1;
    q.push(start);
    let minX = w, minY = h, maxX = 0, maxY = 0, area = 0;
    while (q.length) {
      const i = q.pop();
      const x = i % w;
      const y = (i - x) / w;
      area++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      const n = [i - 1, i + 1, i - w, i + w];
      for (const j of n) {
        if (j < 0 || j >= w * h || seen[j] || !mask[j]) continue;
        const jx = j % w;
        if (Math.abs(jx - x) > 1) continue;
        seen[j] = 1;
        q.push(j);
      }
    }
    if (area >= minArea) boxes.push({ minX, minY, maxX, maxY, area, w: maxX - minX + 1, h: maxY - minY + 1 });
  }
  return boxes;
}

async function cutTrio() {
  const { data, info } = await sharp(trioSrc).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const exterior = new Uint8Array(w * h);
  const q = [];
  const isWhite = (i) => {
    const o = i * 4;
    return lum(data[o], data[o + 1], data[o + 2]) > 210;
  };
  const push = (x, y) => {
    const i = y * w + x;
    if (exterior[i] || !isWhite(i)) return;
    exterior[i] = 1;
    q.push(i);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (q.length) {
    const i = q.pop();
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) push(x - 1, y);
    if (x + 1 < w) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < h) push(x, y + 1);
  }
  const interior = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!exterior[i] && isWhite(i)) interior[i] = 1;
  }
  const boxes = components(interior, w, h, 800).sort((a, b) => b.area - a.area);
  console.log("screens", boxes.slice(0, 8));

  for (let i = 0; i < w * h; i++) {
    if (exterior[i] || interior[i]) data[i * 4 + 3] = 0;
  }
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(path.join(outDir, "devices/trio-frame.png"));

  const named = boxes.slice(0, 3).map((b) => {
    const cx = (b.minX + b.maxX) / 2;
    const kind = b.w > b.h * 1.3 ? "tv" : cx < w * 0.28 ? "tablet" : "phone";
    const inset = 1;
    return {
      kind,
      left: (b.minX + inset) / w,
      top: (b.minY + inset) / h,
      width: (b.w - inset * 2) / w,
      height: (b.h - inset * 2) / h,
    };
  });
  fs.writeFileSync(path.join(outDir, "devices/trio-holes.json"), JSON.stringify({ w, h, holes: named }, null, 2));
  console.log(named);
}

const capMap = {
  "accueil_mobile.png": ["accueil-mobile.webp", 900],
  "accueil_TV.png": ["accueil-tv.webp", 1600],
  "detail_mobile.png": ["detail-mobile.webp", 900],
  "detail_TV.png": ["detail-tv.webp", 1600],
  "recherche_mobile.png": ["recherche-mobile.webp", 900],
  "recherche_TV.png": ["recherche-tv.webp", 1600],
  "livetv_mobile.png": ["livetv-mobile.webp", 900],
  "livetv_TV.png": ["livetv-tv.webp", 1600],
  "livetv_hud_TV.png": ["livetv-hud-tv.webp", 1600],
  "livetv_lecteur_TV.png": ["livetv-lecteur-tv.webp", 1600],
  "catalogue_detail_TV.png": ["catalogue-detail-tv.webp", 1600],
  "service&catalogue_TV.png": ["service-catalogue-tv.webp", 1600],
};

async function caps() {
  const dir = path.join(outDir, "captures");
  fs.mkdirSync(dir, { recursive: true });
  for (const [src, [dest, maxW]] of Object.entries(capMap)) {
    const input = path.join(capsDir, src);
    const meta = await sharp(input).metadata();
    await sharp(input)
      .resize({ width: Math.min(maxW, meta.width), withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(dir, dest));
    const st = fs.statSync(path.join(dir, dest));
    console.log(dest, meta.width + "x" + meta.height, Math.round(st.size / 1024) + "kb");
  }
}

await cutPhone();
await cutTrio();
await caps();
