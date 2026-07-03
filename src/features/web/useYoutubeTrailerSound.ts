"use client";

import { useCallback, useEffect, type RefObject } from "react";

/** YouTube iframe API mute/unmute — requires `enablejsapi=1` on the embed URL. */
export function useYoutubeTrailerSound(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  playing: boolean,
  soundOn: boolean
) {
  const post = useCallback((func: "mute" | "unMute") => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  }, [iframeRef]);

  useEffect(() => {
    if (!playing) return;
    post(soundOn ? "unMute" : "mute");
  }, [playing, soundOn, post]);
}
