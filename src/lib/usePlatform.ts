import { useEffect, useState } from "react";
import { detectPlatform, detectPlatformAsync, type Platform } from "./platform";

/**
 * The visitor's platform: null on the server and first render, then the UA guess, then refined by
 * client hints (architecture). The hero and the downloads section both use this, so they always
 * agree on the primary button.
 */
export function usePlatform(): Platform | null {
  const [plat, setPlat] = useState<Platform | null>(null);
  useEffect(() => {
    let live = true;
    setPlat(detectPlatform(navigator as never));
    detectPlatformAsync(navigator as never).then((p) => live && setPlat(p));
    return () => { live = false; };
  }, []);
  return plat;
}
