import { AUTH_ENDPOINTS } from "@/constants/apiEndpoints";
import { fetchPublic, fetchWithAuth } from "@/utils/api.util";

export const getAuthToken = (): { authToken: string | null; authExpiry: number | null } => {
  return {
    authToken: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
    authExpiry: typeof window !== "undefined" ? Number(localStorage.getItem("auth_expiry")) : null,
  };
};

export const saveAuthToken = (token: string, expiresAt: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_expiry", String(expiresAt));
};

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_expiry");
};

export const issueAuthToken = async (
  walletAddress: string,
  signature: string,
  message: string
): Promise<{ authToken: string; authExpiry: number; walletAddress: string }> => {
  const response = await fetchPublic(AUTH_ENDPOINTS.ISSUE_AUTH_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, signature, message }),
  });

  if (!response.ok) {
    throw new Error("signature verification failed");
  }

  const data = await response.json();
  saveAuthToken(data.token, data.expiresAt);

  return {
    authToken: data.token,
    authExpiry: data.expiresAt,
    walletAddress: data.walletAddress,
  };
};

export const verifyAuthToken = async (): Promise<boolean> => {
  const response = await fetchWithAuth(AUTH_ENDPOINTS.VERIFY_AUTH_TOKEN, { method: "POST" });
  return response.ok;
};

export const extendAuthToken = async (): Promise<{
  authToken: string;
  authExpiry: number;
  walletAddress: string;
}> => {
  const response = await fetchWithAuth(AUTH_ENDPOINTS.EXTEND_AUTH_TOKEN, { method: "POST" });
  if (!response.ok) throw new Error("failed to extend token");
  const data = await response.json();
  saveAuthToken(data.token, data.expiresAt);
  return { authToken: data.token, authExpiry: data.expiresAt, walletAddress: data.walletAddress };
};
