import { create } from "zustand";
import type { WalletProvider, PhantomProvider } from "@/adapters/wallet";
import { getWalletProvider } from "@/adapters/wallet";
import { isMobile } from "@/utils/device";
import { issueAuthToken, getAuthToken, extendAuthToken } from "@/services/auth";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { useToastStore } from "@/store/toastStore";

type WalletState = {
  isConnecting: boolean;
  walletAddress: string | null;
  authToken: string | null;
  authExpiry: number | null;
  provider: WalletProvider | null;
  deeplinkActionData: { action: string; data: { signature: string; context: string | null } } | null;

  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  clearDeeplinkActionData: () => void;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnecting: false,
  walletAddress: null,
  authToken: null,
  authExpiry: null,
  provider: null,
  deeplinkActionData: null,

  connectWallet: async (walletName: string) => {
    try {
      set({ isConnecting: true });

      const provider = getWalletProvider(walletName);
      if (!provider) {
        try { useToastStore.getState().show(`${walletName} wallet not found`, "warn"); } catch {}
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
      const message = `No passwords are required.  “Confirm” only proves that this wallet is owned by you.  This request will not trigger any blockchain transaction and will not cost any fees. (${new Date().toISOString()})`;
      const encodedMessage = new TextEncoder().encode(message);
      // Store for mobile deeplink callback
      try {
        localStorage.setItem("phantom_deeplink_wallet_address", walletAddress);
        localStorage.setItem("phantom_deeplink_signing_message", message);
      } catch {}
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
      try { useToastStore.getState().show("wallet connected", "success"); } catch {}

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
      try { useToastStore.getState().show("failed to connect wallet", "error"); } catch {}
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
    } catch (e) {
      console.error("[wallet] disconnect error", e);
    }
  },
  clearDeeplinkActionData: () => set({ deeplinkActionData: null }),
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
    // Handle Phantom mobile deeplink callbacks early
    if (handlePhantomDeeplinkSignMessage()) return;
    if (handlePhantomDeeplinkSignAndSend()) return;
    if (handlePhantomDeeplinkConnect()) return;
    const walletName = localStorage.getItem("wallet_name");
    const { authToken, authExpiry } = getAuthToken();
    const storedWalletAddress = localStorage.getItem("wallet_address");

    // Mobile fast-path: if we already have a valid session, don't trigger deeplink connect
    if (isMobile() && walletName && storedWalletAddress && authToken && authExpiry && authExpiry > Date.now()) {
      const provider = getWalletProvider(walletName);
      useWalletStore.setState({
        provider: provider || null,
        walletAddress: storedWalletAddress,
        authToken,
        authExpiry,
      });
      return;
    }

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

// Minimal Phantom mobile deeplink connect handler
function handlePhantomDeeplinkConnect(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("phantom_action");
    if (action !== "connect") return false;

    // Clean URL
    const url = new URL(window.location.href);
    const phantomPublicKeyFromUrl = url.searchParams.get("phantom_encryption_public_key");
    url.searchParams.delete("phantom_encryption_public_key");
    url.searchParams.delete("nonce");
    url.searchParams.delete("data");
    url.searchParams.delete("errorCode");
    url.searchParams.delete("errorMessage");
    url.searchParams.delete("phantom_action");
    window.history.replaceState({}, document.title, url.toString());

    // Error callback
    const errorCode = params.get("errorCode");
    if (errorCode) {
      const errorMessage = params.get("errorMessage");
      console.error("[deeplink] error callback:", { errorCode, errorMessage });
      return true;
    }

    const nonceB58 = params.get("nonce");
    const dataB58 = params.get("data");
    if (!nonceB58 || !dataB58 || !phantomPublicKeyFromUrl) {
      console.error("[deeplink] missing params for connect");
      return true;
    }

    const dappSecretKeyBs58 = localStorage.getItem("dapp_encryption_secret_key");
    if (!dappSecretKeyBs58) {
      console.error("[deeplink] dapp secret key not found");
      return true;
    }

    const sharedSecret = nacl.box.before(
      bs58.decode(phantomPublicKeyFromUrl),
      bs58.decode(dappSecretKeyBs58)
    );
    const decrypted = nacl.box.open.after(
      bs58.decode(dataB58),
      bs58.decode(nonceB58),
      sharedSecret
    );
    if (!decrypted) {
      console.error("[deeplink] failed to decrypt data");
      return true;
    }

    const sessionData = JSON.parse(new TextDecoder().decode(decrypted)) as {
      public_key: string;
      session: string;
    };
    const walletAddress = sessionData.public_key;
    const session = sessionData.session;
    if (!walletAddress || !session) {
      console.error("[deeplink] invalid session data");
      return true;
    }

    // Persist session keys for later actions
    localStorage.setItem("phantom_deeplink_session", session);
    localStorage.setItem("phantom_deeplink_encryption_public_key", phantomPublicKeyFromUrl);

    // Issue auth token with bypass signature (mobile connect)
    const BYPASS_SIGNATURE = "phantom-mobile-deeplink-bypass-signature-v1";
    const DUMMY_MESSAGE = "mobile deeplink connection";

    (async () => {
      try {
        const { authToken, authExpiry } = await issueAuthToken(
          walletAddress,
          BYPASS_SIGNATURE,
          DUMMY_MESSAGE
        );
        useWalletStore.setState({
          walletAddress,
          authToken,
          authExpiry: Number(authExpiry),
          provider: getWalletProvider("Phantom"),
        });
        localStorage.setItem("wallet_name", "Phantom");
        localStorage.setItem("wallet_address", walletAddress);
        localStorage.setItem("auth_token", authToken);
        localStorage.setItem("auth_expiry", String(authExpiry));
      } catch (e) {
        console.error("[deeplink] failed to issue auth token", e);
      }
    })();

    return true;
  } catch (e) {
    console.error("[deeplink] connect handling failed", e);
    return true;
  }
}

// Minimal Phantom mobile deeplink signMessage handler
function handlePhantomDeeplinkSignMessage(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("phantom_action");
    if (action !== "signMessage") return false;

    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete("phantom_encryption_public_key");
    url.searchParams.delete("nonce");
    url.searchParams.delete("data");
    url.searchParams.delete("errorCode");
    url.searchParams.delete("errorMessage");
    url.searchParams.delete("phantom_action");
    window.history.replaceState({}, document.title, url.toString());

    // Error callback
    const errorCode = params.get("errorCode");
    if (errorCode) {
      const errorMessage = params.get("errorMessage");
      console.error("[deeplink] signMessage error:", { errorCode, errorMessage });
      return true;
    }

    const nonceB58 = params.get("nonce");
    const dataB58 = params.get("data");
    if (!nonceB58 || !dataB58) {
      console.error("[deeplink] missing params for signMessage");
      return true;
    }

    const dappSecretKeyBs58 = localStorage.getItem("dapp_encryption_secret_key");
    const phantomPubB58 = localStorage.getItem("phantom_deeplink_encryption_public_key");
    if (!dappSecretKeyBs58 || !phantomPubB58) {
      console.error("[deeplink] missing keys for signMessage");
      return true;
    }

    const sharedSecret = nacl.box.before(
      bs58.decode(phantomPubB58),
      bs58.decode(dappSecretKeyBs58)
    );
    const decrypted = nacl.box.open.after(
      bs58.decode(dataB58),
      bs58.decode(nonceB58),
      sharedSecret
    );
    if (!decrypted) {
      console.error("[deeplink] failed to decrypt signMessage data");
      return true;
    }

    const sessionData = JSON.parse(new TextDecoder().decode(decrypted)) as { signature: string };
    const signature = sessionData.signature;
    const walletAddress = localStorage.getItem("phantom_deeplink_wallet_address");
    const message = localStorage.getItem("phantom_deeplink_signing_message");
    if (!signature || !walletAddress || !message) {
      console.error("[deeplink] missing signature/wallet/message for signMessage");
      return true;
    }

    (async () => {
      try {
        const { authToken, authExpiry } = await issueAuthToken(walletAddress, signature, message);
        useWalletStore.setState({
          walletAddress,
          authToken,
          authExpiry: Number(authExpiry),
          provider: getWalletProvider("Phantom"),
        });
        // Clean up temp keys
        localStorage.removeItem("phantom_deeplink_wallet_address");
        localStorage.removeItem("phantom_deeplink_signing_message");
      } catch (e) {
        console.error("[deeplink] failed to issue token from signMessage", e);
      }
    })();

    return true;
  } catch (e) {
    console.error("[deeplink] signMessage handling failed", e);
    return true;
  }
}

// Minimal signAndSendTransaction callback handler: captures signature + optional context
function handlePhantomDeeplinkSignAndSend(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("phantom_action");
    if (action !== "signAndSendTransaction") return false;

    const context = params.get("context");

    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete("phantom_encryption_public_key");
    url.searchParams.delete("nonce");
    url.searchParams.delete("data");
    url.searchParams.delete("errorCode");
    url.searchParams.delete("errorMessage");
    url.searchParams.delete("phantom_action");
    url.searchParams.delete("context");
    window.history.replaceState({}, document.title, url.toString());

    // Error
    const errorCode = params.get("errorCode");
    if (errorCode) {
      const errorMessage = params.get("errorMessage");
      try { useToastStore.getState().show(`${errorMessage}`, "error"); } catch {}
      // console.error("[deeplink] signAndSend error:", { errorCode, errorMessage });
      // Mark as handled; UI flow can interpret absence of signature as failure
      return true;
    }

    const nonceB58 = params.get("nonce");
    const dataB58 = params.get("data");
    if (!nonceB58 || !dataB58) {
      try { useToastStore.getState().show("missing params for signAndSend", "error"); } catch {}
      // console.error("[deeplink] missing params for signAndSend");
      return true;
    }

    const dappSecretKeyBs58 = localStorage.getItem("dapp_encryption_secret_key");
    const phantomPubB58 = localStorage.getItem("phantom_deeplink_encryption_public_key");
    if (!dappSecretKeyBs58 || !phantomPubB58) {
      try { useToastStore.getState().show("missing keys for signAndSend", "error"); } catch {}
      // console.error("[deeplink] missing keys for signAndSend");
      return true;
    }

    const sharedSecret = nacl.box.before(
      bs58.decode(phantomPubB58),
      bs58.decode(dappSecretKeyBs58)
    );
    const decrypted = nacl.box.open.after(
      bs58.decode(dataB58),
      bs58.decode(nonceB58),
      sharedSecret
    );
    if (!decrypted) {
      try { useToastStore.getState().show("failed to decrypt signAndSend data", "error"); } catch {}
      // console.error("[deeplink] failed to decrypt signAndSend data");
      return true;
    }

    const sessionData = JSON.parse(new TextDecoder().decode(decrypted)) as { signature: string };
    const signature = sessionData.signature;
    if (!signature) {
      try { useToastStore.getState().show("signature missing in signAndSend", "error"); } catch {}
      // console.error("[deeplink] signature missing in signAndSend");
      return true;
    }

    // Surface the result to app state for whoever initiated the flow to consume
    useWalletStore.setState({
      deeplinkActionData: { action: "signAndSendTransaction", data: { signature, context } },
    });

    return true;
  } catch (e) {
    try { useToastStore.getState().show("signAndSend handling failed", "error"); } catch {}
    // console.error("[deeplink] signAndSend handling failed", e);
    return true;
  }
}
