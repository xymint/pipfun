import ProcessingOverlay from "@/components/shared/overlays/ProcessingOverlay";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import { useEffect, useRef } from "react";
import { useOverlayStore } from "@/store/overlayStore";
import { useSocketStore } from "@/store/socketStore";
import { useToastStore } from "@/store/toastStore";
import { fetchWithAuth } from "@/utils/api.util";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";

export default function DraftProcessingOverlay() {
  const statusText = useTokenCreationFlowStore((s) => s.statusText);
  const draftId = useTokenCreationFlowStore((s) => s.draftId);
  const setModal = useOverlayStore((s) => s.setModal);
  const step = useTokenCreationFlowStore((s) => s.step);
  if (step !== "DRAFT_PROCESSING") return null;
  useEffect(() => {
    setModal();
  }, [setModal]);
  // Manage websocket lifecycle while this overlay is active
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;

    // Polling fallback mechanism
    const startPolling = (draftId: string) => {
      console.log(`[Draft] Starting polling fallback for ${draftId}`);
      let attempts = 0;
      const maxAttempts = 30; // 5분간 10초마다

      const poll = async () => {
        if (!active || attempts >= maxAttempts) return;
        attempts++;

        try {
          const res = await fetchWithAuth(TOKEN_ENDPOINTS.GET_TOKEN_DRAFT(draftId));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json();
          const status = data?.data?.status || data?.status;
          console.log(`[Draft] Polling ${attempts}/${maxAttempts}: ${status}`);

          if (status === "TOKENIZED") {
            console.log(`[Draft] Polling success: ${draftId} tokenized`);
            useTokenCreationFlowStore.getState().showDraftCompleted(draftId);
            return;
          } else if (status === "FAILED") {
            console.log(`[Draft] Polling failed: ${draftId} processing failed`);
            try { useToastStore.getState().show("draft processing failed", "error"); } catch {}
            try { useOverlayStore.getState().resetOverlays(); } catch {}
            try { useTokenCreationFlowStore.getState().reset(); } catch {}
            return;
          }

          // Continue polling
          pollingRef.current = setTimeout(poll, 10000);
        } catch (e) {
          console.warn(`[Draft] Polling error ${attempts}/${maxAttempts}:`, e);
          if (attempts < maxAttempts) {
            pollingRef.current = setTimeout(poll, 10000);
          }
        }
      };

      pollingRef.current = setTimeout(poll, 10000); // Start after 10s
    };

    const setup = async () => {
      if (!draftId) return; // wait for draftId to be attached by flow
      console.log(`[Draft] Setup started for ${draftId}`);

      const ok = await useSocketStore.getState().joinTokenDraftRoom(draftId);
      console.log(`[Draft] WebSocket room join: ${ok ? 'success' : 'failed'}`);

      if (!ok) {
        console.log(`[Draft] WebSocket failed, starting polling fallback`);
        startPolling(draftId);
        return;
      }
      const onStatus = (evt: { tokenDraftId: string; status: string }) => {
        if (!active) return;
        if (evt.tokenDraftId !== draftId) return;
        console.log(`[Draft] WebSocket event: ${evt.status}`);

        // propagate human-readable status
        useTokenCreationFlowStore.setState({ statusText: evt.status.toLowerCase() });
        if (evt.status === "TOKENIZED") {
          console.log(`[Draft] WebSocket success: ${draftId} tokenized`);
          useTokenCreationFlowStore.getState().showDraftCompleted(draftId);
          useSocketStore.getState().removeTokenDraftStatusListener(draftId, onStatus);
          useSocketStore.getState().leaveTokenDraftRoom(draftId);
        } else if (evt.status === "FAILED") {
          console.log(`[Draft] WebSocket failed: ${draftId} processing failed`);
          try { useToastStore.getState().show("draft processing failed", "error"); } catch {}
          useSocketStore.getState().removeTokenDraftStatusListener(draftId, onStatus);
          useSocketStore.getState().leaveTokenDraftRoom(draftId);
          try { useOverlayStore.getState().resetOverlays(); } catch {}
          try { useTokenCreationFlowStore.getState().reset(); } catch {}
        }
      };
      useSocketStore.getState().addTokenDraftStatusListener(draftId, onStatus);

      // Start polling as backup even if WebSocket succeeds
      startPolling(draftId);

      return () => {
        useSocketStore.getState().removeTokenDraftStatusListener(draftId, onStatus);
        useSocketStore.getState().leaveTokenDraftRoom(draftId);
      };
    };
    let cleanup: (() => void) | undefined;
    setup().then((c) => { cleanup = c as unknown as (() => void) | undefined; }).catch((e) => {
      try { useToastStore.getState().show("draft overlay setup failed", "error"); } catch {}
      try { useOverlayStore.getState().resetOverlays(); } catch {}
      try { useTokenCreationFlowStore.getState().reset(); } catch {}
    });
    return () => {
      active = false;
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      if (cleanup) cleanup();
    };
  }, [draftId]);
  return <ProcessingOverlay status={statusText || "processing..."} />;
}
