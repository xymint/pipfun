"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOverlayStore } from "@/store/overlayStore";

export default function OverlayPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const version = useOverlayStore((s) => s.version);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  const target = document.getElementById("main-overlay-root") || document.body;
  // key forces unmount when overlay version changes (e.g., after resetOverlays)
  return createPortal(<div key={version}>{children}</div>, target);
}
