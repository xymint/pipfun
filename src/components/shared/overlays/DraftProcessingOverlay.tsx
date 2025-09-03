import ProcessingOverlay from "@/components/shared/overlays/ProcessingOverlay";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import { useEffect } from "react";
import { useOverlayStore } from "@/store/overlayStore";

export default function DraftProcessingOverlay() {
  const statusText = useTokenCreationFlowStore((s) => s.statusText);
  const setModal = useOverlayStore((s) => s.setModal);
  const step = useTokenCreationFlowStore((s) => s.step);
  if (step !== "DRAFT_PROCESSING") return null;
  useEffect(() => {
    setModal();
  }, [setModal]);
  return <ProcessingOverlay status={statusText || "processing..."} />;
}
