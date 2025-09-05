"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";
import { fetchWithAuth } from "@/utils/api.util";
import { useSocketStore } from "@/store/socketStore";
import { useWalletStore } from "@/store/walletStore";
import { useOverlayStore } from "@/store/overlayStore";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";

export default function TokenCreationCard() {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showInvalidHint, setShowInvalidHint] = useState(false);
  const globalErrorHint = useTokenCreationFlowStore((s) => s.errorHint);

  const tokenDraftIdRef = useRef<string | null>(null);
  const walletAddress = useWalletStore((s) => s.walletAddress);
  const resetOverlays = useOverlayStore((s) => s.resetOverlays);
  const resetFlow = useTokenCreationFlowStore((s) => s.reset);

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
      if (!urlInput.trim()) return useToastStore.getState().show("Please enter a valid URL", "warn");
      if (!walletAddress) return useToastStore.getState().show("Please connect your wallet first", "warn");

      // reset local + global error hint before a new attempt
      setShowInvalidHint(false);
      useTokenCreationFlowStore.setState({ errorHint: undefined });
      setIsSubmitting(true);
      useTokenCreationFlowStore.setState({
        step: "DRAFT_PROCESSING",
        statusText: "starting analysis",
      });

      try {
        const response = await fetchWithAuth(TOKEN_ENDPOINTS.CREATE_TOKEN_DRAFT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-wallet-address": walletAddress },
          body: JSON.stringify({ url: urlInput.trim(), project: "pipfun" }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 429) {
            useToastStore.getState().show(data?.error || "Rate limit exceeded. Please try again later.", "warn");
          } else if (response.status === 500) {
            setShowInvalidHint(true);
            useTokenCreationFlowStore.getState().showErrorHint("Enter a valid URL");
          } else {
            // useToastStore.getState().show(data?.error || "Failed to analyze URL", "error");
            setShowInvalidHint(true);
            useTokenCreationFlowStore.getState().showErrorHint("Failed to analyze URL");
          }
          resetOverlays();
          resetFlow();
          return;
        }

        const draftId = data?.data?.id as string | undefined;
        if (!draftId) {
          useToastStore.getState().show("Invalid server response", "error");
          resetOverlays();
          resetFlow();
          return;
        }

        tokenDraftIdRef.current = draftId;
        useTokenCreationFlowStore.getState().attachDraftId(draftId);
        useTokenCreationFlowStore.setState({ statusText: "waiting for tokenizer" });

        // do not connect socket here; DraftProcessingOverlay will manage websocket lifecycle
      } catch (err) {
        useToastStore.getState().show("Unexpected error occurred", "error");
        resetOverlays();
        resetFlow();
      } finally {
        setIsSubmitting(false);
      }
    },
    [urlInput, walletAddress],
  );

  return (
    <div
      className={cn(
        "mx-auto w-[654px] max-w-full text-center",
        "rounded-[var(--radius-xl)]",
        "border border-white/20",
        "bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]",
        "px-5 py-8",
        "md:p-[64px]",
      )}
    >
      <div className="mb-[40px] flex w-full flex-col items-center gap-[20px] text-center">
        <h1
          className={cn(
            "bg-gradient-to-b from-[var(--base-white)] to-[var(--orange-50)]",
            "bg-clip-text [font-family:var(--font-bagel-fat-one)] text-[32px] text-transparent",
            "leading-[40px] ",
            "md:leading-[58px]",
          )}
        >
          CREATE TOKEN
        </h1>

        <p
          className={cn(
            "mx-auto [font-family:var(--font-outfit)] text-[18px] leading-[28px] font-medium text-white",
            "tracking-0 md:tracking-[-0.1px]",
          )}
        >
          Turn any website or link into a token.
          <br />
          AI will analyze the page and build a concept instantly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`w-full ${isSubmitting ? "opacity-50" : ""} space-y-3`}
      >
        <div
          className={cn(
            "box-border flex items-center w-full gap-2",
            "rounded-[var(--radius-xl)] border bg-white/20",
            "p-4",
            "md:p-5",
            "backdrop-blur-[12px] focus-within:border-white",
            urlInput.trim().length > 0 ? "border-white" : "border-white/50",
          )}
        >
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter your URL"
            className={cn(
              "flex-1 min-w-0 bg-transparent",
              "[font-family:var(--font-outfit)] font-medium text-white placeholder-white outline-none",
              "text-[16px] leading-[24px] tracking-0",
              "md:text-[18px] md:leading-[28px] md:tracking-[-0.1px]",
            )}
          />
          <button
            type="button"
            onClick={handlePaste}
            className={cn(
              "shrink-0 rounded bg-white/20 px-2 py-1",
              "[font-family:var(--font-outfit)] text-white",
              "text-[12px] leading-[16px] tracking-0",
              "md:text-[14px] md:leading-[20px] md:tracking-[-0.1px]",
            )}
          >
            Paste
          </button>
        </div>

        {(showInvalidHint || globalErrorHint) && (
          <span className={cn(
            "inline-block rounded-[var(--radius)] bg-red-600 px-2 py-1",
            "[font-family:var(--font-outfit)] text-[14px] leading-[20px] text-red-100",
          )}>
            {globalErrorHint || "Enter a valid URL"}
          </span>
        )}

        <button
          type="submit"
          className={cn(
            "h-[70px] w-full rounded-[var(--radius-xl)]",
            "[font-family:var(--font-bagel-fat-one)] text-[20px] leading-[24px] text-white shadow-[inset_0_-2px_5px_0_rgba(0,0,0,0.32)]",
            urlInput.trim().length > 0 ? "bg-[var(--pip-primary)] opacity-100" : "cursor-not-allowed bg-[var(--pip-primary)]/50 opacity-50",
          )}
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
