import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const assetsDir = path.join(publicDir, "assets");
const companionDir = path.join(assetsDir, "companion");
const trianglePath = path.join(companionDir, "triangle-mark.png");
const fontCachePath = path.join(companionDir, "bricolage-700.ttf");

/** PWA surfaces — pure black matches Android splash/status bar and removes visible tile edges. */
const BRAND_BG = { r: 0, g: 0, b: 0, alpha: 1 };

async function loadFontBase64() {
  try {
    const cached = await fs.readFile(fontCachePath);
    return cached.toString("base64");
  } catch {
    const cssResponse = await fetch("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&display=swap", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const css = await cssResponse.text();
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (!match?.[1]) throw new Error("Unable to resolve Bricolage Grotesque font URL");
    const fontResponse = await fetch(match[1]);
    if (!fontResponse.ok) throw new Error("Unable to download Bricolage Grotesque");
    const buffer = Buffer.from(await fontResponse.arrayBuffer());
    await fs.mkdir(companionDir, { recursive: true });
    await fs.writeFile(fontCachePath, buffer);
    return buffer.toString("base64");
  }
}

function labelSvg({ size, textY, fontSize, fontBase64 }) {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: "Bricolage";
        src: url(data:font/woff2;base64,${fontBase64}) format("woff2");
        font-weight: 700;
        font-style: normal;
      }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#000000"/>
  <text x="50%" y="${textY}"
        text-anchor="middle"
        font-family="Bricolage, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        letter-spacing="0.05em"
        fill="#ffffff">Compagnon</text>
</svg>`;
}

async function loadTriangle() {
  return sharp(trianglePath).trim().png().toBuffer();
}

async function buildInstallIcon(size, fontBase64, triangleSource) {
  const triangleSize = Math.round(size * 0.58);
  const fontSize = Math.round(size * 0.102);
  const gap = Math.round(size * 0.018);
  const textBlock = Math.round(fontSize * 1.02);
  const groupHeight = triangleSize + gap + textBlock;
  const verticalBias = Math.round(size * 0.04);
  const triangleTop = Math.round((size - groupHeight) / 2 - verticalBias);
  const textY = triangleTop + triangleSize + gap + Math.round(fontSize * 0.88);

  const triangle = await sharp(triangleSource).resize(triangleSize, triangleSize, { fit: "contain" }).png().toBuffer();
  const base = await sharp(Buffer.from(labelSvg({ size, textY, fontSize, fontBase64 }))).png().toBuffer();

  return sharp(base)
    .composite([{ input: triangle, top: triangleTop, left: Math.round((size - triangleSize) / 2) }])
    .png()
    .toBuffer();
}

async function buildMaskableIcon(size, triangleSource) {
  const triangleSize = Math.round(size * 0.5);
  const triangleTop = Math.round((size - triangleSize) / 2 - size * 0.055);
  const triangle = await sharp(triangleSource).resize(triangleSize, triangleSize, { fit: "contain" }).png().toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG }
  })
    .composite([{ input: triangle, top: triangleTop, left: Math.round((size - triangleSize) / 2) }])
    .png()
    .toBuffer();
}

async function buildSplashScreen(width, height, fontBase64, triangleSource) {
  const triangleSize = Math.round(Math.min(width, height) * 0.44);
  const fontSize = Math.round(triangleSize * 0.26);
  const gap = Math.round(fontSize * 0.34);
  const groupHeight = triangleSize + gap + fontSize;
  const triangleTop = Math.round(height * 0.5 - groupHeight / 2 - height * 0.02);
  const textY = triangleTop + triangleSize + gap + Math.round(fontSize * 0.9);

  const triangle = await sharp(triangleSource).resize(triangleSize, triangleSize, { fit: "contain" }).png().toBuffer();
  const textLayer = await sharp(
    Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: "Bricolage";
              src: url(data:font/woff2;base64,${fontBase64}) format("woff2");
              font-weight: 700;
              font-style: normal;
            }
          </style>
        </defs>
        <rect width="100%" height="100%" fill="#000000"/>
        <text x="50%" y="${textY}"
              text-anchor="middle"
              font-family="Bricolage, sans-serif"
              font-size="${fontSize}"
              font-weight="700"
              letter-spacing="0.06em"
              fill="#ffffff">Compagnon</text>
      </svg>`
    )
  )
    .png()
    .toBuffer();

  return sharp({
    create: { width, height, channels: 4, background: BRAND_BG }
  })
    .composite([
      { input: triangle, top: triangleTop, left: Math.round((width - triangleSize) / 2) },
      { input: textLayer, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();
}

async function write(fileName, buffer) {
  const target = path.join(assetsDir, fileName);
  await fs.writeFile(target, buffer);
  console.log(`wrote ${target}`);
}

async function buildTransparentTriangleIcon(size, triangleSource) {
  return sharp(triangleSource)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  await fs.mkdir(companionDir, { recursive: true });
  const fontBase64 = await loadFontBase64();
  const triangleSource = await loadTriangle();
  await fs.writeFile(path.join(companionDir, "triangle-mark-trimmed.png"), triangleSource);

  const icon192 = await buildInstallIcon(192, fontBase64, triangleSource);
  const icon512 = await buildInstallIcon(512, fontBase64, triangleSource);
  const appleTouch = await buildInstallIcon(180, fontBase64, triangleSource);
  const maskable512 = await buildMaskableIcon(512, triangleSource);
  const favicon32 = await buildTransparentTriangleIcon(32, triangleSource);
  const triangleIcon180 = await buildTransparentTriangleIcon(180, triangleSource);

  await write("companion-icon-192.png", icon192);
  await write("companion-icon-512.png", icon512);
  await write("companion-icon-maskable-512.png", maskable512);
  await write("apple-touch-icon.png", appleTouch);
  await write("mark.png", icon512);
  await write("favicon-32.png", favicon32);
  await write("triangle-icon-180.png", triangleIcon180);

  const appleStartup = await buildSplashScreen(1284, 2778, fontBase64, triangleSource);
  const androidSplash = await buildSplashScreen(1080, 1920, fontBase64, triangleSource);
  await write("apple-touch-startup.png", appleStartup);
  await write("companion-splash-screen.png", androidSplash);
  await write("companion-splash-mark.png", await sharp(triangleSource).resize(520, 520, { fit: "contain" }).png().toBuffer());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
