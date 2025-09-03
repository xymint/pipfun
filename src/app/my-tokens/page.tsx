"use client";

import { useEffect, useMemo, useState } from "react";
import { Transaction } from "@solana/web3.js";
import { useWalletStore } from "@/store/walletStore";
import { fetchWithAuth } from "@/utils/api.util";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";
import TokenListPagination from "@/components/tokens/TokenListPagination";
import { useToastStore } from "@/store/toastStore";
import { TOKEN_ENDPOINTS as ENDPOINTS } from "@/constants/apiEndpoints";
import Link from "next/link";
import CopyText from "@/utils/CopyText";

type MyToken = {
  id: string;
  name?: string;
  ticker?: string;
  imageUrl?: string;
  contractAddress?: string | null;
  curveProgress?: number | null;
  creatorSolFee?: string | number;
  createdAt?: string;
};

export default function MyTokensPage() {
  const walletAddress = useWalletStore((s) => s.walletAddress);
  const [tokens, setTokens] = useState<MyToken[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const showToast = useToastStore((s) => s.show);

  // Background overlay defaults to DARK via BackgroundOverlayHost route mapping.

  useEffect(() => {
    (async () => {
      setTokens(null);
      try {
        const qs = new URLSearchParams({ page: String(page), limit: "12", project: "pipfun" }).toString();
        const wa = walletAddress || (typeof window !== "undefined" ? localStorage.getItem("wallet_address") : null);
        if (!wa) {
          // Keep skeleton until wallet is available to avoid flash/empty state
          setTokens(null);
          setTotalPages(1);
          return;
        }
        const res = await fetchWithAuth(`${TOKEN_ENDPOINTS.GET_MY_TOKENS}?${qs}`, { headers: { "x-wallet-address": wa } });
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error("failed to fetch my tokens");
        setTokens(data.tokens || []);
        setTotalPages(data.totalPages || 1);
      } catch (e) {
        setTokens([]);
        setTotalPages(1);
      }
    })();
  }, [page, walletAddress]);

  return (
    <div className="w-full h-full flex-grow">
      <div className="relative z-[80] w-full flex flex-col items-center">
        <h1 className="text-[20px] leading-[28px] font-semibold text-white mb-[24px]">My Tokens</h1>

        {/* list */}
        <div className="w-full max-w-[640px] px-4">
          {tokens === null ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full rounded-[var(--radius-lg)] border border-[var(--tokens-border)] bg-[var(--card)] p-4 flex gap-4">
                  <div className="w-[96px] h-[96px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-40 rounded bg-[var(--tokens-secondary)] animate-pulse" />
                    <div className="mt-2 h-4 w-64 rounded bg-[var(--tokens-secondary)] animate-pulse" />
                    <div className="mt-3 h-3 w-24 rounded bg-[var(--tokens-secondary)] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/no-tokens.png" alt="no tokens" className="w-[120px] h-[120px] rounded-[8px] object-cover" />
              <p className="text-[var(--tokens-foreground)] text-[14px] leading-[20px]">You have no tokens yet!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tokens.map((t) => {
                const raw = Number((t as any).curveProgress ?? 0);
                const cp = Number.isFinite(raw) ? raw : 0;
                const cpLabel = cp.toFixed(2);
                const cpWidth = `${Math.max(0, Math.min(100, cp))}%`;
                return (
                <div key={t.id} className="w-full rounded-[var(--radius-xl)] border border-[var(--tokens-border)] bg-[var(--card)] p-3 flex flex-col gap-4 items-center">
                  <div className="w-full flex-grow flex items-stretch gap-4">
                    <div className="w-[120px] h-[120px] rounded-[var(--radius-md)] overflow-hidden bg-[var(--tokens-secondary)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.imageUrl || "/token-holder.png"} alt={t.ticker || t.name || "token"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col">
                      <div className="text-[var(--pip-primary)] text-[18px] leading-[22px] font-semibold">{t.ticker || "TOKEN"}</div>
                      <div className="text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px]">{t.name || "-"}</div>
                      <div className="mt-2">
                        <CopyText text={t.contractAddress || ""} className="text-[var(--muted-foreground)] text-[12px] leading-[16px]" />
                      </div>
                      <div className="mt-auto">
                        <div className="text-[var(--muted-foreground)] text-[12px] leading-[16px]">BC <strong className="text-[var(--pip-primary)]">{cpLabel}%</strong></div>
                        <div className="mt-1 h-1 rounded bg-[var(--tokens-secondary)]">
                          <div className="h-1 rounded bg-[var(--tokens-foreground)]" style={{ width: cpWidth }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-grow flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[12px] leading-[16px] text-[var(--muted-foreground)]">
                          <div>Total Fee</div>
                          <div className="text-[var(--tokens-foreground)] font-semibold">{t.creatorSolFee} SOL</div>
                        </div>
                        <div className="flex items-center justify-between text-[12px] leading-[16px] text-[var(--muted-foreground)]">
                          <div>Unclaimed Fee</div>
                          <div className="text-[var(--pip-primary)] font-semibold">{t.creatorSolFee} SOL</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const fee = Number((t as any).creatorSolFee ?? 0);
                            if (!walletAddress || !t.id) {
                              showToast("wallet not connected", "warn");
                              return;
                            }
                            if (!Number.isFinite(fee) || fee <= 0) {
                              showToast("no claimable fee", "warn");
                              return;
                            }
                            try {
                              const res = await fetchWithAuth(ENDPOINTS.POST_CLAIM_CREATOR_DBC_FEE(t.id), {
                                method: "POST",
                                headers: { "x-wallet-address": walletAddress },
                              });
                              if (!res.ok) {
                                const err = await res.json().catch(() => ({}));
                                throw new Error(err?.error || "failed to create claim transaction");
                              }
                              const json = await res.json();
                              const serialized = json?.serializedTransaction as string;
                              if (!serialized) throw new Error("missing transaction data");
                              const tx = Transaction.from(Buffer.from(serialized, "base64"));
                              const provider = (await Promise.resolve(useWalletStore.getState().provider)) as any;
                              if (!provider) throw new Error("wallet provider not found");
                              await provider.signAndSendTransaction(tx);
                              showToast("creator trading fee claimed successfully", "success");
                            } catch (e: any) {
                              console.error(e);
                              showToast(e?.message || "failed to claim creator trading fee", "error");
                            }
                          }}
                          className="cursor-pointer h-[36px] min-w-[96px] px-4 rounded-[var(--radius-md)] bg-[var(--pip-primary)] text-[var(--pip-primary-foreground)] text-[14px] leading-[20px] font-medium"
                        >
                          Claim fee
                        </button>
                        <Link href={`/tokens/${t.id}`} className="h-[36px] min-w-[96px] px-4 rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center justify-center">Token Page</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )})}

              {/* pagination */}
              <div className="py-6">
                <TokenListPagination currentPage={page} totalPages={totalPages} onPageChange={(next) => setPage(next)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
