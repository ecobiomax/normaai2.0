import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Componente que garante scroll automático ao topo
 * sempre que o usuário navega para uma nova página.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  return null;
}
