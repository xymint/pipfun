import { useEffect, useMemo, useRef, useState } from "react";
import OverlayPortal from "@/components/shared/overlays/OverlayPortal";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth, fetchFormDataWithAuth } from "@/utils/api.util";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";
import { useWalletStore } from "@/store/walletStore";
import { useSocketStore } from "@/store/socketStore";
// TokenProcessingOverlay is rendered by Home via flowStep; this component should not render it directly
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import { useOverlayStore } from "@/store/overlayStore";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";

type Draft = {
  id: string;
  sourceUrl?: string;
  name?: string;
  ticker?: string;
  description?: string;
  imageUrl?: string;
  twitter?: string;
  telegram?: string;
};

export default function CompletionOverlay({
  tokenDraftId: tokenDraftIdProp,
}: {
  tokenDraftId?: string;
}) {
  const setDark = useOverlayStore((s) => s.setDark);
  const step = useTokenCreationFlowStore((s) => s.step);
  if (step !== "DRAFT_COMPLETED") return null;
  useEffect(() => {
    setDark();
  }, [setDark]);
  const overlayVersion = useOverlayStore((s) => s.version);

  // query params: id (primary), draftId (fallback), status for badge
  const searchParams = useSearchParams();
  const tokenDraftId = useMemo(
    () => tokenDraftIdProp || searchParams.get("id") || searchParams.get("draftId"),
    [tokenDraftIdProp, searchParams],
  );
  const rawStatus = (searchParams.get("status") || "").toLowerCase();
  const badgeLabel = rawStatus === "failed" ? "Failed" : "Tokenized";
  const [draft, setDraft] = useState<Draft | null>(null);
  const walletAddress = useWalletStore((s) => s.walletAddress);

  // local editable form state
  const [formName, setFormName] = useState("");
  const [formTicker, setFormTicker] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTwitter, setFormTwitter] = useState("");
  const [formTelegram, setFormTelegram] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // processing overlay is controlled by flow in Home; keep only local form states here
  const flow = useTokenCreationFlowStore.getState();

  // draft fetch function reused in multiple places
  const fetchDraft = async () => {
    if (!tokenDraftId) return;
    try {
      const wa =
        walletAddress ||
        (typeof window !== "undefined" ? localStorage.getItem("wallet_address") : null);
      if (!wa) return; // wait until wallet is available
      const res = await fetchWithAuth(TOKEN_ENDPOINTS.GET_TOKEN_DRAFT(tokenDraftId), {
        headers: { "x-wallet-address": wa },
      });
      if (!res.ok) return;
      const data = await res.json();
      setDraft(data?.data ?? null);
    } catch {}
  };

  useEffect(() => {
    fetchDraft();
  }, [tokenDraftId, walletAddress]);

  // removed websocket draft status subscription for simplicity; rely on explicit fetch after transitions

  useEffect(() => {
    if (!draft) return;
    setFormName(draft.name ?? "");
    setFormTicker(draft.ticker ?? "");
    setFormDescription(draft.description ?? "");
    setFormTwitter(draft.twitter ?? "");
    setFormTelegram(draft.telegram ?? "");
    setImagePreview(draft.imageUrl || "/processing-cooking.png");
  }, [draft]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tokenDraftId || !walletAddress) return;
    try {
      setIsSubmitting(true);
      // Immediately switch flow to TOKEN_PROCESSING so the processing overlay mounts
      useTokenCreationFlowStore.getState().beginTokenProcessing();

      // 1) update draft (FormData)
      const form = new FormData();
      if (imageFile) form.append("image", imageFile);
      if (formName) form.append("name", formName);
      if (formTicker) form.append("ticker", formTicker);
      if (formDescription) form.append("description", formDescription);
      if (formTwitter) form.append("twitter", formTwitter);
      if (formTelegram) form.append("telegram", formTelegram);

      const updateRes = await fetchFormDataWithAuth(
        TOKEN_ENDPOINTS.UPDATE_TOKEN_DRAFT(tokenDraftId),
        form,
        "PUT",
        true,
        { "x-wallet-address": walletAddress },
      );
      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}));
        try { useToastStore.getState().show(err?.error || "failed to update token draft", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }

      // 2) create token from draft
      const createRes = await fetchWithAuth(TOKEN_ENDPOINTS.CREATE_TOKEN_FROM_DRAFT(tokenDraftId), {
        method: "POST",
        headers: { "x-wallet-address": walletAddress, "Content-Type": "application/json" },
        body: JSON.stringify({ project: "pipfun" }),
      });
      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !createData?.success || !createData?.tokenId) {
        try { useToastStore.getState().show(createData?.error || "failed to create token from draft", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }

      const tokenId = createData.tokenId as string;
      // Provide tokenId to the processing overlay which is already mounted
      useTokenCreationFlowStore.getState().attachTokenId(tokenId);
    } catch (err) {
      try { useToastStore.getState().show("unexpected error", "error"); } catch {}
      try { useOverlayStore.getState().resetOverlays(); } catch {}
      try { useTokenCreationFlowStore.getState().reset(); } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OverlayPortal>
      <div
        key={overlayVersion}
        className="relative z-[80] mb-[120px] flex items-center justify-center text-white"
      >
        <div
          className={cn(
            "w-[640px] max-w-full rounded-[var(--radius-xl)]",
            "border border-[var(--tokens-border)] bg-[var(--card)]",
            "px-5 py-6 md:px-8 md:py-8 shadow-[var(--card-shadow)]",
          )}
        >
          {/* header */}
          <div className="mb-4 flex flex-col items-start gap-2">
            <span className={cn(
              "inline-flex items-center rounded-full bg-emerald-600",
              "px-[10px] py-[2px] text-[12px] leading-[16px] tracking-[-0.1px]",
              "font-semibold text-white"
            )}>
              {badgeLabel}
            </span>
            <span className="w-full truncate text-[14px] leading-[20px] text-[var(--tokens-foreground)]">
              Source: {draft?.sourceUrl ?? "https://pip.fun"}
            </span>
          </div>
          {/* form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-3 text-left pt-[32px]">
            {/* avatar / image uploader */}
            <div className="md:col-span-2 mb-2 flex items-center justify-center">
              <button
                type="button"
                className="h-30 w-30 overflow-hidden rounded-full border border-2 border-dashed border-[var(--tokens-border)] bg-[var(--muted)]"
                onClick={() => fileInputRef.current?.click()}
                aria-label="change image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview || "/processing-cooking.png"}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {/* name */}
            <div className="space-y-1.5">
              <label className="block text-[14px] leading-[20px] font-medium text-[var(--tokens-foreground)]">
                Token name
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--tokens-border)] bg-[var(--tokens-background)] px-4 py-[10px] text-[16px] leading-[24px] text-[var(--tokens-foreground)] outline-none"
                placeholder="Token name"
              />
            </div>

            {/* ticker */}
            <div className="space-y-1.5">
              <label className="block text-[14px] leading-[20px] font-medium text-[var(--tokens-foreground)]">
                Token ticker
              </label>
              <input
                value={formTicker}
                onChange={(e) => setFormTicker(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--tokens-border)] bg-[var(--tokens-background)] px-4 py-[10px] text-[16px] leading-[24px] text-[var(--tokens-foreground)] outline-none"
                placeholder="Ticker"
              />
            </div>

            {/* description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text=[var(--muted-foreground)] block text-[14px] leading-[20px] font-medium">
                Token description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="custom-scrollbar h-[80px] w-full resize-none overflow-y-auto rounded-[var(--radius-md)] border border-[var(--tokens-border)] bg-[var(--tokens-background)] p-4 text-[14px] leading-[20px] text-[var(--muted-foreground)] outline-none"
                placeholder="Tell people about your token"
              />
            </div>

            {/* CTA */}
            <div className="md:col-span-2 mt-4 mb-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[54px] w-full cursor-pointer rounded-[var(--radius-md)] bg-[var(--pip-primary)] text-[16px] leading-[24px] font-medium text-[var(--pip-primary-foreground)] disabled:opacity-60"
              >
                Create Token ( 0.038 SOL )
              </button>
            </div>

            {/* socials */}
            <div>
              <input
                value={formTwitter}
                onChange={(e) => setFormTwitter(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--tokens-border)] bg-[var(--tokens-background)] px-4 py-[10px] text-[16px] leading-[24px] text-[var(--tokens-foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                placeholder="Twitter"
              />
            </div>
            <div>
              <input
                value={formTelegram}
                onChange={(e) => setFormTelegram(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--tokens-border)] bg-[var(--tokens-background)] px-4 py-[10px] text-[16px] leading-[24px] text-[var(--tokens-foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                placeholder="Telegram"
              />
            </div>
          </form>
          {/* footer list (static placeholders for now) */}
          <div className="mt-6 text-left text-[var(--muted-foreground)]">
            <div className="mb-3 text-[14px] leading-[20px] font-semibold text-[var(--tokens-foreground)]">
              Additional Settings
            </div>
            <div className="grid grid-cols-2 gap-y-3 text-[14px] leading-[20px]">
              <div className="text-[var(--tokens-secondary-foreground)]">Total Supply</div>
              <div className="text-right text-[var(--tokens-popover-foreground)]">
                1,000,000,000
              </div>
              <div className="text-[var(--tokens-secondary-foreground)]">Dynamic fee</div>
              <div className="text-right text-[var(--tokens-popover-foreground)]">Enabled</div>
              <div className="text-[var(--tokens-secondary-foreground)]">Creator Fee</div>
              <div className="text-right text-[var(--tokens-popover-foreground)]">70%</div>
            </div>
          </div>
        </div>
      </div>
      {/* no nested overlays here when tokenPhase is active (early return above) */}
    </OverlayPortal>
  );
}
