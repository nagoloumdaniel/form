"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Décompte puis redirection. Désactivé si la personne limite les animations. */
export function useCountdownRedirect(href: string, seconds: number, active: boolean) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);
  const pushed = useRef(false);

  useEffect(() => {
    if (!active) return;
    router.prefetch(href);
    const deadline = Date.now() + seconds * 1000;

    const tick = setInterval(() => {
      const left = Math.ceil((deadline - Date.now()) / 1000);
      if (left > 0) {
        setRemaining(left);
        return;
      }
      clearInterval(tick);
      if (pushed.current) return;
      pushed.current = true;
      window.location.replace(href);
    }, 250);

    return () => clearInterval(tick);
  }, [active, href, seconds, router]);

  return { remaining: Math.max(remaining, 1), auto: true };
}
