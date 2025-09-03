"use client";
import { Buffer } from "buffer";
import { useEffect, useMemo, useRef, useState } from "react";
import ProcessingOverlay from "@/components/shared/overlays/ProcessingOverlay";
import TokenFinalizeOverlay from "@/components/shared/overlays/TokenFinalizeOverlay";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";
import { fetchWithAuth } from "@/utils/api.util";
import { useWalletStore } from "@/store/walletStore";
import { useSocketStore } from "@/store/socketStore";
import { VersionedTransaction } from "@solana/web3.js";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import { useOverlayStore } from "@/store/overlayStore";

const decodeBase64ToBytes = (b64: string): Uint8Array => {
  const buf = Buffer.from(b64, "base64");
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
};

export default function TokenProcessingOverlay({ tokenId, draftId, onBackToCompletion }: { tokenId?: string; draftId?: string; onBackToCompletion?: () => void }) {
  const step = useTokenCreationFlowStore((s) => s.step);
  if (step !== "TOKEN_PROCESSING") return null;
  const walletAddress = useWalletStore((s) => s.walletAddress);
  const provider = useWalletStore((s) => s.provider);
  const [finalStatus, setFinalStatus] = useState<"MINTED" | "FAILED" | null>(null);
  const [finalTokenId, setFinalTokenId] = useState<string | undefined>(undefined);
  const startedRef = useRef(false);

  const begin = useMemo(() => async () => {
    if (startedRef.current) return;
    // wait until tokenId is available (overlay can mount early to avoid flicker)
    if (!tokenId) return;
    // refresh latest provider/address directly from store to avoid stale closures
    const { provider: liveProvider, walletAddress: liveAddress } = useWalletStore.getState();
    const signerProvider = liveProvider || provider;
    const signerAddress = liveAddress || walletAddress;
    if (!signerAddress || !signerProvider) return;
    startedRef.current = true;

    try {
      console.log("[token-process] start for tokenId=", tokenId);
      // 1) request pool creation transactions
      const createPoolRes = await fetchWithAuth(
        TOKEN_ENDPOINTS.CREATE_TOKEN_POOL(tokenId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": signerAddress,
          },
        }
      );

      if (!createPoolRes.ok) {
        const err = await createPoolRes.json().catch(() => ({}));
        alert(err?.error || "failed to get pool transactions");
        // mark failed and return to completion
        try {
          await fetchWithAuth(TOKEN_ENDPOINTS.FAILED_TOKEN_POOL(tokenId), { method: "POST", headers: { "x-wallet-address": signerAddress } });
        } catch {}
        onBackToCompletion?.();
        return;
      }

      const poolData = await createPoolRes.json();
      console.log("[token-process] createPool ok", poolData);
      const transactions: string[] = poolData?.transactions || [];
      if (!Array.isArray(transactions) || transactions.length === 0) {
        alert("no transactions received");
        try {
          await fetchWithAuth(TOKEN_ENDPOINTS.FAILED_TOKEN_POOL(tokenId), { method: "POST", headers: { "x-wallet-address": signerAddress } });
        } catch {}
        onBackToCompletion?.();
        return;
      }

      const signatures: string[] = [];
      for (let i = 0; i < transactions.length; i++) {
        try {
          const bytes = decodeBase64ToBytes(transactions[i]);
          const tx = VersionedTransaction.deserialize(bytes);
          console.log("[token-process] signing tx", i + 1, "/", transactions.length);
          const signer: any = signerProvider as any;
          if (!signer?.signAndSendTransaction) {
            throw new Error("wallet does not support signAndSendTransaction");
          }
          let signature: string | undefined;
          try {
            const res = await signer.signAndSendTransaction(tx, "finalizePool");
            signature = res?.signature as string | undefined;
          } catch (e1: any) {
            // some wallets do not accept extra context parameter
            if (e1?.message?.includes("Missing or invalid parameters") || e1?.code === -32602) {
              const res2 = await signer.signAndSendTransaction(tx);
              signature = res2?.signature as string | undefined;
            } else {
              throw e1;
            }
          }

          if (!signature) throw new Error("missing signature after signAndSendTransaction");
          signatures.push(signature);
        } catch (signErr: any) {
          console.error("[token-process] sign error", signErr);
          const msg = signErr?.message || "failed to sign or send transaction";
          alert(msg);
          try {
            await fetchWithAuth(TOKEN_ENDPOINTS.FAILED_TOKEN_POOL(tokenId), { method: "POST", headers: { "x-wallet-address": signerAddress } });
          } catch {}
          onBackToCompletion?.();
          return;
        }
      }

      // 2) finalize with first signature
      const finalizeRes = await fetchWithAuth(
        TOKEN_ENDPOINTS.FINALIZE_TOKEN_POOL(tokenId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": signerAddress,
          },
          body: JSON.stringify({ signature: signatures[0] }),
        }
      );
      if (!finalizeRes.ok) {
        const err = await finalizeRes.json().catch(() => ({}));
        alert(err?.error || "failed to finalize token pool");
        try {
          await fetchWithAuth(TOKEN_ENDPOINTS.FAILED_TOKEN_POOL(tokenId), { method: "POST", headers: { "x-wallet-address": signerAddress } });
        } catch {}
        onBackToCompletion?.();
        return;
      }

      // 3) listen token status via WS
      setFinalTokenId(tokenId);
      const onStatus = (evt: { tokenId: string; status: "PENDING" | "PROCESSING" | "FINALIZING" | "MINTED" | "FAILED" }) => {
        if (evt.tokenId !== tokenId) return;
        if (evt.status === "MINTED" || evt.status === "FAILED") {
          setFinalStatus(evt.status);
          useSocketStore.getState().removeTokenStatusListener(tokenId, onStatus);
          useSocketStore.getState().leaveTokenRoom(tokenId);
          try {
            useTokenCreationFlowStore.getState().finalize(evt.status, tokenId);
          } catch {}
        }
      };
      // ensure socket connection
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL as string | undefined;
      try {
        if (wsUrl) {
          await useSocketStore.getState().connect(wsUrl);
        }
      } catch {}
      const ok = await useSocketStore.getState().joinTokenRoom(tokenId);
      if (!ok) {
        alert("failed to join token room");
        onBackToCompletion?.();
        return;
      }
      useSocketStore.getState().addTokenStatusListener(tokenId, onStatus);
    } catch (e) {
      console.error("[token-process] error", e);
      alert(e instanceof Error ? e.message : "unexpected error during pool creation");
      try {
        const { walletAddress: latestAddress } = useWalletStore.getState();
        await fetchWithAuth(TOKEN_ENDPOINTS.FAILED_TOKEN_POOL(tokenId), { method: "POST", headers: { "x-wallet-address": (latestAddress || walletAddress)! } });
      } catch {}
      onBackToCompletion?.();
    }
  }, [tokenId, walletAddress, provider, onBackToCompletion]);

  useEffect(() => {
    useOverlayStore.getState().setModal();
    begin();
  }, [begin]);

  return (
    <>
      <ProcessingOverlay
        status={"creating token pool..."}
        videoUrl={"https://still-bird-8438.t3.storage.dev/pf/pf_creating-your-token.mp4"}
        posterUrl={"/processing-creating.png"}
        titleText={"CREATING YOUR TOKEN"}
      />
      {finalStatus && <TokenFinalizeOverlay status={finalStatus} tokenId={finalTokenId} />}
    </>
  );
}
