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
import { cn } from "@/lib/utils";
import { formatAmount } from "@/utils/number.util";

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
  const deeplink = useWalletStore((s) => s.deeplinkActionData);
  const clearDeeplink = useWalletStore((s) => s.clearDeeplinkActionData);
  const [tokens, setTokens] = useState<MyToken[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const showToast = useToastStore((s) => s.show);
  const [claiming, setClaiming] = useState<Record<string, boolean>>({});

  // Background overlay defaults to DARK via BackgroundOverlayHost route mapping.

  useEffect(() => {
    (async () => {
      setTokens(null);
      try {
        const qs = new URLSearchParams({
          page: String(page),
          limit: "12",
          project: "pipfun",
        }).toString();
        const wa =
          walletAddress ||
          (typeof window !== "undefined" ? localStorage.getItem("wallet_address") : null);
        if (!wa) {
          // Keep skeleton until wallet is available to avoid flash/empty state
          setTokens(null);
          setTotalPages(1);
          return;
        }
        const res = await fetchWithAuth(`${TOKEN_ENDPOINTS.GET_MY_TOKENS}?${qs}`, {
          headers: { "x-wallet-address": wa },
        });
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

  // Handle mobile deeplink callback for signAndSendTransaction (claim fee)
  useEffect(() => {
    if (!deeplink) return;
    if (
      deeplink.action === "signAndSendTransaction" &&
      (deeplink.data.context || "").startsWith("claimFee:")
    ) {
      const tokenId = String((deeplink.data.context as string).split(":")[1] || "");
      (async () => {
        try {
          const wa =
            walletAddress ||
            (typeof window !== "undefined" ? localStorage.getItem("wallet_address") : null);
          await fetchWithAuth(ENDPOINTS.POST_CLAIM_CREATOR_DBC_FEE_COMPLETE(tokenId), {
            method: "POST",
            headers: { "x-wallet-address": wa || "" },
            body: JSON.stringify({ signature: (deeplink as any)?.data?.signature }),
          });
          showToast("creator trading fee claimed successfully", "success");
          setTokens((prev) =>
            Array.isArray(prev)
              ? prev.map((tk) => (tk.id === tokenId ? { ...tk, creatorSolFee: 0 } : tk))
              : prev,
          );
        } catch (e) {
          // noop: backend returns success even if no signature
        } finally {
          setClaiming((c) => ({ ...c, [tokenId]: false }));
          try {
            clearDeeplink();
          } catch {}
        }
      })();
    }
  }, [deeplink, clearDeeplink, showToast]);

  return (
    <div className="mt-[24px] mb-[120px] h-full w-full flex-grow md:mt-[32px]">
      <div className="relative z-[80] flex w-full flex-col items-center">
        <h1 className="mb-[24px] text-[20px] leading-[28px] font-semibold text-white">My Tokens</h1>

        {/* list */}
        <div className="w-full max-w-[640px] px-4">
          {tokens === null ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex w-full gap-4 rounded-[var(--radius-lg)] border border-[var(--tokens-border)] bg-[var(--card)] p-4"
                >
                  <div className="h-[96px] w-[96px] animate-pulse rounded-[var(--radius-md)] bg-[var(--tokens-secondary)]" />
                  <div className="flex-1">
                    <div className="h-5 w-40 animate-pulse rounded bg-[var(--tokens-secondary)]" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--tokens-secondary)]" />
                    <div className="mt-3 h-3 w-24 animate-pulse rounded bg-[var(--tokens-secondary)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/no-tokens.png"
                alt="no tokens"
                className="h-[120px] w-[120px] rounded-[8px] object-cover"
              />
              <p className="text-[14px] leading-[20px] text-[var(--tokens-foreground)]">
                You have no tokens yet!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tokens.map((t) => {
                const raw = Number((t as any).curveProgress ?? 0);
                const cp = Number.isFinite(raw) ? raw : 0;
                const cpLabel = cp.toFixed(2);
                const cpWidth = `${Math.max(0, Math.min(100, cp))}%`;
                return (
                  <div
                    key={t.id}
                    className="flex w-full flex-col items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--tokens-border)] bg-[var(--card)] p-3"
                  >
                    <div className="flex w-full flex-grow items-stretch gap-4">
                      <div className="h-[120px] w-[120px] overflow-hidden rounded-[var(--radius-md)] bg-[var(--tokens-secondary)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={t.imageUrl || "/token-holder.png"}
                          alt={t.ticker || t.name || "token"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-grow flex-col">
                        <div className="text-[18px] leading-[22px] font-semibold text-[var(--pip-primary)]">
                          {t.ticker || "TOKEN"}
                        </div>
                        <div className="text-[14px] leading-[20px] text-[var(--tokens-secondary-foreground)]">
                          {t.name || "-"}
                        </div>
                        <div className="mt-2">
                          <CopyText
                            text={t.contractAddress || ""}
                            className="text-[12px] leading-[16px] text-[var(--muted-foreground)]"
                          />
                        </div>
                        <div className="mt-auto">
                          <div className="text-[12px] leading-[16px] text-[var(--muted-foreground)]">
                            BC <strong className="text-[var(--pip-primary)]">{cpLabel}%</strong>
                          </div>
                          <div className="mt-1 h-1 rounded bg-[var(--tokens-secondary)]">
                            <div
                              className="h-1 rounded bg-[var(--tokens-foreground)]"
                              style={{ width: cpWidth }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="flex w-full items-stretch gap-4">
                        <div className="flex flex-grow flex-col justify-end gap-1">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-0 text-[12px] leading-[16px] text-[var(--muted-foreground)]">
                            <div>Unclaimed Fee</div>
                            <div className="font-semibold text-[var(--pip-primary)]">
                              {formatAmount(t.creatorSolFee, 9)} SOL
                            </div>
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
                                setClaiming((c) => ({ ...c, [t.id]: true }));
                                const res = await fetchWithAuth(
                                  ENDPOINTS.POST_CLAIM_CREATOR_DBC_FEE(t.id),
                                  {
                                    method: "POST",
                                    headers: { "x-wallet-address": walletAddress },
                                  },
                                );
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  throw new Error(
                                    err?.error || "failed to create claim transaction",
                                  );
                                }
                                const json = await res.json();
                                const serialized = json?.serializedTransaction as string;
                                if (!serialized) throw new Error("missing transaction data");
                                const tx = Transaction.from(Buffer.from(serialized, "base64"));
                                const provider = (await Promise.resolve(
                                  useWalletStore.getState().provider,
                                )) as any;
                                if (!provider) throw new Error("wallet provider not found");
                                // Pass context for mobile deeplink to resume safely
                                const context = `claimFee:${t.id}`;
                                let signature: string | undefined;
                                try {
                                  const resp = await provider.signAndSendTransaction(tx, context);
                                  signature =
                                    typeof resp === "string"
                                      ? resp
                                      : (resp?.signature as string | undefined);
                                } catch (e1: any) {
                                  // Some providers may not accept extra context param
                                  if (
                                    e1?.message?.includes("Missing or invalid parameters") ||
                                    e1?.code === -32602
                                  ) {
                                    const resp = await provider.signAndSendTransaction(tx);
                                    signature =
                                      typeof resp === "string"
                                        ? resp
                                        : (resp?.signature as string | undefined);
                                  } else {
                                    throw e1;
                                  }
                                }
                                try {
                                  await fetchWithAuth(
                                    ENDPOINTS.POST_CLAIM_CREATOR_DBC_FEE_COMPLETE(t.id),
                                    {
                                      method: "POST",
                                      headers: { "x-wallet-address": walletAddress },
                                      body: JSON.stringify({ signature }),
                                    },
                                  );
                                } catch {}
                                showToast("creator trading fee claimed successfully", "success");
                                setTokens((prev) =>
                                  Array.isArray(prev)
                                    ? prev.map((tk) =>
                                        tk.id === t.id ? { ...tk, creatorSolFee: 0 } : tk,
                                      )
                                    : prev,
                                );
                              } catch (e: any) {
                                console.error(e);
                                showToast(
                                  e?.message || "failed to claim creator trading fee",
                                  "error",
                                );
                              } finally {
                                setClaiming((c) => ({ ...c, [t.id]: false }));
                              }
                            }}
                            disabled={Boolean(claiming[t.id])}
                            className={cn(
                              "h-[36px] min-w-[96px] cursor-pointer rounded-[var(--radius-md)] bg-[var(--pip-primary)] px-4 text-[14px] leading-[20px] font-medium text-[var(--pip-primary-foreground)]",
                              claiming[t.id] ? "opacity-50 pointer-events-none" : "",
                            )}
                          >
                            Claim fee
                          </button>
                          <Link
                            href={`/tokens/${t.id}`}
                            className={cn(
                              "h-[36px] min-w-[96px] rounded-[var(--radius-md)]",
                              "bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)]",
                              "text-[14px] leading-[20px] font-medium",
                              "inline-flex items-center justify-center",
                            )}
                          >
                            Token Page
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* pagination */}
              <div className="py-6">
                <TokenListPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(next) => setPage(next)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
