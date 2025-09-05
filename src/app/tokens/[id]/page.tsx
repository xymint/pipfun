"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useOverlayStore } from "@/store/overlayStore";
import { fetchPublic } from "@/utils/api.util";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";
import TokenDetail from "@/components/shared/overlays/TokenDetail";

type TokenDetailResponse = {
  id: string;
  name?: string;
  ticker?: string;
  imageUrl?: string;
  description?: string;
  contractAddress?: string;
  website?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  telegram?: string;
  dbcPoolAddress?: string;
  dammV2PoolAddress?: string;
};

export default function TokenDetailPage() {
  const params = useParams<{ id: string }>();
  const tokenId = params?.id || "";

  const [data, setData] = useState<TokenDetailResponse | null>(null);

  useEffect(() => {
    const ui = useOverlayStore.getState();
    ui.resetOverlays();
    ui.setDark();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenId) return;
      setData(null);
      try {
        const res = await fetchPublic(TOKEN_ENDPOINTS.GET_TOKEN_DETAIL(tokenId));
        if (!res.ok) throw new Error("failed to fetch token detail");
        const json = await res.json();
        if (!cancelled) setData(json as TokenDetailResponse);
      } catch (_) {
        if (!cancelled) setData({ id: tokenId } as TokenDetailResponse);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenId]);

  return (
    <div className="w-full h-full flex-grow">
      <div className="relative z-[80] w-full flex flex-col items-center pt-8 pb-12">
        {/* loading skeleton */}
        {data === null ? (
          <div className="w-[640px] rounded-[var(--radius-xl)] bg-[var(--card)] shadow-[var(--card-shadow)] p-8">
            <div className="p-6 rounded-[var(--radius-xl)] bg-[var(--muted)]">
              <div className="flex justify-center mb-5">
                <div className="w-[100px] h-[100px] rounded-full bg-[var(--tokens-secondary)] animate-pulse" />
              </div>
              <div className="h-8 w-40 mx-auto rounded bg-[var(--tokens-secondary)] animate-pulse mb-2" />
              <div className="h-5 w-64 mx-auto rounded bg-[var(--tokens-secondary)] animate-pulse" />
              <div className="my-5 h-px bg-[var(--tokens-border)]" />
              <div className="h-24 w-full rounded bg-[var(--tokens-secondary)] animate-pulse" />
            </div>
          </div>
        ) : (
          <TokenDetail
            imageUrl={data.imageUrl || "/no-tokens.png"}
            ticker={data.ticker || "TOKEN"}
            name={data.name || "-"}
            contractAddress={data.contractAddress || ""}
            description={data.description || ""}
            website={data.website || ""}
            twitter={data.twitter || ""}
            youtube={data.youtube || ""}
            tiktok={data.tiktok || ""}
            telegram={data.telegram || ""}
            dbcPoolAddress={data.dbcPoolAddress || ""}
            dammV2PoolAddress={data.dammV2PoolAddress || ""}
          />
        )}
      </div>
    </div>
  );
}
