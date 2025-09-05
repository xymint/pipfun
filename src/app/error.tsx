"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex w-full items-center justify-center py-[80px] text-white">
      <div className="text-center">
        <div className="text-[28px] font-bold mb-2">Something went wrong</div>
        <div className="text-[14px] opacity-80 mb-4">{error?.message || "Unknown error"}</div>
        <button onClick={reset} className="px-3 py-2 rounded bg-white/20">Try again</button>
      </div>
    </div>
  );
}
