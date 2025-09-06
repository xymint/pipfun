// Minimal API endpoint constants for pipfun
// Do not start with a slash (/)

export const AUTH_ENDPOINTS = {
  EXTEND_AUTH_TOKEN: "auth/extend-auth-token",
  VERIFY_AUTH_TOKEN: "auth/verify-auth-token",
  ISSUE_AUTH_TOKEN: "auth/issue-auth-token",
};

// Token-related endpoints (minimal for draft creation)
export const TOKEN_ENDPOINTS = {
  CREATE_TOKEN_DRAFT: "tokens/draft",
  GET_TOKEN_DRAFT: (id: string) => `tokens/draft/${id}`,
  UPDATE_TOKEN_DRAFT: (id: string) => `tokens/draft/${id}`,
  CREATE_TOKEN_FROM_DRAFT: (id: string) => `tokens/create-from-token-draft/${id}`,
  // pool creation flow
  CREATE_TOKEN_POOL: (id: string) => `tokens/${id}/pool`,
  FINALIZE_TOKEN_POOL: (id: string) => `tokens/${id}/pool/finalize`,
  FAILED_TOKEN_POOL: (id: string) => `tokens/${id}/pool/failed`,
  // details
  GET_TOKEN_DETAIL: (id: string) => `tokens/${id}`,
  GET_TOKEN_LIST: `tokens/list`,
  GET_MY_TOKENS: `tokens/my`,
  POST_CLAIM_CREATOR_DBC_FEE: (id: string) => `tokens/${id}/claim-creator-dbc-fee`,
  POST_CLAIM_CREATOR_DBC_FEE_COMPLETE: (id: string) => `tokens/${id}/claim-creator-dbc-fee/complete`,
  // optionally available endpoints (unreferenced by current flow)
  // RETRY_FINALIZE_TOKEN_POOL: (id: string) => `tokens/${id}/pool/finalize/retry`,
  // GET_TOKEN_POOL: (id: string) => `tokens/${id}/pool`,
};
