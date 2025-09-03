"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";
import { fetchWithAuth } from "@/utils/api.util";
import ProcessingOverlay from "@/components/shared/overlays/ProcessingOverlay";
import CompletionOverlay from "@/components/shared/overlays/CompletionOverlay";
import { useSocketStore } from "@/store/socketStore";
import { useWalletStore } from "@/store/walletStore";
import { useOverlayStore } from "@/store/overlayStore";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";

export default function TokenCreationCard() {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showInvalidHint, setShowInvalidHint] = useState(false);

  const tokenDraftIdRef = useRef<string | null>(null);
  const walletAddress = useWalletStore((s) => s.walletAddress);
  const overlayVersion = useOverlayStore((s) => s.version);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrlInput(text);
    } catch {
      // noop
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!urlInput.trim()) return alert("Please enter a valid URL");
      if (!walletAddress) return alert("Please connect your wallet first");

      // reset error hint before a new attempt
      setShowInvalidHint(false);
      setIsSubmitting(true);
      setShowProcessing(true);
      setProcessingStatus("starting analysis");
      useTokenCreationFlowStore.setState({ step: "DRAFT_PROCESSING", statusText: "starting analysis" });

      try {
        const response = await fetchWithAuth(TOKEN_ENDPOINTS.CREATE_TOKEN_DRAFT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-wallet-address": walletAddress },
          body: JSON.stringify({ url: urlInput.trim(), project: "pipfun" }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 429) {
            alert(data?.error || "Rate limit exceeded. Please try again later.");
          } else if (response.status === 500) {
            // show inline hint only for 500 as requested
            setShowInvalidHint(true);
          } else {
            alert(data?.error || "Failed to analyze URL");
          }
          setShowProcessing(false);
          return;
        }

        const draftId = data?.data?.id as string | undefined;
        if (!draftId) {
          alert("Invalid server response");
          setShowProcessing(false);
          return;
        }

        tokenDraftIdRef.current = draftId;
        useTokenCreationFlowStore.getState().attachDraftId(draftId);
        setProcessingStatus("waiting for tokenizer");
        useTokenCreationFlowStore.setState({ statusText: "waiting for tokenizer" });

        // join websocket room and listen for status
        const socket = useSocketStore.getState();
        const ok = await socket.joinTokenDraftRoom(draftId);
        if (!ok) {
          // still show processing, backend may still proceed
          setProcessingStatus("connected failed, still processing...");
        } else {
          const onStatus = (evt: { tokenDraftId: string; status: string }) => {
            if (evt.tokenDraftId !== draftId) return;
            setProcessingStatus(evt.status);
            if (evt.status === "TOKENIZED" || evt.status === "FAILED") {
              setShowProcessing(false);
              setShowCompleted(true);
              useTokenCreationFlowStore.getState().showDraftCompleted(draftId);
              useSocketStore.getState().removeTokenDraftStatusListener(draftId, onStatus);
              useSocketStore.getState().leaveTokenDraftRoom(draftId);
            }
          };
          useSocketStore.getState().addTokenDraftStatusListener(draftId, onStatus);
        }
      } catch (err) {
        alert("Unexpected error occurred");
        setShowProcessing(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [urlInput, walletAddress]
  );

  useEffect(() => {
    return () => {
      const draftId = tokenDraftIdRef.current;
      if (draftId) {
        // cleanup listeners/room
        const s = useSocketStore.getState();
        // we can't remove a specific handler reference here; rooms will be left
        s.leaveTokenDraftRoom(draftId);
      }
    };
  }, []);

  // When overlays are globally reset, clear local overlay flags
  useEffect(() => {
    setShowProcessing(false);
    setShowCompleted(false);
    setProcessingStatus("");
  }, [overlayVersion]);

  return (
    <div
      className="w-[654px] mx-auto rounded-[var(--radius-xl)] border border-white/20 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] p-[64px] text-center"
    >
      <div className="flex w-full flex-col items-center gap-[20px] text-center mb-[40px]">
        <h1 className="[font-family:var(--font-bagel-fat-one)] text-[32px] leading-[58px] bg-clip-text text-transparent bg-gradient-to-b from-[var(--base-white)] to-[var(--orange-50)]">
          CREATE TOKEN
        </h1>

        <p className="mx-auto [font-family:var(--font-outfit)] text-[18px] leading-[28px] tracking-[-0.108px] text-white font-medium">
          Turn any website or link into a token.
          <br />
          AI will analyze the page and build a concept instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`w-full ${isSubmitting ? "opacity-50" : ""} space-y-3`}>
        <div
          className={`flex flex-row items-center justify-between box-border rounded-[var(--radius-xl)] border ${urlInput.trim().length > 0 ? "border-white" : "border-white/50"} bg-white/20 p-5 backdrop-blur-[12px] focus-within:border-white`}
        >
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter your URL"
            className="flex-1 bg-transparent font-medium text-[18px] leading-[28px] [font-family:var(--font-outfit)] text-white placeholder-white outline-none"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="rounded bg-white/20 px-2 py-1 text-white text-[12px] leading-[16px] [font-family:var(--font-outfit)]"
          >
            Paste
          </button>
        </div>

        {/* Simple inline hint (kept minimal) */}
        {showInvalidHint && (
          <span className="px-2 py-1 rounded-[var(--radius)] bg-red-600 text-red-100 text-[14px] leading-[20px] [font-family:var(--font-outfit)] inline-block">Enter a valid URL</span>
        )}

        <button
          type="submit"
          className={`w-full h-[70px] rounded-[var(--radius-xl)] font-semibold text-white text-[20px] leading-[24px] [font-family:var(--font-bagel-fat-one)] shadow-[inset_0_-2px_5px_0_rgba(0,0,0,0.32)] ${urlInput.trim().length > 0 ? "bg-[var(--pip-primary)] opacity-100" : "bg-[var(--pip-primary)]/50 opacity-50 cursor-not-allowed"}`}
          disabled={isSubmitting || urlInput.trim().length === 0}
          onClick={(e) => {
            if (urlInput.trim().length === 0) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          COOK IT
        </button>
      </form>
    </div>
  );
}
