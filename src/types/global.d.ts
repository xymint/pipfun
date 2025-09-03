import type { BackpackProvider, PhantomProvider, SolflareProvider } from "@/adapters/wallet";

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    backpack?: { solana?: BackpackProvider };
    solflare?: SolflareProvider;
  }
}

export {};
