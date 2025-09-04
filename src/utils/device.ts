export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  // Basic checks for popular mobile platforms
  return /android|iphone|ipad|ipod|iemobile|blackberry|opera mini/i.test(ua);
}
