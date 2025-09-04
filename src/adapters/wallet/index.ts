// Wallet provider types and factory for pipfun

// Minimal structural types to avoid external deps for now
export type PublicKey = {
  toBase58: () => string;
};

export type Transaction = unknown;
export type VersionedTransaction = unknown;

// Phantom wallet provider type
export type PhantomProvider = {
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[]
  ) => Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    context?: string
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
};

// Backpack wallet provider type
export type BackpackProvider = {
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[]
  ) => Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    context?: string
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
};

// Solflare wallet provider type
export type SolflareProvider = {
  publicKey: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[]
  ) => Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    context?: string
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
};

export type WalletProvider = PhantomProvider | BackpackProvider | SolflareProvider;

export function getWalletProvider(walletName?: string | null): WalletProvider | null {
  if (!walletName) {
    console.info("[wallet] no wallet name provided");
    return null;
  }

  const name = walletName.toLowerCase();

  switch (name) {
    case "phantom": {
      // Mobile-friendly: if deeplink env is present, return mobile adapter
      try {
        const isMobile = (() => {
          if (typeof window === "undefined") return false;
          const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
          return /android|iphone|ipad|ipod|iemobile|blackberry|opera mini/i.test(ua);
        })();

        if (isMobile) {
          // Lazy import to avoid bundling in desktop path
          const { phantomMobileAdapter } = require("./phantomMobileAdapter");
          return phantomMobileAdapter.provider();
        }
      } catch {}

      const p = (window as any)?.phantom?.solana as PhantomProvider | undefined;
      if (!p) {
        console.info("[wallet] phantom wallet not found");
        return null;
      }
      return p;
    }
    case "backpack": {
      const b = (window as any)?.backpack?.solana as BackpackProvider | undefined;
      if (!b) {
        console.info("[wallet] backpack wallet not found");
        return null;
      }
      return b;
    }
    case "solflare": {
      const s = (window as any)?.solflare as SolflareProvider | undefined;
      if (!s) {
        console.info("[wallet] solflare wallet not found");
        return null;
      }
      return s;
    }
    default:
      console.info(`[wallet] unsupported wallet: ${walletName}`);
      return null;
  }
}
