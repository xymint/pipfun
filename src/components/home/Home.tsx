"use client";

import { useEffect } from "react";
// Background overlays are globally handled in layout via backgroundStore
import { useOverlayStore } from "@/store/overlayStore";
import TokenCreationCard from "@/components/home/TokenCreationCard";
import CompletionOverlay from "@/components/shared/overlays/CompletionOverlay";
import TokenProcessingOverlay from "@/components/shared/overlays/TokenProcessingOverlay";
import TokenFinalizeOverlay from "@/components/shared/overlays/TokenFinalizeOverlay";
import DraftProcessingOverlay from "@/components/shared/overlays/DraftProcessingOverlay";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import useDebugFlowFromQuery from "@/hooks/useDebugFlowFromQuery";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const resetOverlays = useOverlayStore((s) => s.resetOverlays);
  const resetFlow = useTokenCreationFlowStore((s) => s.reset);
  // hook will drive the flow store based on query, without leaking into rendering logic
  useDebugFlowFromQuery();

  // Ensure overlays are cleared whenever Home mounts (arrived from any page)
  useEffect(() => {
    resetOverlays();
    resetFlow();
  }, [resetOverlays, resetFlow]);
  const flowStep = useTokenCreationFlowStore((s) => s.step);
  const draftId = useTokenCreationFlowStore((s) => s.draftId);
  const tokenId = useTokenCreationFlowStore((s) => s.tokenId);
  const finalizeStatus = useTokenCreationFlowStore((s) => s.finalizeStatus);

  return (
    <>
      {/* Background overlay is now owned by each component. Keep light/modal for base state. */}
      {/* background overlay removed here; handled by layout */}
      <section className="w-full overflow-hidden">
        {/* Only one main child visible depending on flow step */}
        {flowStep === "IDLE" && <TokenCreationCard />}
        {flowStep === "DRAFT_PROCESSING" && <DraftProcessingOverlay />}
        {flowStep === "DRAFT_COMPLETED" && <CompletionOverlay tokenDraftId={draftId} />}
        {flowStep === "TOKEN_PROCESSING" && <TokenProcessingOverlay tokenId={tokenId} draftId={draftId} />}
        {flowStep === "TOKEN_FINALIZED" && finalizeStatus && <TokenFinalizeOverlay status={finalizeStatus} tokenId={tokenId} />}
      </section>
    </>
  );
}
