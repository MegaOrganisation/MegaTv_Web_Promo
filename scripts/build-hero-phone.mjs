import sharp from "sharp";
import fs from "fs";
import path from "path";

const root = path.resolve("public/assets");
const outDir = path.join(root, "captures");
fs.mkdirSync(outDir, { recursive: true });

const srcDir = "C:/Users/souso/OneDrive/Bureau/new screen";
const shots = {
  "phone-home.webp": ["Screenshot_20261005_230558.png", 900],
  "phone-search.webp": ["Screenshot_20261006_104256.png", 900],
  "phone-live.webp": ["Screenshot_20261006_104308.png", 900],
  "phone-detail.webp": ["Screenshot_20261006_105407.png", 900],
  "tv-home.webp": ["Screenshot_20261006_104154.png", 1600],
  "tv-search.webp": ["Screenshot_20261006_104853.png", 1600],
  "tv-live-grid.webp": ["Screenshot_20261006_104751.png", 1600],
  "tv-player.webp": ["Screenshot_20261006_104817.png", 1600],
  "tv-live.webp": ["Screenshot_20261006_104834.png", 1600],
  "tv-services.webp": ["Screenshot_20261006_105116.png", 1600],
  "tv-catalog.webp": ["Screenshot_20261006_105136.png", 1600],
};

for (const [name, [file, width]] of Object.entries(shots)) {
  const dest = path.join(outDir, name);
  await sharp(path.join(srcDir, file))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(dest);
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(name, kb + "kb");
}

const targetW = 900;
const phone = sharp(path.join(root, "devices/iphone-front.jpg")).resize({ width: targetW });
const { data, info } = await phone.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

let minX = width, minY = height, maxX = 0, maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const white = r > 248 && g > 248 && b > 248;
    const grayBg = r > 226 && g > 226 && b > 226 && Math.max(r, g, b) - Math.min(r, g, b) < 12;
    if (white) {
      data[i + 3] = 0;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else if (grayBg) {
      data[i + 3] = 0;
    }
  }
}

const framePath = path.join(root, "devices/iphone-frame.png");
await sharp(data, { raw: { width, height, channels } }).png().toFile(framePath);
const box = {
  left: +(minX / width).toFixed(4),
  top: +(minY / height).toFixed(4),
  width: +((maxX - minX) / width).toFixed(4),
  height: +((maxY - minY) / height).toFixed(4),
};
console.log("screen box", box, "frame", Math.round(fs.statSync(framePath).size / 1024) + "kb");
fs.writeFileSync(path.join(root, "devices/screen-box.json"), JSON.stringify(box, null, 2));
