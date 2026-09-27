import { useEffect, useState } from "react";

// Reavalia a media query quando a viewport muda (ex.: girar o celular, ou
// redimensionar a janela no desktop) — não é só o valor lido uma vez no mount.
export function useMediaQuery(query: string): boolean {
  const [corresponde, setCorresponde] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    function handler(event: MediaQueryListEvent) {
      setCorresponde(event.matches);
    }
    setCorresponde(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return corresponde;
}
