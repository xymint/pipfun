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
import { useToastStore } from "@/store/toastStore";
import crypto from "crypto";


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
      // 1) request unsigned transaction for single-sign
      const initRes = await fetchWithAuth(
        TOKEN_ENDPOINTS.CREATE_TOKEN_POOL_SINGLE_SIGN(tokenId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": signerAddress,
          },
        }
      );

      if (!initRes.ok) {
        const err = await initRes.json().catch(() => ({}));
        try { useToastStore.getState().show(err?.error || "failed to get unsigned pool transaction", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }

      const initJson = await initRes.json();
      const txB64: string | undefined = initJson?.transaction;
      const nonce: string | undefined = initJson?.nonce;
      if (!txB64 || !nonce) {
        try { useToastStore.getState().show("missing transaction or nonce", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }

      // 2) sign locally with wallet
      const signer: any = signerProvider as any;
      if (!signer?.signTransaction) {
        try { useToastStore.getState().show("wallet does not support signTransaction", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }
      const bytes = Buffer.from(txB64, "base64");
      const tx = VersionedTransaction.deserialize(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));

      // Preserve original message before signing
      const originalMessage = tx.message.serialize();
      const originalSha = crypto.createHash('sha256').update(originalMessage).digest('hex');
      console.log(`[Pool] Original message SHA: ${originalSha}`);

      const signedTx = (await signer.signTransaction(tx)) || tx;

      // Check if message changed after signing
      const signedMessage = signedTx.message.serialize();
      const signedSha = crypto.createHash('sha256').update(signedMessage).digest('hex');
      console.log(`[Pool] Signed message SHA: ${signedSha}, same: ${originalSha === signedSha}`);

      // 3) submit signed transaction to server
      // Create new transaction with original message + signatures to avoid message changes
      const finalTx = new VersionedTransaction(tx.message, signedTx.signatures);
      const finalMessage = finalTx.message.serialize();
      const finalSha = crypto.createHash('sha256').update(finalMessage).digest('hex');
      console.log(`[Pool] Final message SHA: ${finalSha}, same as original: ${originalSha === finalSha}`);

      const signedB64 = Buffer.from(finalTx.serialize()).toString("base64");
      const submitRes = await fetchWithAuth(
        TOKEN_ENDPOINTS.SUBMIT_TOKEN_POOL_SINGLE_SIGN(tokenId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": signerAddress,
          },
          body: JSON.stringify({ transaction: signedB64, nonce }),
        }
      );
      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({}));
        try { useToastStore.getState().show(err?.error || "failed to submit signed transaction", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }

      useToastStore.getState().show("Transaction sent, waiting for finalization...", "success");

      // 4) listen token status via WS
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
        try { useToastStore.getState().show("failed to join token room", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }
      useSocketStore.getState().addTokenStatusListener(tokenId, onStatus);
    } catch (e) {
      console.error("[token-process] error", e);
      try { useToastStore.getState().show(e instanceof Error ? e.message : "unexpected error during pool creation", "error"); } catch {}
      try { useOverlayStore.getState().resetOverlays(); } catch {}
      try { useTokenCreationFlowStore.getState().reset(); } catch {}
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
