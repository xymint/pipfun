"use client";
import { useEffect } from "react";
import { initWalletStore } from "@/store/walletStore";

export default function WalletInitializer() {
  useEffect(() => {
    initWalletStore();
  }, []);
  return null;
}
