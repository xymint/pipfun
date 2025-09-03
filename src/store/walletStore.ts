import { create } from "zustand";
import type { WalletProvider, PhantomProvider } from "@/adapters/wallet";
import { getWalletProvider } from "@/adapters/wallet";
import { issueAuthToken, getAuthToken, extendAuthToken } from "@/services/auth";

type WalletState = {
  isConnecting: boolean;
  walletAddress: string | null;
  authToken: string | null;
  authExpiry: number | null;
  provider: WalletProvider | null;

  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnecting: false,
  walletAddress: null,
  authToken: null,
  authExpiry: null,
  provider: null,

  connectWallet: async (walletName: string) => {
    try {
      set({ isConnecting: true });

      const provider = getWalletProvider(walletName);
      if (!provider) {
        alert(`${walletName} wallet not found`);
        return;
      }
      set({ provider });

      // Phantom can optionally use onlyIfTrusted; others ignore options
      const phantom = provider as Partial<PhantomProvider>;
      const response = await (phantom.connect
        ? phantom.connect({ onlyIfTrusted: false })
        : (provider as any).connect());

      const walletAddress = response.publicKey.toBase58();
      if (!walletAddress) throw new Error("failed to get public key");

      // Persist selected wallet name for auto-connect
      if (typeof window !== "undefined") {
        localStorage.setItem("wallet_name", walletName);
        localStorage.setItem("wallet_address", walletAddress);
      }

      // Prepare message and sign
      const message = `this is pipdotfun, please sign this message to verify your wallet ownership. (${new Date().toISOString()})`;
      const encodedMessage = new TextEncoder().encode(message);
      const signed = await (provider as any).signMessage(encodedMessage);

      const signatureBytes: Uint8Array | undefined = signed?.signature;
      if (!signatureBytes) throw new Error("signature missing");

      const signatureBase58 = base58Encode(signatureBytes);

      const { authToken, authExpiry } = await issueAuthToken(
        walletAddress,
        signatureBase58,
        message
      );

      set({ walletAddress, authToken, authExpiry });
      console.log("[wallet] connected", walletAddress);
      alert("wallet connected");

      // Optionally extend token if near expiry (within 3 days)
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
      if (authExpiry - Date.now() < THREE_DAYS_MS) {
        try {
          const extended = await extendAuthToken();
          set({ authToken: extended.authToken, authExpiry: extended.authExpiry });
        } catch (e) {
          console.warn("[wallet] token extension failed", e);
        }
      }
    } catch (error) {
      console.error("[wallet] connect error", error);
      alert("failed to connect wallet");
      // reset minimal state
      set({ walletAddress: null, authToken: null, authExpiry: null, provider: null });
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnectWallet: () => {
    try {
      set({ walletAddress: null, authToken: null, authExpiry: null, provider: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("wallet_name");
        localStorage.removeItem("wallet_address");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_expiry");
      }
      console.log("[wallet] disconnected");
    } catch (e) {
      console.error("[wallet] disconnect error", e);
    }
  },
}));

// Simple Base58 encoder (Bitcoin alphabet) for Uint8Array
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58Encode(buffer: Uint8Array): string {
  if (buffer.length === 0) return "";
  // Count leading zeros
  let zeros = 0;
  while (zeros < buffer.length && buffer[zeros] === 0) zeros++;

  // Convert base-256 digits to base-58
  const digits: number[] = [0];
  for (let i = zeros; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      const x = (digits[j] << 8) + carry; // digits[j] * 256 + carry
      digits[j] = x % 58;
      carry = (x / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  // Add leading zeros as '1'
  let result = "";
  for (let i = 0; i < zeros; i++) result += "1";
  // Convert digits to a string (most significant digit first)
  for (let i = digits.length - 1; i >= 0; i--) result += ALPHABET[digits[i]];
  return result;
}

export function initWalletStore() {
  try {
    if (typeof window === "undefined") return;
    const walletName = localStorage.getItem("wallet_name");
    const { authToken, authExpiry } = getAuthToken();

    if (walletName) {
      const provider = getWalletProvider(walletName);
      if (!provider) return;

      // Try to (re)connect quickly. If it fails, keep going silently.
      (async () => {
        try {
          const phantom = provider as Partial<PhantomProvider>;
          const res = await (phantom.connect
            ? phantom.connect({ onlyIfTrusted: true })
            : (provider as any).connect());
          const walletAddress = res.publicKey.toBase58();
          useWalletStore.setState({ provider, walletAddress });

          // If we already have a valid token, load it
          if (authToken && authExpiry && authExpiry > Date.now()) {
            useWalletStore.setState({ authToken, authExpiry });
          }
        } catch (e) {
          console.warn("[wallet] auto-connect skipped", e);
        }
      })();
    }
  } catch (e) {
    console.error("[wallet] init failed", e);
  }
}
