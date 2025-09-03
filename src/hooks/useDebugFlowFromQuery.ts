"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";

// Debug helper: Read ?status=...&id=... and drive the flow store without touching markup logic
export default function useDebugFlowFromQuery() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const raw = (searchParams.get("status") || "").toLowerCase();
    const id = searchParams.get("id") || searchParams.get("draftId") || undefined;
    const flow = useTokenCreationFlowStore.getState();

    switch (raw) {
      // Draft phase
      case "processing": {
        flow.startDraftProcessing("debug processing");
        if (id) flow.attachDraftId(id);
        break;
      }
      case "completed":
      case "tokenized":
      case "failed": {
        if (id) flow.showDraftCompleted(id);
        break;
      }

      // Token phase
      case "token-processing": {
        flow.beginTokenProcessing();
        if (id) flow.attachTokenId(id);
        break;
      }
      case "minted": {
        flow.finalize("MINTED", id);
        break;
      }
      case "token-failed": {
        flow.finalize("FAILED", id);
        break;
      }
      default:
        // do nothing
        break;
    }
  }, [searchParams]);
}
