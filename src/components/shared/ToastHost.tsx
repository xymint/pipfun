"use client";

import { useEffect, useRef, useState } from "react";
import { useToastStore } from "@/store/toastStore";

export default function ToastHost() {
  const { toasts, dismiss, show } = useToastStore();
  const [topOffset, setTopOffset] = useState(16);
  const debugOnceRef = useRef(false);

  useEffect(() => {
    const computeOffset = () => {
      // Common header wrapper in layout
      const headerWrap = document.querySelector('div.relative.z-\\[100\\]');
      let h = 0;
      if (headerWrap instanceof HTMLElement) {
        h = headerWrap.getBoundingClientRect().height || 0;
      }
      setTopOffset(h + 0);
    };
    computeOffset();
    window.addEventListener('resize', computeOffset);
    return () => window.removeEventListener('resize', computeOffset);
  }, []);

  if (!toasts.length) return null;

  const getStyle = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-500";
      case "warn":
        return "bg-[var(--destructive)]";
      case "error":
        return "bg-[var(--destructive)]";
      default:
        return "bg-emerald-500";
    }
  };

  return (
    <div className="fixed right-4 z-[130] min-w-[137px] max-w-[388px] space-y-2" style={{ top: topOffset }}>
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-[var(--radius-md)] text-white shadow-[var(--tokens-shadow-md)] p-4 pr-6 ${getStyle(t.type)} relative`}>
          <div className="text-[14px] leading-[20px]">{t.message}</div>
          <button onClick={() => dismiss(t.id)} className="absolute right-2 top-2 text-[var(--tokens-foreground)]" aria-label="dismiss">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
