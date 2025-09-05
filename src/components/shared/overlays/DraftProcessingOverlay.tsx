import ProcessingOverlay from "@/components/shared/overlays/ProcessingOverlay";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import { useEffect } from "react";
import { useOverlayStore } from "@/store/overlayStore";
import { useSocketStore } from "@/store/socketStore";
import { useToastStore } from "@/store/toastStore";

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
  useEffect(() => {
    let active = true;
    const setup = async () => {
      if (!draftId) return; // wait for draftId to be attached by flow
      const ok = await useSocketStore.getState().joinTokenDraftRoom(draftId);
      if (!ok) {
        try { useToastStore.getState().show("failed to join draft room", "error"); } catch {}
        try { useOverlayStore.getState().resetOverlays(); } catch {}
        try { useTokenCreationFlowStore.getState().reset(); } catch {}
        return;
      }
      const onStatus = (evt: { tokenDraftId: string; status: string }) => {
        if (!active) return;
        if (evt.tokenDraftId !== draftId) return;
        // propagate human-readable status
        useTokenCreationFlowStore.setState({ statusText: evt.status.toLowerCase() });
        if (evt.status === "TOKENIZED") {
          useTokenCreationFlowStore.getState().showDraftCompleted(draftId);
          useSocketStore.getState().removeTokenDraftStatusListener(draftId, onStatus);
          useSocketStore.getState().leaveTokenDraftRoom(draftId);
        } else if (evt.status === "FAILED") {
          try { useToastStore.getState().show("draft processing failed", "error"); } catch {}
          useSocketStore.getState().removeTokenDraftStatusListener(draftId, onStatus);
          useSocketStore.getState().leaveTokenDraftRoom(draftId);
          try { useOverlayStore.getState().resetOverlays(); } catch {}
          try { useTokenCreationFlowStore.getState().reset(); } catch {}
        }
      };
      useSocketStore.getState().addTokenDraftStatusListener(draftId, onStatus);
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
      if (cleanup) cleanup();
    };
  }, [draftId]);
  return <ProcessingOverlay status={statusText || "processing..."} />;
}
