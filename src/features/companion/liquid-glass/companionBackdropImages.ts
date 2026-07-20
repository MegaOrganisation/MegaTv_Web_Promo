/** Posters TMDB w300 — chemins relatifs (proxy same-origin pour WebGL ybouane). */
export const COMPANION_BACKDROP_POSTER_PATHS = [
  "/f77yGBGOjainowvlGHU70CCQrjV.jpg",
  "/zR4RAnv4s6zpXhiqepdonAw4oF3.jpg",
  "/74VbBYHmpjgeES1zkRo1DwHkWnE.jpg",
  "/aSQktALDmbunDbwkuZbZFMEWVFr.jpg",
  "/wzyy8ZrsuHfAt4iz4iH3rT0tdoT.jpg",
  "/s8F6DCIX9gOMM6rv6WCGyGp6oSB.jpg",
  "/gz64ZUKg4C4g1yfGD0o5opcBOKy.jpg",
  "/w5oW8zE7dudapyNwF8FQoQfU2Bz.jpg",
  "/iGpMm603GUKH2SiXB2S5m4sZ17t.jpg",
  "/vTIBjWMWx1p5Wv2J3IRhEW13lrj.jpg",
  "/yPkeeBEJdQO85AGCwi2XEIfMOxa.jpg",
  "/rxw7an9VWIlaEzTB4ETadMWSdym.jpg",
  "/iQoIGnmrt8rzDDRC6el8HLvHvKf.jpg",
  "/55lEECwWtRWltEa6u3TbiljaoOd.jpg",
  "/iCvucorbs3hFqWshDbLe0fHzB71.jpg",
  "/kG3N8oQ10qiw2MsnSHFGJpQNyEy.jpg",
  "/t1PFVsGYdUHtPv0Xowoc9b4PAap.jpg",
  "/7NrvUI3vnW8H3rD7ExKcTL7KRcQ.jpg"
] as const;

/** URL same-origin — évite canvas tainted pour @ybouane/liquidglass. */
export function companionBackdropPosterSrc(path: string): string {
  return `/api/tmdb/image?size=w300&path=${encodeURIComponent(path)}`;
}

export async function waitForSceneImages(root: HTMLElement, timeoutMs = 4000): Promise<void> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  if (imgs.length === 0) return;

  await Promise.race([
    Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
              return;
            }
            const done = () => {
              img.removeEventListener("load", done);
              img.removeEventListener("error", done);
              resolve();
            };
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
      )
    ),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, timeoutMs);
    })
  ]);
}
