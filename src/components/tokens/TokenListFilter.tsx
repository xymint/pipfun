"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function TokenListFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const filter = (params.get("filter") as "latest" | "top-market-cap") || "latest";

  const setFilter = (next: "latest" | "top-market-cap") => {
    const page = params.get("page") || "1";
    const q = new URLSearchParams({ page, filter: next }).toString();
    router.replace(`/tokenlist?${q}`);
  };

  return (
    <div className="w-[320px] bg-[var(--tokens-secondary)] rounded-[var(--radius-md)] p-1 flex">
      <button
        onClick={() => setFilter("latest")}
        className={`cursor-pointer flex-1 h-[32px] px-3 py-1.5 rounded-[var(--radius-sm)] inline-flex items-center justify-center gap-2 ${
          filter === "latest"
            ? "bg-[var(--card)] text-[var(--tokens-secondary-foreground)]"
            : "bg-[var(--tokens-secondary)] text-[var(--muted-foreground)]"
        }`}
      >
        <img src="/icons/shamrock.png" alt="new" className="w-4 h-4" />
        New
      </button>
      <button
        onClick={() => setFilter("top-market-cap")}
        className={`cursor-pointer flex-1 h-[32px] px-3 py-1.5 rounded-[var(--radius-sm)] inline-flex items-center justify-center gap-2 ${
          filter === "top-market-cap"
            ? "bg-[var(--card)] text-[var(--tokens-secondary-foreground)]"
            : "bg-[var(--tokens-secondary)] text-[var(--muted-foreground)]"
        }`}
      >
        <img src="/icons/voltage.png" alt="m. cap" className="w-4 h-4" />
        M. Cap
      </button>
    </div>
  );
}
