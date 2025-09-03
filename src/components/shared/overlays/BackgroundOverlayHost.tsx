"use client";

import LightOverlay from "@/components/shared/overlays/LightOverlay";
import ModalOverlay from "@/components/shared/overlays/ModalOverlay";
import DarkBackground from "@/components/shared/overlays/DarkBackground";
import { useOverlayStore } from "@/store/overlayStore";
import type { BackgroundLayer } from "@/store/overlayStore";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export default function BackgroundOverlayHost() {
  const pathname = usePathname();
  const layer = useOverlayStore((s) => s.backgroundLayer);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultLayer: BackgroundLayer = useMemo<BackgroundLayer>(() => {
    // Route-based defaults to avoid initial flicker
    if (!pathname) return "LIGHT";
    if (pathname === "/" ) return "LIGHT";
    if (pathname.startsWith("/my-tokens")) return "DARK";
    if (pathname.startsWith("/tokenlist")) return "DARK";
    if (pathname.startsWith("/tokens/")) return "DARK";
    return "LIGHT";
  }, [pathname]);

  // Sync store to default if it's still LIGHT and default isn't LIGHT
  useEffect(() => {
    if (layer === "LIGHT" && defaultLayer !== "LIGHT") {
      const api = useOverlayStore.getState();
      if (defaultLayer === "DARK") api.setDark();
      else if (defaultLayer === "MODAL") api.setModal();
      else api.setLight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLayer]);

  // During SSR and first client paint, render using route-based default to avoid white flash
  if (!mounted) {
    if (defaultLayer === "DARK") return <DarkBackground />;
    if (defaultLayer === "MODAL") return <ModalOverlay />;
    return <LightOverlay />;
  }

  // After mount, prefer default layer if store has not yet set a different one
  const renderLayer = layer === "LIGHT" ? defaultLayer : layer;

  if (renderLayer === "DARK") return <DarkBackground />;
  if (renderLayer === "MODAL") return <ModalOverlay />;
  return <LightOverlay />;
}
