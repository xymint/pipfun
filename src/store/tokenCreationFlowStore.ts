import { create } from "zustand";

export type TokenFlowStep = "IDLE" | "DRAFT_PROCESSING" | "DRAFT_COMPLETED" | "TOKEN_PROCESSING" | "TOKEN_FINALIZED";

type TokenCreationFlowState = {
  step: TokenFlowStep;
  draftId?: string;
  tokenId?: string;
  finalizeStatus?: "MINTED" | "FAILED";
  statusText?: string;

  // transitions
  reset: () => void;
  startDraftProcessing: (statusText?: string) => void;
  attachDraftId: (draftId: string) => void;
  showDraftCompleted: (draftId: string) => void;
  beginTokenProcessing: () => void;
  attachTokenId: (tokenId: string) => void;
  finalize: (status: "MINTED" | "FAILED", tokenId?: string) => void;
};

export const useTokenCreationFlowStore = create<TokenCreationFlowState>((set) => ({
  step: "IDLE",
  draftId: undefined,
  tokenId: undefined,
  finalizeStatus: undefined,
  statusText: undefined,

  reset: () => set({ step: "IDLE", draftId: undefined, tokenId: undefined, finalizeStatus: undefined, statusText: undefined }),
  startDraftProcessing: (statusText?: string) => set({ step: "DRAFT_PROCESSING", statusText }),
  attachDraftId: (draftId: string) => set({ draftId }),
  showDraftCompleted: (draftId: string) => set({ step: "DRAFT_COMPLETED", draftId }),
  beginTokenProcessing: () => set({ step: "TOKEN_PROCESSING" }),
  attachTokenId: (tokenId: string) => set({ tokenId }),
  finalize: (status, tokenId) => set({ step: "TOKEN_FINALIZED", finalizeStatus: status, tokenId }),
}));
