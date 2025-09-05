"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TokenListFilter from "@/components/tokens/TokenListFilter";
import TokenListGrid from "@/components/tokens/TokenListGrid";
import TokenListPagination from "@/components/tokens/TokenListPagination";
import { fetchPublic } from "@/utils/api.util";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";

function TokenListInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useMemo(() => parseInt(searchParams.get("page") || "1", 10) || 1, [searchParams]);
  const filter = (searchParams.get("filter") as "latest" | "top-market-cap") || "latest";
  const debugSkeleton = searchParams.get("debugSkeleton") === "1";
  const [tokens, setTokens] = useState<any[] | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setTokens(null);
        if (debugSkeleton) {
          setTotalPages(1);
          return;
        }
        const qs = new URLSearchParams({ page: String(page), limit: "24", filter, project: "pipfun" }).toString();
        const res = await fetchPublic(`${TOKEN_ENDPOINTS.GET_TOKEN_LIST}?${qs}`);
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error("failed to fetch token list");
        setTokens(data.tokens || []);
        setTotalPages(data.totalPages || 1);
      } catch (_) {
        setTokens([]);
        setTotalPages(1);
      }
    })();
    return () => controller.abort();
  }, [page, filter, debugSkeleton]);

  const handlePageChange = (next: number) => {
    const q = new URLSearchParams({ page: String(next), filter }).toString();
    router.replace(`/tokenlist?${q}`);
  };

  return (
    <div className="h-full flex-grow mb-[120px] w-full md:w-auto px-4 md:px-0 mt-[24px] md:mt-[32px]">
      <div className="relative z-[80]">
        <TokenListFilter />
      </div>
      <div className="relative z-[80] mt-3 mb-3">
        <TokenListGrid tokens={tokens} />
      </div>
      <div className="relative z-[80]">
        <TokenListPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

export default function TokenListPage() {
  return (
    <Suspense fallback={null}>
      <TokenListInner />
    </Suspense>
  );
}
