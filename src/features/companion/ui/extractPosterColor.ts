/** Extrait une couleur dominante depuis une URL poster (canvas 32×32). Same-origin proxy requis. */
export async function extractPosterColor(src: string | null | undefined): Promise<[number, number, number]> {
  const fallback: [number, number, number] = [63, 154, 230];
  if (!src || typeof window === "undefined") return fallback;

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(fallback);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
        if (!n) {
          resolve(fallback);
          return;
        }
        resolve([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
      } catch {
        resolve(fallback);
      }
    };
    img.onerror = () => resolve(fallback);
    img.src = src;
  });
}

export function rgbToCss([r, g, b]: [number, number, number]) {
  return `${r}, ${g}, ${b}`;
}
