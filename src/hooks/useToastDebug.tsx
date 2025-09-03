"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToastStore } from "@/store/toastStore";

export function useToastDebug() {
  const params = useSearchParams();
  const show = useToastStore((s) => s.show);

  useEffect(() => {
    const debugToast = params.get("debugToast");
    if (!debugToast) return;

    // syntax: debugToast=type:message[:timeoutMs]
    // ex) ?debugToast=success:Saved!  or warn:Careful:5000
    // robust parsing for extra colons inside message
    const segs = debugToast.split(":");
    const type = (segs.shift() || "normal") as any;
    let timeoutMs: number | undefined = undefined;
    if (segs.length >= 2) {
      const maybeTimeout = segs[segs.length - 1];
      const parsed = parseInt(maybeTimeout, 10);
      if (!Number.isNaN(parsed)) {
        timeoutMs = parsed;
        segs.pop();
      }
    }
    const message = segs.join(":");
    show(message || debugToast, type || "normal", timeoutMs);
  }, [params, show]);
}

export default function ToastDebugInit() {
  useToastDebug();
  return null;
}
